import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface Training {
    id: number;
    title: string;
    description?: string;
    is_active: boolean;
    steps_count?: number;
}

interface Props {
    trainings: Training[];
}

export default function TrainingsIndex({ trainings }: Props) {
    function handleDelete(training: Training) {
        if (!window.confirm(`Biztosan törölni akarod: ${training.title}?`)) return;
        router.delete(route('admin.trainings.destroy', training.id));
    }

    return (
        <AdminLayout
            title="Oktatások"
            headerActions={
                <Link
                    href={route('admin.trainings.create')}
                    className="btn-primary text-sm flex items-center gap-1.5"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Új oktatás
                </Link>
            }
        >
            {trainings.length === 0 ? (
                <div className="card p-12 text-center">
                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                    <p className="text-slate-500 font-medium">Még nincs oktatás.</p>
                    <Link
                        href={route('admin.trainings.create')}
                        className="inline-block mt-3 text-indigo-600 font-semibold hover:underline text-sm"
                    >
                        Hozd létre az első oktatást →
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[560px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Oktatás neve</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lépések</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Állapot</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Műveletek</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {trainings.map((training) => (
                                    <tr key={training.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{training.title}</div>
                                            {training.description && (
                                                <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{training.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{training.steps_count ?? 0} lépés</td>
                                        <td className="px-6 py-4">
                                            {training.is_active ? (
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
                                                    href={route('admin.trainings.steps.index', training.id)}
                                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                                >
                                                    Lépések
                                                </Link>
                                                <Link
                                                    href={route('admin.trainings.edit', training.id)}
                                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                                                >
                                                    Szerkesztés
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(training)}
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
