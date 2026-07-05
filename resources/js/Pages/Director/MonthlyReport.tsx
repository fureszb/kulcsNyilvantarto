import { router } from '@inertiajs/react';

declare function route(name: string, params?: unknown): string;

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

export default function MonthlyReport({ welcomeName, history }: Props) {
    const leads = history[history.length - 1]?.leads ?? [];

    return (
        <div className="min-h-screen bg-slate-50">
            <title>Havi riport – Területi igazgató</title>

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
                        <p className="text-sm font-bold">Havi riport</p>
                        <p className="text-xs text-slate-400">{welcomeName}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-sm text-slate-500 mb-6">
                    Pont = Készültség% − Fluktuáció%. A delta az előző hónaphoz képest.
                </p>

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
            </main>
        </div>
    );
}
