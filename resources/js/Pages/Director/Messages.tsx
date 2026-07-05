import { useState, useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import DirectorLayout from '../../Layouts/DirectorLayout';

declare function route(name: string, params?: unknown): string;

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

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

export default function DirectorMessages({ threads, feedback, unreadCount }: Props) {
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
        <DirectorLayout title="Üzenetek">
                {/* Hero */}
                <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 shadow-2xl"
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                    <div className="relative z-10 px-8 py-8 flex items-center justify-between gap-6">
                        <div>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Területi Igazgató Portál</p>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ animation: 'pmHeartbeat 4s ease-in-out infinite' }}>Üzenetek</h1>
                            <p className="text-slate-400 mt-1 text-sm">Közvetlen üzenetek a vezetőknek, és a névtelen dolgozói visszajelzések</p>
                        </div>
                        <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                        </div>
                    </div>
                    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.038, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
                </div>
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
        </DirectorLayout>
    );
}
