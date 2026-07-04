import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

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

interface Props {
    documents: AiDoc[];
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
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

export default function AiChat({ documents }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [question, setQuestion] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [uploadPercent, setUploadPercent] = useState<number | null>(null);

    const hasReadyDocs = documents.some(d => d.status === 'ready');
    const hasInFlight = documents.some(d => d.status === 'pending' || d.status === 'processing');

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

    useEffect(() => () => abortRef.current?.abort(), []);

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

    function deleteDocument(doc: AiDoc) {
        if (!confirm(`Biztosan törli a(z) "${doc.original_name}" dokumentumot?`)) return;
        setDeletingId(doc.id);
        router.delete(route('ai.documents.destroy', { document: doc.id }), {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    }

    async function ask(e: React.FormEvent) {
        e.preventDefault();
        const q = question.trim();
        if (!q || streaming) return;

        setChatError(null);
        setQuestion('');
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
                body: JSON.stringify({ question: q, history }),
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

                    if (event === 'token') {
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
        }
    }

    return (
        <AppLayout title="AI Asszisztens">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">AI Asszisztens</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Töltsön fel dokumentumokat, majd kérdezzen rájuk — az asszisztens kizárólag az Ön saját dokumentumai alapján válaszol.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dokumentumok */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-700">Tudásbázis</h2>
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
                </div>

                {/* Chat */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[560px]">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                                    </div>
                                    <p className="text-sm font-medium text-slate-600">
                                        {hasReadyDocs
                                            ? 'Kérdezzen a feltöltött dokumentumokból!'
                                            : 'Először töltsön fel legalább egy dokumentumot.'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Az asszisztens kizárólag az Ön dokumentumai alapján válaszol, a válaszok forrásmegjelöléssel érkeznek.
                                    </p>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words ${
                                        msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-md'
                                            : 'bg-slate-100 text-slate-800 rounded-bl-md'
                                    }`}>
                                        {msg.content || (
                                            <span className="inline-flex gap-1 items-center py-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </span>
                                        )}
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1">
                                                {msg.sources.map(src => (
                                                    <span key={src} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-500">
                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                                        {src}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {chatError && (
                                <div className="flex justify-center">
                                    <span className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600">{chatError}</span>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <form onSubmit={ask} className="border-t border-slate-100 p-3 flex gap-2">
                            <input
                                type="text"
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                placeholder={hasReadyDocs ? 'Írja be a kérdését…' : 'Előbb töltsön fel dokumentumot…'}
                                maxLength={4000}
                                disabled={streaming || !hasReadyDocs}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={streaming || !question.trim() || !hasReadyDocs}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
