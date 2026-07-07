import { Link } from '@inertiajs/react';
import SecurityLeadLayout from '../../Layouts/SecurityLeadLayout';

declare function route(name: string, params?: unknown): string;

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

interface TeamUser {
    id: number;
    name: string;
    role: string;
}

interface Props {
    teamUsers: TeamUser[];
}

export default function SecurityLeadTeam({ teamUsers }: Props) {
    const pmUsers = teamUsers.filter(u => u.role === 'property_manager');
    const workerUsers = teamUsers.filter(u => u.role !== 'property_manager');

    return (
        <SecurityLeadLayout title="Csapat">
            {/* Hero */}
            <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                <div className="relative z-10 px-8 py-8 flex items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Biztonsági Vezető Portál</p>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Csapat</h1>
                        <p className="text-slate-400 mt-1 text-sm">Kapcsolattartás a saját dolgozóiddal és a PM-mel</p>
                    </div>
                    <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                        <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                </div>
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.038, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
            </div>

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
        </SecurityLeadLayout>
    );
}
