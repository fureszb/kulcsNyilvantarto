import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface Exam {
    id: number;
    title: string;
    description?: string | null;
    is_active: boolean;
    pass_score: number;
    steps_count?: number;
}

interface Props {
    exams: Exam[];
}

export default function ExamsIndex({ exams }: Props) {
    function handleDelete(exam: Exam) {
        if (!window.confirm(`Biztosan törölni akarod: ${exam.title}?`)) return;
        router.delete(route('admin.exams.destroy', exam.id));
    }

    return (
        <AdminLayout
            title="Vizsgák"
            headerActions={
                <Link
                    href={route('admin.exams.create')}
                    className="btn-primary text-sm flex items-center gap-1.5"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Új vizsga
                </Link>
            }
        >
            {exams.length === 0 ? (
                <div className="card p-12 text-center">
                    <svg className="w-12 h-12 text-amber-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p className="text-slate-500 font-medium">Még nincs vizsga.</p>
                    <Link
                        href={route('admin.exams.create')}
                        className="inline-block mt-3 text-amber-600 font-semibold hover:underline text-sm"
                    >
                        Hozd létre az első vizsgát →
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[560px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vizsga neve</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kérdések</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Állapot</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Műveletek</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {exams.map((exam) => (
                                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{exam.title}</div>
                                            {exam.description && (
                                                <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{exam.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{exam.steps_count ?? 0} kérdés</td>
                                        <td className="px-6 py-4">
                                            {exam.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Aktív
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Inaktív
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('admin.exams.steps.index', exam.id)}
                                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                                                >
                                                    Kérdések
                                                </Link>
                                                <Link
                                                    href={route('admin.exams.edit', exam.id)}
                                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                                                >
                                                    Szerkesztés
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(exam)}
                                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                                >
                                                    Törlés
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
