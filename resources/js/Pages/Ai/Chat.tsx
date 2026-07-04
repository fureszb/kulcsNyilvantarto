import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import AppLayout from '../../Layouts/AppLayout';

marked.setOptions({ breaks: true, gfm: true });

// Az asszisztens Markdownban válaszol (félkövér, dőlt, felsorolás, táblázat…)
// — biztonságosan renderelve (XSS ellen DOMPurify)
function renderMarkdown(content: string): { __html: string } {
    const html = marked.parse(content, { async: false }) as string;
    return {
        __html: DOMPurify.sanitize(html, {
            ALLOWED_TAGS: [
                'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'mark',
                'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr',
                'h1', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a',
            ],
            ALLOWED_ATTR: ['href', 'target', 'rel'],
        }),
    };
}

declare function route(name: string, params?: unknown): string;

interface AiDoc {
    id: number;
    original_name: string;
    status: 'pending' | 'processing' | 'ready' | 'failed';
    chunk_count: number;
    size_bytes: number;
    error_message: string | null;
    created_at: string;
}

interface ChatSession {
    id: number;
    title: string;
    updated_at: string;
}

interface Props {
    documents: AiDoc[];
    sessions: ChatSession[];
    isAdmin: boolean;
    kbReady: boolean;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
    phase?: number; // 1-3: gondolkodási fázis, amíg nincs válasz-token
}

const PHASES = [
    'Kérdés feldolgozása',
    'Keresés a dokumentumokban',
    'Válasz megfogalmazása',
];

