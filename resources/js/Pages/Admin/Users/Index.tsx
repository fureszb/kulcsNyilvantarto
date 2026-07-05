import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

type TenantUserRole = 'admin' | 'user' | 'property_manager' | 'security_lead' | 'area_director';

interface TenantUser {
    id: number;
    name: string;
    email: string;
    role: TenantUserRole;
    is_active: boolean;
    created_at: string;
    employed_since?: string;
}

interface Props {
    users: TenantUser[];
}

const ROLE_LABELS: Record<TenantUserRole, string> = {
    admin: 'Admin',
    user: 'Felhasználó',
    property_manager: 'Ingatlankezelő',
    security_lead: 'Biztonsági vezető',
    area_director: 'Területi igazgató',
};

const ROLE_BADGE_CLASSES: Record<TenantUserRole, string> = {
    admin: 'bg-blue-50 text-blue-700',
    user: 'bg-slate-100 text-slate-600',
    property_manager: 'bg-amber-50 text-amber-700',
    security_lead: 'bg-teal-50 text-teal-700',
    area_director: 'bg-indigo-50 text-indigo-700',
};

export default function UsersIndex({ users }: Props) {
    const hasPM = users.some((u) => u.role === 'property_manager');

    function handleDelete(user: TenantUser) {
        if (!window.confirm(`Biztosan törlöd "${user.name}" felhasználót?`)) return;
        router.delete(route('admin.users.destroy', user.id));
    }

    return (
        <AdminLayout
            title="Felhasználók"
            headerActions={
                <Link href={route('admin.users.create')} className="btn-primary text-sm">
                    Új felhasználó
                </Link>
            }
        >
            {!hasPM && (
                <div className="mb-5 flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-amber-800">Nincs Property Manager felhasználó</p>
                        <p className="text-xs text-amber-700 mt-0.5">Hozzon létre egy felhasználót <strong>Property Manager</strong> szerepkörrel a PM portál eléréséhez. A PM portál a bal oldali menüben érhető el.</p>
                    </div>
                </div>
            )}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Név</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Szerepkör</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Belépés</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Státusz</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                                        Még nincs felhasználó. Hozzon létre egyet!
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-slate-800">{u.name}</td>
                                        <td className="px-5 py-3 text-slate-500">{u.email}</td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_BADGE_CLASSES[u.role]}`}>
                                                {ROLE_LABELS[u.role]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-slate-500 text-sm">
                                            {u.employed_since ? (
                                                <span>{u.employed_since}</span>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            {u.is_active ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">Aktív</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-500">Inaktív</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3 justify-end">
                                                <Link href={route('admin.users.edit', u.id)} className="text-xs text-blue-700 hover:underline font-medium">Szerk.</Link>
                                                <button
                                                    onClick={() => handleDelete(u)}
                                                    className="text-xs text-red-500 hover:underline font-medium"
                                                >
                                                    Törlés
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
