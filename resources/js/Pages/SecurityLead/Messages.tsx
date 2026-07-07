import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import SecurityLeadLayout from '../../Layouts/SecurityLeadLayout';

declare function route(name: string, params?: unknown): string;

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

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

interface TeamUser {
    id: number;
    name: string;
    role: string;
}

interface Props {
    welcomeName: string;
    messages: InboxMessage[];
    directors: Director[];
    teamUsers: TeamUser[];
}

export default function SecurityLeadMessages({ messages, directors, teamUsers }: Props) {
    const [tab, setTab] = useState<'inbox' | 'feedback' | 'team'>('inbox');
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

    const pmUsers = teamUsers.filter(u => u.role === 'property_manager');
    const workerUsers = teamUsers.filter(u => u.role !== 'property_manager');

    return (
        <SecurityLeadLayout title="Váltóüzenetek">
            {/* Hero */}
            <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                <div className="relative z-10 px-8 py-8 flex items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Biztonsági Vezető Portál</p>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Váltóüzenetek</h1>
                        <p className="text-slate-400 mt-1 text-sm">Igazgatói üzenetek, névtelen visszajelzés, és kapcsolattartás a csapatoddal</p>
                    </div>
                    <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                        <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                    </div>
                </div>
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.038, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
            </div>

            <div className="flex gap-2 mb-5 flex-wrap">
                <button
                    onClick={() => setTab('inbox')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${tab === 'inbox' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    Igazgatótól kapott
                    {messages.filter(m => m.is_new).length > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                            {messages.filter(m => m.is_new).length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setTab('feedback')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${tab === 'feedback' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    Névtelen visszajelzés
                </button>
                <button
                    onClick={() => setTab('team')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${tab === 'team' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    Csapat
                </button>
            </div>

            {tab === 'inbox' && (
                <div className="space-y-3">
                    {messages.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-400">
                            Még nem érkezett üzenet az igazgatótól.
                        </div>
                    ) : messages.map(m => (
                        <div key={m.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${m.is_new ? 'border-blue-300 ring-1 ring-blue-200' : 'border-slate-200'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-purple-700">{m.from_name.charAt(0)}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700">{m.from_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {m.is_new && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Új</span>
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
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.content && <p className="mt-1 text-xs text-rose-600">{errors.content}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !data.content.trim()}
                                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Névtelen küldés
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {tab === 'team' && (
                <div className="max-w-2xl space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-800">Üzenet küldése a csapatnak</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Válaszd ki a dolgozókat vagy a PM-et, és küldj nekik üzenetet.</p>
                            </div>
                            <Link href={route('pm.messages')} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                Új üzenet
                            </Link>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500">Beérkezett üzeneteid (tőled és a csapattól)</p>
                            <Link href={route('messages.index')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Megnyitás →</Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3">Elérhető kapcsolatok</h2>
                        {pmUsers.length > 0 && (
                            <div className="mb-3">
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Property Manager</p>
                                <div className="flex flex-wrap gap-2">
                                    {pmUsers.map(u => (
                                        <span key={u.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-xs font-medium text-amber-700">{u.name}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Saját dolgozók ({workerUsers.length})</p>
                            {workerUsers.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Nincs hozzád rendelt dolgozó.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {workerUsers.map(u => (
                                        <span key={u.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">{u.name}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </SecurityLeadLayout>
    );
}
