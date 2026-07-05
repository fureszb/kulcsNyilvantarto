import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';

declare function route(name: string, params?: unknown): string;

interface InboxMessage {
    id: number;
    content: string;
    from_name: string;
    created_at: string;
    is_new: boolean;
}

interface Director {
    id: number;
    name: string;
}

interface Props {
    welcomeName: string;
    messages: InboxMessage[];
    directors: Director[];
}

export default function SecurityLeadMessages({ welcomeName, messages, directors }: Props) {
    const [tab, setTab] = useState<'inbox' | 'feedback'>('inbox');
    const { data, setData, post, processing, reset, errors } = useForm({
        director_id: directors[0]?.id ?? '',
        content: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('security-lead.feedback'), {
            onSuccess: () => reset('content'),
        });
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <title>Üzenetek – Biztonsági vezető</title>

            <header className="bg-slate-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold leading-tight">Biztonsági vezető</p>
                            <p className="text-xs text-slate-400">{welcomeName}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.post(route('logout'))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Kilépés
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-2 mb-5">
                    <button
                        onClick={() => setTab('inbox')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${tab === 'inbox' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        Beérkező üzenetek
                        {messages.filter(m => m.is_new).length > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                                {messages.filter(m => m.is_new).length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setTab('feedback')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${tab === 'feedback' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        Névtelen visszajelzés
                    </button>
                </div>

                {tab === 'inbox' && (
                    <div className="space-y-3">
                        {messages.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-400">
                                Még nem érkezett üzenet az igazgatótól.
                            </div>
                        ) : messages.map(m => (
                            <div key={m.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${m.is_new ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-purple-700">{m.from_name.charAt(0)}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">{m.from_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {m.is_new && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">Új</span>
                                        )}
                                        <span className="text-[11px] text-slate-400">{m.created_at}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{m.content}</p>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'feedback' && (
                    <div className="max-w-xl">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-sm font-semibold text-slate-800 mb-1">Névtelen visszajelzés küldése</h2>
                            <p className="text-xs text-slate-500 mb-4">
                                A visszajelzésedet az igazgató fogadja, de a neved nem szerepel rajta.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {directors.length > 1 && (
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Igazgató</label>
                                        <select
                                            value={data.director_id}
                                            onChange={e => setData('director_id', Number(e.target.value))}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {directors.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Visszajelzés szövege</label>
                                    <textarea
                                        value={data.content}
                                        onChange={e => setData('content', e.target.value)}
                                        placeholder="Írd le a visszajelzésedet…"
                                        rows={5}
                                        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.content && <p className="mt-1 text-xs text-rose-600">{errors.content}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || !data.content.trim()}
                                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    Névtelen küldés
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