function PhaseIndicator({ phase }: { phase: number }) {
    return (
        <div className="py-1 space-y-2.5" role="status" aria-live="polite">
            {PHASES.map((label, i) => {
                const step = i + 1;
                const done = phase > step;
                const active = phase === step;
                return (
                    <div key={label} className="ai-phase-step flex items-center gap-2.5" style={{ animationDelay: `${i * 80}ms` }}>
                        <span className={`relative flex items-center justify-center w-5 h-5 rounded-full shrink-0 transition-colors duration-300 ${
                            done ? 'bg-blue-500' : active ? 'bg-blue-100' : 'bg-slate-100'
                        }`}>
                            {done ? (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                                </svg>
                            ) : (
                                <span className={`w-2 h-2 rounded-full ${active ? 'bg-blue-500 ai-phase-dot-active' : 'bg-slate-300'}`}/>
                            )}
                        </span>
                        <span className={`text-xs font-medium transition-colors duration-300 ${
                            done ? 'text-slate-400 line-through decoration-slate-300' : active ? 'ai-phase-shimmer' : 'text-slate-300'
                        }`}>
                            {step}. {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

const STATUS_LABEL: Record<AiDoc['status'], { text: string; cls: string }> = {
    pending:    { text: 'Várakozik',    cls: 'bg-slate-100 text-slate-600' },
    processing: { text: 'Feldolgozás…', cls: 'bg-blue-100 text-blue-700' },
    ready:      { text: 'Kész',         cls: 'bg-emerald-100 text-emerald-700' },
    failed:     { text: 'Hiba',         cls: 'bg-rose-100 text-rose-700' },
};

function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB';
    return bytes + ' B';
}

function getXsrfToken(): string {
    return decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '');
}

export default function AiChat({ documents, sessions, isAdmin, kbReady }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [question, setQuestion] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
    const [loadingSessionId, setLoadingSessionId] = useState<number | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [uploadPercent, setUploadPercent] = useState<number | null>(null);

    // Hang-asszisztens állapot
    type VoiceStatus = 'idle' | 'greeting' | 'listening' | 'thinking' | 'speaking';
    const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const voiceOnRef = useRef(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    const hasReadyDocs = kbReady || documents.some(d => d.status === 'ready');
    const hasInFlight = isAdmin && documents.some(d => d.status === 'pending' || d.status === 'processing');

    // Feldolgozás alatt lévő dokumentumok státuszának frissítése
    useEffect(() => {
        if (!hasInFlight) return;
        const t = setInterval(() => {
            router.reload({ only: ['documents'] });
        }, 4000);
        return () => clearInterval(t);
    }, [hasInFlight]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => () => {
        abortRef.current?.abort();
        voiceOnRef.current = false;
        try { recognitionRef.current?.abort(); } catch { /* már leállt */ }
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }, []);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        setUploadPercent(0);
        router.post(route('ai.documents.store'), { file }, {
            forceFormData: true,
            preserveScroll: true,
            onProgress: p => setUploadPercent(p?.percentage ?? 0),
            onFinish: () => {
                setUploadPercent(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    }

    async function loadSession(id: number) {
        if (streaming) return;
        setLoadingSessionId(id);
        setChatError(null);
        try {
            const res = await fetch(route('ai.sessions.show', { session: id }), {
                headers: { 'Accept': 'application/json', 'X-XSRF-TOKEN': getXsrfToken() },
            });
            if (!res.ok) throw new Error('A beszélgetés betöltése sikertelen.');
            const data = await res.json();
            setMessages(data.messages.map((m: { role: 'user' | 'assistant'; content: string; sources: string[] | null }) => ({
                role: m.role,
                content: m.content,
                sources: m.sources ?? undefined,
            })));
            setActiveSessionId(id);
        } catch (err) {
            setChatError((err as Error).message);
        } finally {
            setLoadingSessionId(null);
        }
    }

    function newChat() {
        if (streaming) return;
        setMessages([]);
        setActiveSessionId(null);
        setChatError(null);
    }

    function deleteSession(s: ChatSession, e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm(`Törli a(z) "${s.title}" beszélgetést?`)) return;
        router.delete(route('ai.sessions.destroy', { session: s.id }), {
            preserveScroll: true,
            onSuccess: () => { if (activeSessionId === s.id) newChat(); },
        });
    }

    function deleteDocument(doc: AiDoc) {
        if (!confirm(`Biztosan törli a(z) "${doc.original_name}" dokumentumot?`)) return;
        setDeletingId(doc.id);
        router.delete(route('ai.documents.destroy', { document: doc.id }), {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    }

    // ── Hang-asszisztens (Web Speech API: felismerés + felolvasás) ─────────
    const speechSupported =
        typeof window !== 'undefined' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) &&
        'speechSynthesis' in window;

    function pickHungarianVoice(): SpeechSynthesisVoice | null {
        return window.speechSynthesis.getVoices()
            .find(v => v.lang.toLowerCase().startsWith('hu')) ?? null;
    }

    function speak(text: string): Promise<void> {
        return new Promise(resolve => {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'hu-HU';
            const voice = pickHungarianVoice();
            if (voice) u.voice = voice;
            u.rate = 1.05;
            let done = false;
            const finish = () => { if (!done) { done = true; clearTimeout(guard); resolve(); } };
            u.onend = finish;
            u.onerror = finish;
            // Biztonsági timeout: ha a böngésző TTS-e nem jelez vissza,
            // a hang-loop akkor se akadjon meg (~13 karakter/mp + ráhagyás)
            const guard = setTimeout(finish, Math.min(60000, 3000 + text.length * 80));
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(u);
        });
    }

    /** Markdown → felolvasható tiszta szöveg */
    function stripForSpeech(md: string): string {
        return md
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/[*_#`>~|]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /** Egy kérdés meghallgatása; a felismert szöveggel (vagy null-lal) tér vissza. */
    function listenOnce(): Promise<string | null> {
        return new Promise(resolve => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const rec = new SR();
            recognitionRef.current = rec;
            rec.lang = 'hu-HU';
            rec.interimResults = true;
            rec.continuous = false;
            let finalText = '';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rec.onresult = (ev: any) => {
                let interim = '';
                for (let i = ev.resultIndex; i < ev.results.length; i++) {
                    const t = ev.results[i][0].transcript;
                    if (ev.results[i].isFinal) finalText += t;
                    else interim += t;
                }
                setVoiceTranscript(finalText || interim);
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rec.onerror = (ev: any) => {
                if (ev.error === 'not-allowed') {
                    setChatError('A mikrofon használata nincs engedélyezve a böngészőben.');
                }
                resolve(null);
            };
            rec.onend = () => resolve(finalText.trim() || null);
            rec.start();
        });
    }

    async function voiceLoop() {
        setVoiceStatus('greeting');
        await speak('Üdvözlöm! Miben segíthetek? Hallgatom a kérdését.');

        while (voiceOnRef.current) {
            setVoiceStatus('listening');
            setVoiceTranscript('');
            const q = await listenOnce();
            if (!voiceOnRef.current) break;

            if (!q) {
                setVoiceStatus('speaking');
                await speak('Nem hallottam kérdést. A mikrofon gombbal bármikor újra próbálkozhat.');
                break;
            }

            setVoiceStatus('thinking');
            const answer = await submitQuestion(q);
            if (!voiceOnRef.current) break;

            if (answer) {
                setVoiceStatus('speaking');
                await speak(stripForSpeech(answer));
            }
        }
        stopVoice();
    }

    function startVoice() {
        if (!speechSupported) {
            setChatError('Ez a böngésző nem támogatja a hangfelismerést — használjon Chrome vagy Edge böngészőt.');
            return;
        }
        if (streaming || voiceOnRef.current) return;
        setChatError(null);
        voiceOnRef.current = true;
        window.speechSynthesis.getVoices(); // hangok előtöltése
        void voiceLoop();
    }

    function stopVoice() {
        voiceOnRef.current = false;
        try { recognitionRef.current?.abort(); } catch { /* már leállt */ }
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        setVoiceStatus('idle');
        setVoiceTranscript('');
    }

    function ask(e: React.FormEvent) {
        e.preventDefault();
        const q = question.trim();
        if (!q || streaming) return;
        setQuestion('');
        void submitQuestion(q);
    }

    /** Kérdés elküldése; a teljes válaszszöveggel tér vissza (hang-módhoz). */
    async function submitQuestion(q: string): Promise<string> {
        if (!q || streaming) return '';

        let fullAnswer = '';
        setChatError(null);
        setStreaming(true);

        const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
        setMessages(prev => [...prev, { role: 'user', content: q }, { role: 'assistant', content: '' }]);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const response = await fetch(route('ai.chat.stream'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                body: JSON.stringify({ question: q, history, session_id: activeSessionId }),
                signal: controller.signal,
            });

            if (!response.ok || !response.body) {
                throw new Error('Az AI szolgáltatás jelenleg nem érhető el.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                // A sorvég lehet \n vagy \r\n (sse-starlette \r\n-t küld)
                const events = buffer.split(/\r?\n\r?\n/);
                buffer = events.pop() ?? '';

                for (const raw of events) {
                    const event = raw.match(/^event: (.+?)\r?$/m)?.[1] ?? 'message';
                    // Többsoros data mezők összefűzése (SSE spec)
                    const data = [...raw.matchAll(/^data: (.*?)\r?$/gm)].map(m => m[1]).join('\n');

                    if (event === 'session') {
                        const id = parseInt(data, 10);
                        if (!Number.isNaN(id)) setActiveSessionId(id);
                    } else if (event === 'phase') {
                        const phase = parseInt(data, 10);
                        setMessages(prev => {
                            const next = [...prev];
                            const last = next[next.length - 1];
                            next[next.length - 1] = { ...last, phase };
                            return next;
                        });
                    } else if (event === 'token') {
                        fullAnswer += data;
                        setMessages(prev => {
                            const next = [...prev];
                            const last = next[next.length - 1];
                            next[next.length - 1] = { ...last, content: last.content + data };
                            return next;
                        });
                    } else if (event === 'sources') {
                        try {
                            const sources = JSON.parse(data) as string[];
                            setMessages(prev => {
                                const next = [...prev];
                                const last = next[next.length - 1];
                                next[next.length - 1] = { ...last, sources };
                                return next;
                            });
                        } catch { /* nem kritikus */ }
                    } else if (event === 'error') {
                        throw new Error(data || 'Belső hiba történt.');
                    }
                }
            }
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                setChatError((err as Error).message);
                // Üres asszisztens-buborék eltávolítása hiba esetén
                setMessages(prev =>
                    prev[prev.length - 1]?.role === 'assistant' && prev[prev.length - 1].content === ''
                        ? prev.slice(0, -1)
                        : prev
                );
            }
        } finally {
            setStreaming(false);
            abortRef.current = null;
            // Beszélgetéslista frissítése (új session címe / sorrend)
            router.reload({ only: ['sessions'] });
        }
        return fullAnswer;
    }

    return (
        <AppLayout title="AI Asszisztens">
            <div className="mb-6 flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0" aria-hidden="true">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">AI Asszisztens</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {isAdmin
                            ? 'Töltse fel a vállalati dokumentumokat a központi tudásbázisba — a kollégák ezekből kérdezhetnek.'
                            : 'Kérdezzen az asszisztenstől — a vállalati tudásbázis alapján válaszol.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dokumentumok — cégszintű tudásbázis, csak admin kezeli/látja */}
                <div className="lg:col-span-1">
                    {isAdmin && (
                    <div className="ai-card bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-700">Központi tudásbázis</h2>
                            <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${uploadPercent !== null ? 'bg-slate-200 text-slate-400 cursor-wait' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                                Feltöltés
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx,.xlsx,.txt"
                                    className="hidden"
                                    disabled={uploadPercent !== null}
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {uploadPercent !== null && (
                            <div className="px-4 py-2">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${uploadPercent}%` }} />
                                </div>
                            </div>
                        )}

                        <ul className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                            {documents.length === 0 && (
                                <li className="px-4 py-8 text-center text-sm text-slate-400">
                                    Még nincs feltöltött dokumentum.<br />
                                    Támogatott: PDF, DOCX, XLSX, TXT (max 20 MB).
                                </li>
                            )}
                            {documents.map(doc => {
                                const status = STATUS_LABEL[doc.status];
                                return (
                                    <li key={doc.id} className="px-4 py-3 flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-slate-800 truncate" title={doc.original_name}>{doc.original_name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${status.cls}`}>
                                                    {(doc.status === 'pending' || doc.status === 'processing') && (
                                                        <span className="w-2 h-2 mr-1 rounded-full bg-current animate-pulse" />
                                                    )}
                                                    {status.text}
                                                </span>
                                                <span className="text-[11px] text-slate-400">{formatBytes(doc.size_bytes)}</span>
                                                {doc.status === 'ready' && (
                                                    <span className="text-[11px] text-slate-400">{doc.chunk_count} szakasz</span>
                                                )}
                                            </div>
                                            {doc.status === 'failed' && doc.error_message && (
                                                <p className="text-[11px] text-rose-500 mt-1 line-clamp-2">{doc.error_message}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteDocument(doc)}
                                            disabled={deletingId === doc.id}
                                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                                            title="Törlés"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    )}

                    {/* Beszélgetések */}
                    <div className={`ai-card bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${isAdmin ? 'mt-6' : ''}`}>
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-700">Beszélgetések</h2>
                            <button
                                onClick={newChat}
                                disabled={streaming}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                Új beszélgetés
                            </button>
                        </div>
                        <ul className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                            {sessions.length === 0 && (
                                <li className="px-4 py-6 text-center text-sm text-slate-400">
                                    Még nincs mentett beszélgetés.
                                </li>
                            )}
                            {sessions.map(s => (
                                <li
                                    key={s.id}
                                    onClick={() => loadSession(s.id)}
                                    className={`px-4 py-2.5 flex items-center gap-2 cursor-pointer transition-colors ${
                                        activeSessionId === s.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <svg className={`w-4 h-4 shrink-0 ${activeSessionId === s.id ? 'text-blue-500' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm truncate ${activeSessionId === s.id ? 'font-semibold text-blue-700' : 'text-slate-700'}`} title={s.title}>
                                            {loadingSessionId === s.id ? 'Betöltés…' : s.title}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            {new Date(s.updated_at).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={e => deleteSession(s, e)}
                                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                        title="Beszélgetés törlése"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Chat */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/80 to-white">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                    <div className="ai-float w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                                    </div>
                                    <p className="text-sm font-medium text-slate-600">
                                        {hasReadyDocs
                                            ? 'Kérdezzen a vállalati tudásbázisból!'
                                            : isAdmin
                                                ? 'Először töltsön fel legalább egy dokumentumot.'
                                                : 'A tudásbázis még üres — kérje meg az adminisztrátort a dokumentumok feltöltésére.'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {isAdmin
                                            ? 'Az asszisztens kizárólag a feltöltött dokumentumok alapján válaszol, forrásmegjelöléssel.'
                                            : 'Az asszisztens kizárólag a vállalati tudásbázis alapján válaszol.'}
                                    </p>
                                </div>
                            )}

                            {messages.map((msg, i) => {
                                const isLast = i === messages.length - 1;
                                const isThinking = msg.role === 'assistant' && !msg.content;
                                const isStreamingThis = streaming && isLast && msg.role === 'assistant' && !!msg.content;
                                return (
                                    <div key={i} className={`ai-msg-in flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'assistant' && (
                                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 ${isThinking || isStreamingThis ? 'ai-avatar-thinking' : ''}`} aria-hidden="true">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                                                </svg>
                                            </div>
                                        )}
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm break-words ${
                                            msg.role === 'user'
                                                ? 'whitespace-pre-wrap bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md shadow-md shadow-blue-600/20'
                                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm'
                                        }`}>
                                            {isThinking ? (
                                                <PhaseIndicator phase={msg.phase ?? 1} />
                                            ) : msg.role === 'assistant' ? (
                                                <>
                                                    <div className="ai-md" dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
                                                    {isStreamingThis && <span className="ai-caret" aria-hidden="true" />}
                                                </>
                                            ) : (
                                                msg.content
                                            )}
                                            {isAdmin && msg.sources && msg.sources.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                                                    {msg.sources.map((src, si) => (
                                                        <span key={src} className="ai-chip-in inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-medium text-blue-600" style={{ animationDelay: `${si * 60}ms` }}>
                                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                                            {src}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {chatError && (
                                <div className="flex justify-center">
                                    <span className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600">{chatError}</span>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {voiceStatus !== 'idle' && (
                            <div className="ai-msg-in border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2.5 flex items-center gap-3" role="status" aria-live="polite">
                                <span className="ai-voice-bars flex items-end gap-[3px] h-4" aria-hidden="true">
                                    <span/><span/><span/><span/><span/>
                                </span>
                                <span className="text-xs font-semibold text-blue-700">
                                    {voiceStatus === 'greeting' && 'Köszöntés…'}
                                    {voiceStatus === 'listening' && 'Hallgatom a kérdését…'}
                                    {voiceStatus === 'thinking' && 'Gondolkodom…'}
                                    {voiceStatus === 'speaking' && 'Válasz felolvasása…'}
                                </span>
                                {voiceTranscript && (
                                    <span className="text-xs text-slate-600 italic truncate flex-1">„{voiceTranscript}”</span>
                                )}
                                <button
                                    type="button"
                                    onClick={stopVoice}
                                    className="ml-auto text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                                >
                                    Leállítás
                                </button>
                            </div>
                        )}

                        <form onSubmit={ask} className="border-t border-slate-100 p-3 flex gap-2 bg-white">
                            <button
                                type="button"
                                onClick={() => (voiceStatus === 'idle' ? startVoice() : stopVoice())}
                                disabled={!hasReadyDocs || streaming}
                                aria-label={voiceStatus === 'idle' ? 'Hang-asszisztens indítása' : 'Hang-asszisztens leállítása'}
                                title={voiceStatus === 'idle' ? 'Hang-asszisztens indítása' : 'Hang-asszisztens leállítása'}
                                className={`relative flex items-center justify-center w-11 h-11 rounded-xl border transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
                                    voiceStatus !== 'idle'
                                        ? 'bg-gradient-to-br from-rose-500 to-red-600 border-rose-400 text-white shadow-md shadow-rose-500/30 ai-mic-active'
                                        : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                            >
                                {voiceStatus !== 'idle' ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4 0h8M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3z"/>
                                    </svg>
                                )}
                            </button>
                            <input
                                type="text"
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                placeholder={hasReadyDocs ? 'Írja be a kérdését…' : isAdmin ? 'Előbb töltsön fel dokumentumot…' : 'A tudásbázis még üres…'}
                                maxLength={4000}
                                disabled={streaming || !hasReadyDocs}
                                aria-label="Kérdés az AI asszisztensnek"
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:shadow-md focus:shadow-blue-500/10 disabled:bg-slate-50 disabled:text-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={streaming || !question.trim() || !hasReadyDocs}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/25 transition-all duration-200 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-px active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                            >
                                {streaming ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                                )}
                                Küldés
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
