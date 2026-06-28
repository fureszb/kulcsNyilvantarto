import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface ExamOption {
    id: number;
    title: string;
}

interface ResultRow {
    id: number;
    exam_title: string;
    name: string;
    email?: string;
    score: number;
    total: number;
    score_percent: number;
    completed_at: string;
    tab_violations: number;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    results: Paginated<ResultRow>;
    exams: ExamOption[];
    filters: { exam_id?: string };
}

export default function AdminExamResults({ results, exams, filters }: Props) {
    const [examId, setExamId] = useState(filters.exam_id ?? '');

    function applyFilter() {
        router.get(route('admin.exam-results.index'), examId ? { exam_id: examId } : {}, { preserveState: true });
    }

    function clearFilter() {
        setExamId('');
        router.get(route('admin.exam-results.index'), {}, { preserveState: false });
    }

    return (
        <AdminLayout
            title="Vizsga kitöltések"
            headerActions={
                <Link href={route('admin.exams.index')} className="btn-secondary text-sm flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                    Vizsgák
                </Link>
            }
        >
            {/* Filter */}
            <div className="card p-4 mb-5 flex flex-wrap items-end gap-3">
                <div>
                    <label className="form-label mb-1 block">Vizsga szűrése</label>
                    <select
                        value={examId}
                        onChange={e => setExamId(e.target.value)}
                        className="form-input min-w-[220px]"
                    >
                        <option value="">Összes vizsga</option>
                        {exams.map(e => (
                            <option key={e.id} value={String(e.id)}>{e.title}</option>
                        ))}
                    </select>
                </div>
                <button onClick={applyFilter} className="btn-primary text-sm">Szűrés</button>
                {filters.exam_id && (
                    <button onClick={clearFilter} className="btn-secondary text-sm">Szűrő törlése</button>
                )}
                <span className="text-xs text-slate-400 ml-auto self-center">{results.total} kitöltés összesen</span>
            </div>

            {results.data.length === 0 ? (
                <div className="card p-12 text-center">
                    <svg className="w-12 h-12 text-slate-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-slate-500 font-medium">Nincs kitöltés.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50">
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Felhasználó</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vizsga</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Eredmény</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dátum</th>
                                        <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {results.data.map(r => {
                                        const pct         = r.score_percent;
                                        const scoreColor  = pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600';
                                        const scoreBg     = pct >= 70 ? 'bg-emerald-50 border-emerald-200' : pct >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
                                        return (
                                            <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div className="font-semibold text-slate-800">{r.name}</div>
                                                    {r.email && <div className="text-xs text-slate-400 mt-0.5">{r.email}</div>}
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-700 font-medium">{r.exam_title}</td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-extrabold ${scoreBg} ${scoreColor}`}>
                                                            {r.score}/{r.total} · {pct}%
                                                        </span>
                                                        {r.tab_violations > 0 && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold" title="Fókuszvesztések száma">
                                                                ⚠ {r.tab_violations}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-500 text-xs">{r.completed_at}</td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <Link
                                                        href={route('admin.exam-results.show', r.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                        Megtekintés
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {results.last_page > 1 && (
                        <div className="flex items-center justify-center gap-1 mt-5">
                            {results.links.map((link, i) => (
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${link.active ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-medium border bg-white text-slate-300 border-slate-200 cursor-default" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            ))}
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    );
}
