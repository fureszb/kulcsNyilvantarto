import { Fragment } from 'react';
import { Link } from '@inertiajs/react';
import { useOwnLayout } from '../../hooks/useOwnLayout';
import type { PaginatedData, SecurityDailyReport } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    reports: PaginatedData<SecurityDailyReport>;
    canCreate: boolean;
    isAdmin?: boolean;
    groupByLocation?: boolean;
}

interface ReportGroup {
    label: string;
    reports: SecurityDailyReport[];
}

function ReportRow({ report, delay }: { report: SecurityDailyReport; delay: number }) {
    const incidents = Array.isArray(report.incidents) ? report.incidents : [];
    return (
        <tr style={{ animationDelay: `${delay}ms` }} className="animate-fade-in hover:bg-rose-50/30 transition-colors duration-150">
            <td className="px-6 py-4">
                <p className="font-bold text-slate-800">{report.report_date}</p>
            </td>
            <td className="px-4 py-4 text-slate-600 hidden sm:table-cell">{report.prepared_by}</td>
            <td className="px-4 py-4 hidden md:table-cell">
                {report.taken_over_from ? (
                    <span className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{report.taken_over_from}</span>
                        {' → '}
                        <span className="font-medium text-rose-600">{report.prepared_by}</span>
                        {report.handover_time && (
                            <span className="font-mono text-slate-400"> {report.handover_time}</span>
                        )}
                    </span>
                ) : (
                    <span className="text-xs text-slate-300">–</span>
                )}
            </td>
            <td className="px-4 py-4 hidden md:table-cell">
                {incidents.length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                        {incidents.length} esemény
                    </span>
                ) : (
                    <span className="text-xs text-slate-300">–</span>
                )}
            </td>
            <td className="px-4 py-4 text-right">
                <Link
                    href={route('security.show', report.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-colors"
                >
                    Megnyitás
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                </Link>
            </td>
        </tr>
    );
}

function groupReportsByLocation(reports: SecurityDailyReport[]): ReportGroup[] {
    const groups = new Map<string, ReportGroup>();
    for (const report of reports) {
        const label = report.locations && report.locations.length > 0
            ? report.locations.map(l => l.name).join(', ')
            : 'Egyéb';
        if (!groups.has(label)) groups.set(label, { label, reports: [] });
        groups.get(label)!.reports.push(report);
    }
    return Array.from(groups.values());
}

export default function SecurityIndex({ reports, canCreate, isAdmin, groupByLocation }: Props) {
    const Layout = useOwnLayout();
    const groups = groupByLocation ? groupReportsByLocation(reports.data) : null;
    return (
        <Layout title="Napi Jelentések">
            <div className="max-w-7xl mx-auto">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div
                        className="absolute inset-0 opacity-[0.025] pointer-events-none"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
                            backgroundSize: '32px 32px',
                        }}
                    />
                    <div className="relative px-8 py-8 flex items-center justify-between gap-6 flex-wrap">
                        <div>
                            <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Biztonsági Szolgálat</p>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                {isAdmin ? 'Összes Napi Jelentés' : 'Saját szolgálati lapok'}
                            </h1>
                            <p className="text-slate-400 mt-1 text-sm">
                                {isAdmin ? 'Minden rögzített napi jelentés' : 'Azok a jelentések, amelyekhez hozzáférése van'}
                            </p>
                        </div>
                        {canCreate && (
                            <Link
                                href={route('security.create')}
                                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                                </svg>
                                Új jelentés
                            </Link>
                        )}
                    </div>
                </div>

                {/* Lista */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {reports.data.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                            </div>
                            <p className="text-slate-500 font-medium">
                                {isAdmin
                                    ? 'Még nincs rögzített napi jelentés.'
                                    : 'Önnek jelenleg nem lett megosztva egyetlen napi jelentés sem.'}
                            </p>
                            {isAdmin && (
                                <Link
                                    href={route('security.create')}
                                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                                >
                                    Első jelentés létrehozása
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dátum</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Készítette</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Átadás</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Rendkívüli</th>
                                        <th className="px-4 py-3 w-16" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {groups ? groups.map(group => (
                                        <Fragment key={group.label}>
                                            <tr className="bg-slate-50/80">
                                                <td colSpan={5} className="px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                    {group.label}
                                                    <span className="ml-1.5 font-normal normal-case text-slate-400">({group.reports.length})</span>
                                                </td>
                                            </tr>
                                            {group.reports.map((report, i) => (
                                                <ReportRow key={report.id} report={report} delay={i * 40} />
                                            ))}
                                        </Fragment>
                                    )) : reports.data.map((report, i) => (
                                        <ReportRow key={report.id} report={report} delay={i * 40} />
                                    ))}
                                </tbody>
                            </table>
                            {reports.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-1 flex-wrap">
                                    {reports.links.map((link, i) => (
                                        link.url ? (
                                            <Link
                                                key={i}
                                                href={link.url}
                                                className={`min-w-[2.25rem] h-9 px-3 flex items-center justify-center rounded-xl text-sm font-medium border transition-colors ${
                                                    link.active
                                                        ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-700'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={i}
                                                className="min-w-[2.25rem] h-9 px-3 flex items-center justify-center rounded-xl text-sm font-medium border border-slate-100 text-slate-300 bg-white"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
