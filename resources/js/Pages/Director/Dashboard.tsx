import { useState } from 'react';
import { router } from '@inertiajs/react';

declare function route(name: string, params?: unknown): string;

interface LocationStat {
    location_id: number;
    location_name: string;
    completion_pct: number;
    turnover_pct: number;
    score: number;
    active_workers: number;
    left_this_month: number;
    expected_per_worker: number;
}

interface Overall {
    completion_pct: number;
    turnover_pct: number;
    score: number;
    active_workers: number;
    left_this_month: number;
    location_count: number;
}

interface Lead {
    lead_id: number;
    lead_name: string;
    lead_email: string;
    locations: LocationStat[];
    overall: Overall;
}

interface Props {
    welcomeName: string;
    leads: Lead[];
}

/** Teljesítmény-pontszám szín (score: kész arány − fluktuáció). */
function scoreClasses(score: number): string {
    if (score >= 75) return 'bg-emerald-100 text-emerald-700';
    if (score >= 50) return 'bg-teal-100 text-teal-700';
    if (score >= 25) return 'bg-amber-100 text-amber-700';
    if (score >= 0) return 'bg-orange-100 text-orange-700';
    return 'bg-rose-100 text-rose-700';
}

function Bar({ label, value, tone }: { label: string; value: number; tone: string }) {
    const width = Math.max(0, Math.min(100, value));
    return (
        <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
                <span>{label}</span>
                <span className="font-semibold tabular-nums text-slate-700">{value}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
            </div>
        </div>
    );
}

export default function DirectorDashboard({ welcomeName, leads }: Props) {
    const [openId, setOpenId] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-slate-50">
            <title>Területi igazgató – Vezérlőpult</title>

            <header className="bg-slate-900 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1"/></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold leading-tight">Területi igazgató</p>
                            <p className="text-xs text-slate-400">{welcomeName}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.post(route('logout'))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        Kilépés
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Vezetők teljesítménye</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Vezetőnként az irodaházak összesített eredménye (kész arány − fluktuáció).
                        Kattints egy kártyára az irodaházankénti bontáshoz.
                    </p>
                </div>

                {leads.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                        <p className="text-sm text-slate-500">
                            Még nincs hozzád rendelve biztonsági vezető. Az adminisztrátor a
                            felhasználó-szerkesztő oldalon tudja beállítani a hozzárendeléseket.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {leads.map(lead => {
                            const open = openId === lead.lead_id;
                            const o = lead.overall;
                            return (
                                <div key={lead.lead_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <button
                                        onClick={() => setOpenId(open ? null : lead.lead_id)}
                                        className="w-full text-left p-5 hover:bg-slate-50/60 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                                                <span className="text-base font-bold text-indigo-700">{lead.lead_name.charAt(0)}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{lead.lead_name}</p>
                                                <p className="text-xs text-slate-400 truncate">{lead.lead_email}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    {o.location_count} irodaház · {o.active_workers} aktív dolgozó
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className={`inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-lg text-lg font-bold tabular-nums ${scoreClasses(o.score)}`}>
                                                    {o.score}
                                                </span>
                                                <p className="text-[10px] text-slate-400 mt-0.5">összpontszám</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            <Bar label="Készültség" value={o.completion_pct} tone="bg-gradient-to-r from-emerald-500 to-teal-500" />
                                            <Bar label="Fluktuáció" value={o.turnover_pct} tone="bg-gradient-to-r from-orange-400 to-rose-500" />
                                        </div>

                                        <div className="flex items-center justify-center gap-1 mt-3 text-[11px] font-medium text-indigo-600">
                                            {open ? 'Bezárás' : 'Irodaházankénti bontás'}
                                            <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                                        </div>
                                    </button>

                                    {open && (
                                        <div className="border-t border-slate-100 divide-y divide-slate-50">
                                            {lead.locations.length === 0 ? (
                                                <p className="px-5 py-4 text-xs text-slate-400">Nincs hozzárendelt irodaház.</p>
                                            ) : lead.locations.map(loc => (
                                                <div key={loc.location_id} className="px-5 py-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-4h.01M11 17h.01"/></svg>
                                                            <span className="text-sm font-medium text-slate-700 truncate">{loc.location_name}</span>
                                                        </div>
                                                        <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-md text-sm font-bold tabular-nums ${scoreClasses(loc.score)}`}>
                                                            {loc.score}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <Bar label="Készültség" value={loc.completion_pct} tone="bg-emerald-400" />
                                                        <Bar label="Fluktuáció" value={loc.turnover_pct} tone="bg-rose-400" />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-1.5">
                                                        {loc.active_workers} aktív dolgozó
                                                        {loc.left_this_month > 0 && ` · ${loc.left_this_month} kilépő ebben a hónapban`}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
