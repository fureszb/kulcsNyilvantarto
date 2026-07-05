import { useState, useRef, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';

declare function route(name: string, params?: unknown): string;

interface Message {
    id: number;
    content: string;
    created_at: string;
}

interface Thread {
    lead_id: number;
    lead_name: string;
    messages: Message[];
}

interface FeedbackItem {
    id: number;
    content: string;
    created_at: string;
    is_new: boolean;
}

interface Props {
    welcomeName: string;
    threads: Thread[];
    feedback: FeedbackItem[];
    unreadCount: number;
}

export default function DirectorMessages({ welcomeName, threads, feedback, unreadCount }: Props) {
    const [activeLead, setActiveLead] = useState<number | null>(threads[0]?.lead_id ?? null);
    const [tab, setTab] = useState<'messages' | 'feedback'>('messages');
    const { data, setData, post, processing, reset, errors } = useForm({ content: '' });
    const bottomRef = useRef<HTMLDivElement>(null);

    const activeThread = threads.find(t => t.lead_id === activeLead);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeLead, threads]);

    function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!activeLead || !data.content.trim()) return;
        post(route('director.send-message', activeLead), {
            onSuccess: () => reset('content'),
        });
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <title>Üzenetek – Területi igazgató</title>

            <header className="bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.visit(route('director.dashboard'))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        Vezérlőpult
                    </button>
                    <div>
                        <p className="text-sm font-bold">Üzenetek</p>
                        <p className="text-xs text-slate-400">{welcomeName}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Tab sor */}
                <div className="flex gap-2 mb-5">
                    <button
                        onClick={() => setTab('messages')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${tab === 'messages' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        Üzenetküldés
                    </button>
                    <button
                        onClick={() => setTab('feedback')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${tab === 'feedback' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        Névtelen visszajelzések
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {tab === 'messages' && (
                    <div className="flex gap-5 h-[calc(100vh-220px)] min-h-[400px]">
                        {/* Vezető lista */}
                        <div className="w-56 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-y-auto">
                            {threads.length === 0 ? (
                                <p className="p-4 text-xs text-slate-400">Nincs hozzárendelt vezető.</p>
                            ) : threads.map(t => (
                                <button
                                    key={t.lead_id}
                                    onClick={() => setActiveLead(t.lead_id)}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-2.5 transition-colors cursor-pointer border-b border-slate-50 last:border-0 ${activeLead === t.lead_id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-bold text-indigo-700">{t.lead_name.charAt(0)}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-xs font-semibold truncate ${activeLead === t.lead_id ? 'text-indigo-700' : 'text-slate-700'}`}>
                                            {t.lead_name}
                                        </p>
                                        <p className="text-[10px] text-slate-400">{t.messages.length} üzenet</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Thread + send form */}
                        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                            {!activeThread ? (
                                <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
                                    Válassz egy vezetőt baloldalt.
                                </div>
                            ) : (
                                <>
                                    <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-indigo-700">{activeThread.lead_name.charAt(0)}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-800">{activeThread.lead_name}</span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                                        {activeThread.messages.length === 0 ? (
                                            <p className="text-sm text-slate-400 text-center py-8">
                                                Még nincs elküldött üzenet ehhez a vezetőhöz.
                                            </p>
                                        ) : activeThread.messages.map(m => (
                                            <div key={m.id} className="flex justify-end">
                                                <div className="max-w-sm bg-indigo-600 text-white rounded-2xl rounded-tr-md px-4 py-2.5">
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                                    <p className="text-[10px] text-indigo-300 mt-1 text-right">{m.created_at}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={bottomRef} />
                                    </div>

                                    <form onSubmit={handleSend} className="border-t border-slate-100 p-4 flex gap-3">
                                        <textarea
                                            value={data.content}
                                            onChange={e => setData('content', e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as unknown as React.FormEvent); }}}
                                            placeholder="Üzenet a vezetőnek… (Enter = küld)"
                                            rows={2}
                                            className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                        <button
                                            type="submit"
                                            disabled={processing || !data.content.trim()}
                                            className="self-end px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                        >
                                            Küld
                                        </button>
                                    </form>
                                    {errors.content && <p className="px-4 pb-2 text-xs text-rose-600">{errors.content}</p>}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'feedback' && (
                    <div className="max-w-2xl space-y-3">
                        {feedback.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-400">
                                Még nem érkezett névtelen visszajelzés.
                            </div>
                        ) : feedback.map(f => (
                            <div key={f.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${f.is_new ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'}`}>
                                {f.is_new && (
                                    <span className="inline-block mb-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">Új</span>
                                )}
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{f.content}</p>
                                <p className="text-[11px] text-slate-400 mt-2">{f.created_at} · Névtelen</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
