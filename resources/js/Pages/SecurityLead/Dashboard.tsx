import SecurityLeadLayout from '../../Layouts/SecurityLeadLayout';

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

interface Goal {
    target_completion_pct: number;
    target_turnover_pct: number;
}

interface LocationStat {
    location_id: number;
    location_name: string;
    completion_pct: number;
    turnover_pct: number;
    score: number;
    active_workers: number;
    left_this_month: number;
    expected_per_worker: number;
    goal: Goal | null;
}

interface Overall {
    completion_pct: number;
    turnover_pct: number;
    score: number;
    active_workers: number;
    left_this_month: number;
    location_count: number;
}

interface LeadData {
    lead_id: number;
    lead_name: string;
    lead_email: string;
    locations: LocationStat[];
    overall: Overall;
    goal: Goal | null;
}

interface Props {
    welcomeName: string;
    lead: LeadData;
    currentPeriod: { year: number; month: number };
}

function scoreClasses(score: number): string {
    if (score >= 75) return 'bg-emerald-100 text-emerald-700';
    if (score >= 50) return 'bg-teal-100 text-teal-700';
    if (score >= 25) return 'bg-amber-100 text-amber-700';
    if (score >= 0) return 'bg-orange-100 text-orange-700';
    return 'bg-rose-100 text-rose-700';
}

function Bar({ label, value, tone, target }: { label: string; value: number; tone: string; target?: number }) {
    const width = Math.max(0, Math.min(100, value));
    const targetPos = target !== undefined ? Math.max(0, Math.min(100, target)) : undefined;
    return (
        <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
                <span>{label}</span>
                <span className="font-semibold tabular-nums text-slate-700">
                    {value}%
                    {target !== undefined && <span className="text-slate-400 font-normal"> / cél: {target}%</span>}
                </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
                {targetPos !== undefined && (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-slate-500/60" style={{ left: `${targetPos}%` }} />
                )}
            </div>
        </div>
    );
}

export default function SecurityLeadDashboard({ lead, currentPeriod }: Props) {
    const o = lead.overall;

    return (
        <SecurityLeadLayout title="Vezérlőpult">
            {/* Hero */}
            <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                <div className="relative z-10 px-8 py-8 flex items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Biztonsági Vezető Portál</p>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Teljesítmények</h1>
                        <p className="text-slate-400 mt-1 text-sm">{currentPeriod.year}. {currentPeriod.month}. hó · {o.location_count} irodaház · {o.active_workers} aktív dolgozó</p>
                    </div>
                    <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                        <span className="text-3xl leading-none" aria-hidden="true">📈</span>
                    </div>
                </div>
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.038, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
            </div>

            {/* Összesített kártya */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-800">Összesített teljesítmény</h2>
                    {lead.goal ? (
                        <p className="text-[11px] text-slate-500">
                            Igazgatói cél: <span className="font-semibold text-slate-700">{lead.goal.target_completion_pct}%</span> kész /
                            <span className="font-semibold text-slate-700"> {lead.goal.target_turnover_pct}%</span> fluktuáció
                        </p>
                    ) : (
                        <p className="text-[11px] text-slate-400 italic">Nincs igazgatói célkitűzés beállítva</p>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Bar label="Készültség" value={o.completion_pct} tone="bg-gradient-to-r from-emerald-500 to-teal-500" target={lead.goal?.target_completion_pct} />
                    <Bar label="Fluktuáció" value={o.turnover_pct} tone="bg-gradient-to-r from-orange-400 to-rose-500" target={lead.goal?.target_turnover_pct} />
                </div>
            </div>

            {/* Irodaházankénti bontás */}
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 mt-6">Irodaházak</h2>
            {lead.locations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                    <p className="text-sm text-slate-500">Még nincs hozzád rendelve irodaház.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lead.locations.map(loc => (
                        <div key={loc.location_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-4h.01M11 17h.01"/>
                                    </svg>
                                    <span className="text-sm font-semibold text-slate-800 truncate">{loc.location_name}</span>
                                </div>
                                <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-md text-sm font-bold tabular-nums ${scoreClasses(loc.score)}`}>
                                    {loc.score}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Bar label="Készültség" value={loc.completion_pct} tone="bg-emerald-400" target={loc.goal?.target_completion_pct} />
                                <Bar label="Fluktuáció" value={loc.turnover_pct} tone="bg-rose-400" target={loc.goal?.target_turnover_pct} />
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2">
                                {loc.active_workers} aktív dolgozó
                                {loc.left_this_month > 0 && ` · ${loc.left_this_month} kilépő ebben a hónapban`}
                            </p>
                            {loc.goal ? (
                                <p className="text-[10px] text-slate-400 mt-1.5">
                                    Irodaházi cél: <span className="font-semibold text-slate-600">{loc.goal.target_completion_pct}%</span>
                                </p>
                            ) : (
                                <p className="text-[10px] text-slate-300 italic mt-1.5">Nincs irodaházi célkitűzés</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </SecurityLeadLayout>
    );
}
