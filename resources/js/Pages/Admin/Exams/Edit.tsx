import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface Exam {
    id: number;
    title: string;
    description?: string | null;
    is_active: boolean;
    sort_order?: number;
    steps_count?: number;
    max_attempts?: number | null;
    cooldown_minutes?: number;
    shuffle_questions?: boolean;
    shuffle_answers?: boolean;
    time_limit_minutes?: number | null;
}

interface Props {
    exam: Exam;
}

interface FormData {
    title: string;
    description: string;
    sort_order: number;
    is_active: boolean;
    max_attempts: string;
    cooldown_minutes: string;
    shuffle_questions: boolean;
    shuffle_answers: boolean;
    time_limit_minutes: string;
    [key: string]: unknown;
}

export default function ExamEdit({ exam }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        title:               exam.title,
        description:         exam.description ?? '',
        sort_order:          exam.sort_order ?? 0,
        is_active:           exam.is_active,
        max_attempts:        exam.max_attempts != null ? String(exam.max_attempts) : '',
        cooldown_minutes:    exam.cooldown_minutes != null ? String(exam.cooldown_minutes) : '0',
        shuffle_questions:   exam.shuffle_questions ?? false,
        shuffle_answers:     exam.shuffle_answers ?? false,
        time_limit_minutes:  exam.time_limit_minutes != null ? String(exam.time_limit_minutes) : '',
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

                        <div className="border-t border-slate-100 pt-4 mt-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Anti-Cheat beállítások</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label" htmlFor="max_attempts">Max kísérletek</label>
                                    <input
                                        type="number"
                                        id="max_attempts"
                                        value={data.max_attempts}
                                        onChange={(e) => setData('max_attempts', e.target.value)}
                                        placeholder="Korlátlan"
                                        className="form-input w-full"
                                        min={1}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Üresen = korlátlan</p>
                                </div>
                                <div>
                                    <label className="form-label" htmlFor="cooldown_minutes">Várakozás (perc)</label>
                                    <input
                                        type="number"
                                        id="cooldown_minutes"
                                        value={data.cooldown_minutes}
                                        onChange={(e) => setData('cooldown_minutes', e.target.value)}
                                        className="form-input w-full"
                                        min={0}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">0 = nincs várakozás</p>
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className="form-label" htmlFor="time_limit_minutes">Időkorlát (perc)</label>
                                <input
                                    type="number"
                                    id="time_limit_minutes"
                                    value={data.time_limit_minutes}
                                    onChange={(e) => setData('time_limit_minutes', e.target.value)}
                                    placeholder="Nincs időkorlát"
                                    className="form-input w-48"
                                    min={1}
                                />
                            </div>

                            <div className="flex flex-col gap-3 mt-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="shuffle_questions"
                                        checked={data.shuffle_questions}
                                        onChange={(e) => setData('shuffle_questions', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600"
                                    />
                                    <label htmlFor="shuffle_questions" className="text-sm font-medium text-slate-700">Kérdések sorrendjének keverése</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="shuffle_answers"
                                        checked={data.shuffle_answers}
                                        onChange={(e) => setData('shuffle_answers', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600"
                                    />
                                    <label htmlFor="shuffle_answers" className="text-sm font-medium text-slate-700">Válaszok sorrendjének keverése</label>
                                </div>
                            </div>
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
