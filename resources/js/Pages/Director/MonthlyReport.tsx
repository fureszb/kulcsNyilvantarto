import DirectorLayout from '../../Layouts/DirectorLayout';

declare function route(name: string, params?: unknown): string;

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

interface Overall {
    completion_pct: number;
    turnover_pct: number;
    score: number;
    active_workers: number;
    left_this_month: number;
    location_count: number;
}

interface MonthLead {
    lead_id: number;
    lead_name: string;
    overall: Overall;
    delta_score?: number;
    delta_completion?: number;
    delta_turnover?: number;
}

interface MonthEntry {
    year: number;
    month: number;
    leads: MonthLead[];
}

interface Props {
    welcomeName: string;
    history: MonthEntry[];
}

const MONTH_NAMES = ['', 'jan', 'feb', 'már', 'ápr', 'máj', 'jún', 'júl', 'aug', 'szep', 'okt', 'nov', 'dec'];

function scoreColor(score: number): string {
    if (score >= 75) return 'text-emerald-700 bg-emerald-50';
    if (score >= 50) return 'text-teal-700 bg-teal-50';
    if (score >= 25) return 'text-amber-700 bg-amber-50';
    if (score >= 0)  return 'text-orange-700 bg-orange-50';
    return 'text-rose-700 bg-rose-50';
}

function Delta({ val, invert = false }: { val?: number; invert?: boolean }) {
    if (val === undefined) return <span className="text-slate-300">—</span>;
    const positive = invert ? val < 0 : val > 0;
    const color = val === 0 ? 'text-slate-400' : positive ? 'text-emerald-600' : 'text-rose-600';
    const sign = val > 0 ? '+' : '';
    return <span className={`text-xs font-semibold ${color}`}>{sign}{val}</span>;
}

export default function MonthlyReport({ history }: Props) {
    const leads = history[history.length - 1]?.leads ?? [];

    return (
        <DirectorLayout title="Havi riport">
                {/* Hero */}
                <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 shadow-2xl"
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                    <div className="relative z-10 px-8 py-8 flex items-center justify-between gap-6">
                        <div>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Területi Igazgató Portál</p>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ animation: 'pmHeartbeat 4s ease-in-out infinite' }}>Havi riport</h1>
                            <p className="text-slate-400 mt-1 text-sm">Pont = Készültség% − Fluktuáció% · a delta az előző hónaphoz képest</p>
                        </div>
                        <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                        </div>
                    </div>
                    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.038, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
                </div>

                {leads.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
                        Még nincs biztonsági vezető hozzárendelve.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {leads.map((lead) => (
                            <div key={lead.lead_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-bold text-indigo-700">{lead.lead_name.charAt(0)}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-800">{lead.lead_name}</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500 w-28">Hónap</th>
                                                <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Pontszám</th>
                                                <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Δ pont</th>
                                                <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Készültség</th>
                                                <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Fluktuáció</th>
                                                <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500 pr-5">Dolgozók</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {history.map((entry) => {
                                                const monthLead = entry.leads.find(l => l.lead_id === lead.lead_id);
                                                if (!monthLead) return null;
                                                const o = monthLead.overall;
                                                return (
                                                    <tr key={`${entry.year}-${entry.month}`} className="hover:bg-slate-50/60">
                                                        <td className="px-5 py-2.5 text-xs text-slate-600 font-medium whitespace-nowrap">
                                                            {entry.year}. {MONTH_NAMES[entry.month]}.
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right">
                                                            <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-md text-sm font-bold tabular-nums ${scoreColor(o.score)}`}>
                                                                {o.score}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right">
                                                            <Delta val={monthLead.delta_score} />
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right text-xs tabular-nums text-slate-600">
                                                            {o.completion_pct}%
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right text-xs tabular-nums text-slate-600">
                                                            {o.turnover_pct}%
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right text-xs tabular-nums text-slate-500 pr-5">
                                                            {o.active_workers}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </DirectorLayout>
    );
}
