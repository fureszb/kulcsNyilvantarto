import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import PmLayout from '../../Layouts/PmLayout';
import type { SecurityDailyReport, PaginatedData } from '../../types';

interface Props {
    reports: PaginatedData<SecurityDailyReport>;
    filters?: { date_from?: string; date_to?: string; incidents_only?: boolean };
}

export default function PmSecurity({ reports, filters }: Props) {
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo]     = useState(filters?.date_to   ?? '');
    const [incidentsOnly, setIncidentsOnly] = useState(!!filters?.incidents_only);
    const hasFilters = !!(filters?.date_from || filters?.date_to || filters?.incidents_only);

    function submitFilter(e: React.FormEvent) {
        e.preventDefault();
        const params: Record<string, string | boolean> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo)   params.date_to   = dateTo;
        if (incidentsOnly) params.incidents_only = '1';
        router.get(route('pm.security'), params as Record<string, string>, { preserveState: true });
    }

    function clearFilter() {
        setDateFrom('');
        setDateTo('');
        setIncidentsOnly(false);
        router.get(route('pm.security'), {}, { preserveState: false });
    }

    return (
        <PmLayout title="Napi Jelentések">
            <div className="max-w-6xl mx-auto">

                {/* Hero */}
                <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
                    <div className="relative px-8 py-8 flex items-center justify-between gap-6">
                        <div>
                            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Property Manager · Biztonsági Szolgálat</p>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">Napi Jelentések</h1>
                            <p className="text-slate-400 mt-1 text-sm">Összes vagyonőr napi szolgálati lapja</p>
                        </div>
                        <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                        </div>
                    </div>
                </div>

                {/* Filter form */}
                <form onSubmit={submitFilter} className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-5 mb-6">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dátumtól</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-rose-400 focus:bg-white focus:outline-none transition" />
                        </div>
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dátumig</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-rose-400 focus:bg-white focus:outline-none transition" />
                        </div>
                        <div className="flex items-center gap-3 pb-0.5">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                                <input type="checkbox" checked={incidentsOnly} onChange={e => setIncidentsOnly(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer" />
                                <span className="text-sm font-medium text-slate-700 group-hover:text-rose-600 transition-colors">Csak rendkívüli eseménnyel</span>
                            </label>
                        </div>
                        <div className="flex items-center gap-2 pb-0.5">
                            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/></svg>
                                Szűrés
                            </button>
                            {hasFilters && (
                                <button type="button" onClick={clearFilter} className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                    Törlés
                                </button>
                            )}
                        </div>
                    </div>
                    {hasFilters && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {filters?.date_from && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                                    Tól: {filters.date_from}
                                </span>
                            )}
                            {filters?.date_to && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                                    Ig: {filters.date_to}
                                </span>
                            )}
                            {filters?.incidents_only && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                                    Csak rendkívüli eseménnyel
                                </span>
                            )}
                        </div>
                    )}
                </form>

                {/* Results */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {reports.data.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </div>
                            <p className="text-slate-500 font-medium">
                                {hasFilters ? 'Nincs a szűrőnek megfelelő napi jelentés.' : 'Még nem lett napi jelentés rögzítve.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dátum</th>
                                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Készítette</th>
                                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Műszak</th>
                                            <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rendkívüli</th>
                                            <th className="px-4 py-3.5 w-24" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {reports.data.map((report) => {
                                            const hasIncident = Array.isArray(report.incidents) && report.incidents.length > 0;
                                            const dateStr = report.report_date ? new Date(report.report_date + 'T00:00:00').toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }) : '–';
                                            return (
                                                <tr key={report.id} className="hover:bg-rose-50/20 transition-colors duration-100">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-800">{dateStr}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="font-medium text-slate-700">{report.prepared_by ?? '–'}</span>
                                                    </td>
                                                    <td className="px-4 py-4 hidden md:table-cell text-slate-500 text-xs">
                                                        {report.taken_over_from ? (
                                                            <span><span className="font-medium text-slate-700">{report.taken_over_from}</span> → <span className="font-medium text-rose-600">{report.prepared_by}</span>{report.handover_time ? <span className="font-mono text-slate-400"> {report.handover_time}</span> : null}</span>
                                                        ) : '–'}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        {hasIncident ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                                                Igen
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-slate-300">–</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <Link
                                                            href={route('pm.security.show', report.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-colors whitespace-nowrap"
                                                        >
                                                            Megnyitás
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {reports.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                                    <p className="text-xs text-slate-400">Összesen: <strong className="text-slate-600">{reports.total}</strong> napi jelentés</p>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {reports.links.map((link, i) => (
                                            link.url ? (
                                                <Link key={i} href={link.url} className={`min-w-[2.25rem] h-9 px-3 flex items-center justify-center rounded-xl text-sm font-medium border transition-colors ${link.active ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                            ) : (
                                                <span key={i} className="min-w-[2.25rem] h-9 px-3 flex items-center justify-center rounded-xl text-sm font-medium border border-slate-100 text-slate-300 bg-white" dangerouslySetInnerHTML={{ __html: link.label }} />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </PmLayout>
    );
}
