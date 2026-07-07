import { useState } from 'react';
import { router } from '@inertiajs/react';

declare function route(name: string, params?: unknown): string;

interface FeedbackItem {
    id: number;
    content: string;
    created_at: string;
    is_read: boolean;
}

/** Névtelen visszajelzés gomb — bármely szerepkör fejlécében elhelyezhető.
 *  Küldés + a saját korábbi bejelentések megtekintése egy kompakt modalban. */
export default function FeedbackWidget() {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<'new' | 'history'>('new');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<FeedbackItem[] | null>(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    function openModal() {
        setOpen(true);
        setTab('new');
    }

    function loadHistory() {
        setTab('history');
        if (history !== null || loadingHistory) return;
        setLoadingHistory(true);
        fetch(route('feedback.index'), { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
            .then(r => r.json())
            .then(data => setHistory(data.feedback ?? []))
            .catch(() => setHistory([]))
            .finally(() => setLoadingHistory(false));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;
        setSending(true);
        router.post(route('feedback.store'), { content }, {
            preserveScroll: true,
            onSuccess: () => { setContent(''); setHistory(null); setOpen(false); },
            onFinish: () => setSending(false),
        });
    }

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                title="Névtelen visszajelzés"
                aria-label="Névtelen visszajelzés küldése"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/20 transition-all cursor-pointer shrink-0"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>

            {open && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-bold text-slate-800">Névtelen visszajelzés</h2>
                            </div>
                            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex gap-1 px-5 pt-3">
                            <button type="button" onClick={() => setTab('new')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${tab === 'new' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                                Új üzenet
                            </button>
                            <button type="button" onClick={loadHistory} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${tab === 'history' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                                Korábbi bejelentéseim
                            </button>
                        </div>

                        {tab === 'new' ? (
                            <form onSubmit={submit} className="p-5 space-y-3">
                                <p className="text-xs text-slate-500">Az üzenetedet az igazgató fogadja — a neved nem szerepel rajta.</p>
                                <textarea
                                    autoFocus
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    rows={5}
                                    placeholder="Írd le a visszajelzésedet…"
                                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !content.trim()}
                                    className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    Névtelen küldés
                                </button>
                            </form>
                        ) : (
                            <div className="p-5 max-h-80 overflow-y-auto space-y-2">
                                {loadingHistory ? (
                                    <p className="text-xs text-slate-400 text-center py-6">Betöltés…</p>
                                ) : !history || history.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center py-6">Még nem küldtél névtelen visszajelzést.</p>
                                ) : history.map(item => (
                                    <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] text-slate-400">{item.created_at}</span>
                                            {item.is_read ? (
                                                <span className="text-[10px] font-semibold text-emerald-600">Megtekintve</span>
                                            ) : (
                                                <span className="text-[10px] font-semibold text-slate-400">Még nem olvasták</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
