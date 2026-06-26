import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface Exam {
    id: number;
    title: string;
    description?: string | null;
    is_active: boolean;
    pass_score: number;
    sort_order?: number;
    steps_count?: number;
}

interface Props {
    exam: Exam;
}

interface FormData {
    title: string;
    description: string;
    sort_order: number;
    is_active: boolean;
    [key: string]: unknown;
}

export default function ExamEdit({ exam }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        title: exam.title,
        description: exam.description ?? '',
        sort_order: exam.sort_order ?? 0,
        is_active: exam.is_active,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('admin.exams.update', exam.id));
    }

    return (
        <AdminLayout title="Vizsga szerkesztése">
            <div className="max-w-xl">
                <Link
                    href={route('admin.exams.index')}
                    className="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1 mb-5"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Vissza
                </Link>
                <div className="card p-6">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="form-label" htmlFor="title">
                                Vizsga neve <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className={`form-input${errors.title ? ' border-red-400' : ''}`}
                                required
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="form-label" htmlFor="description">Leírás</label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="form-input resize-none"
                            />
                        </div>

                        <div>
                            <label className="form-label" htmlFor="sort_order">Sorrend</label>
                            <input
                                type="number"
                                id="sort_order"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', Number(e.target.value))}
                                className="form-input w-24"
                                min={0}
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Aktív</label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary"
                            >
                                {processing ? 'Mentés...' : 'Mentés'}
                            </button>
                            <Link
                                href={route('admin.exams.steps.index', exam.id)}
                                className="btn-secondary"
                            >
                                Kérdések kezelése
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
