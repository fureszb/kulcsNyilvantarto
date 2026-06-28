import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

type TenantUserRole = 'admin' | 'user' | 'property_manager';

interface TenantUser {
    id: number;
    name: string;
    email: string;
    role: TenantUserRole;
    is_active: boolean;
    created_at: string;
    employed_since?: string;
}

interface ExamItem {
    id: number;
    title: string;
    max_attempts: number | null;
}

interface OverrideItem {
    exam_id: number;
    max_attempts: number | null;
}

interface Props {
    user?: TenantUser;
    roles: string[];
    exams?: ExamItem[];
    overrides?: OverrideItem[];
}

interface FormData {
    name: string;
    email: string;
    role: string;
    password: string;
    password_confirmation: string;
    employed_since: string;
    is_active: boolean;
    [key: string]: unknown;
}

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    user: 'Felhasználó',
    property_manager: 'Ingatlankezelő',
};

export default function UserForm({ user, roles, exams = [], overrides = [] }: Props) {
    const isEdit = !!user;
    const [examOverrides, setExamOverrides] = useState<Record<number, string>>(
        () => Object.fromEntries(overrides.map(o => [o.exam_id, o.max_attempts != null ? String(o.max_attempts) : '']))
    );
    const [savingOverrides, setSavingOverrides] = useState(false);
    const [overridesMsg, setOverridesMsg] = useState('');

    async function saveExamOverrides() {
        if (!user) return;
        setSavingOverrides(true);
        setOverridesMsg('');
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
            const payload = exams.map(e => ({
                exam_id: e.id,
                max_attempts: examOverrides[e.id] !== '' && examOverrides[e.id] !== undefined ? parseInt(examOverrides[e.id], 10) : null,
            }));
            const resp = await fetch(route('admin.users.exam-overrides', user.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
                body: JSON.stringify({ overrides: payload }),
            });
            setOverridesMsg(resp.ok ? 'Mentve!' : 'Hiba történt.');
        } catch {
            setOverridesMsg('Hiba történt.');
        } finally {
            setSavingOverrides(false);
        }
    }
    const title = isEdit ? 'Felhasználó szerkesztése' : 'Új felhasználó';

    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        role: user?.role ?? (roles[0] ?? 'user'),
        password: '',
        password_confirmation: '',
        employed_since: user?.employed_since ?? '',
        is_active: user?.is_active ?? true,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.users.update', user.id));
        } else {
            post(route('admin.users.store'));
        }
    }

    return (
        <AdminLayout title={title}>
            <div className="max-w-lg">
                <div className="flex items-center gap-2 mb-5">
                    <a href={route('admin.users.index')} className="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        Felhasználók
                    </a>
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                    <span className="text-sm text-slate-700">{isEdit ? user.name : 'Új felhasználó'}</span>
                </div>

                <div className="card p-6">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="form-label" htmlFor="name">Név <span className="text-red-500">*</span></label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="form-input"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="form-label" htmlFor="email">Email cím <span className="text-red-500">*</span></label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="form-input"
                                required
                                autoComplete="off"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="form-label" htmlFor="role">Szerepkör <span className="text-red-500">*</span></label>
                            <select
                                id="role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="form-input"
                            >
                                <option value="user">Felhasználó (worker)</option>
                                <option value="property_manager">Property Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label" htmlFor="password">
                                Jelszó {isEdit ? '(üresen hagyva nem változik)' : '*'}
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="form-input"
                                required={!isEdit}
                                autoComplete="new-password"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="form-label" htmlFor="password_confirmation">Jelszó megerősítése</label>
                            <input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="form-input"
                                autoComplete="new-password"
                            />
                        </div>

                        <div>
                            <label className="form-label" htmlFor="employed_since">Belépés dátuma (mióta dolgozik)</label>
                            <input
                                id="employed_since"
                                type="date"
                                value={data.employed_since}
                                onChange={(e) => setData('employed_since', e.target.value)}
                                className="form-input"
                            />
                            {errors.employed_since && <p className="text-red-500 text-xs mt-1">{errors.employed_since}</p>}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer">Aktív felhasználó</label>
                        </div>

                        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary"
                            >
                                {isEdit ? 'Mentés' : 'Létrehozás'}
                            </button>
                            <a href={route('admin.users.index')} className="btn-secondary">Mégse</a>
                        </div>
                    </form>
                </div>

                {isEdit && exams.length > 0 && (
                    <div className="card p-6 mt-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-1">Vizsga kísérletek (felhasználói override)</h3>
                        <p className="text-xs text-slate-400 mb-4">Ha üresen hagyod, az alap vizsga-beállítás érvényes. Ha számot írsz, az adott felhasználóra ez az érték lesz érvényes.</p>
                        <div className="space-y-3">
                            {exams.map(exam => (
                                <div key={exam.id} className="flex items-center gap-3">
                                    <span className="flex-1 text-sm text-slate-700 truncate">{exam.title}</span>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">Alap: {exam.max_attempts ?? 'korlátlan'}</span>
                                    <input
                                        type="number"
                                        min={1}
                                        value={examOverrides[exam.id] ?? ''}
                                        onChange={e => setExamOverrides(prev => ({ ...prev, [exam.id]: e.target.value }))}
                                        placeholder="—"
                                        className="form-input w-20 text-center text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                            <button
                                type="button"
                                onClick={saveExamOverrides}
                                disabled={savingOverrides}
                                className="btn-primary text-sm"
                            >
                                {savingOverrides ? 'Mentés...' : 'Override mentése'}
                            </button>
                            {overridesMsg && <span className="text-sm text-emerald-600 font-medium">{overridesMsg}</span>}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
