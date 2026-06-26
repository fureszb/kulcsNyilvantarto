import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import SuperAdminLayout from '../../../Layouts/SuperAdminLayout';
import type { TenantRecord, TenantUser } from '../../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    tenant: TenantRecord;
    users: TenantUser[];
}

type UserRole = 'admin' | 'user' | 'property_manager';

interface NewUserFormData {
    name: string;
    email: string;
    role: UserRole;
    employed_since: string;
    password: string;
    password_confirmation: string;
    [key: string]: unknown;
}

interface EditState {
    id: number;
    name: string;
    email: string;
    role: string;
    employed_since: string;
    password: string;
    password_confirmation: string;
}

export default function TenantUsers({ tenant, users }: Props) {
    const [editUser, setEditUser] = useState<EditState | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<NewUserFormData>({
        name: '',
        email: '',
        role: 'user',
        employed_since: '',
        password: '',
        password_confirmation: '',
    });

    function submitNew(e: React.FormEvent) {
        e.preventDefault();
        post(route('super-admin.tenants.users.store', tenant.id), {
            onSuccess: () => reset(),
        });
    }

    function openEdit(user: TenantUser) {
        setEditUser({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            employed_since: user.employed_since ?? '',
            password: '',
            password_confirmation: '',
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editUser) return;
        router.patch(
            route('super-admin.tenants.users.update', [tenant.id, editUser.id]),
            editUser as unknown as Record<string, unknown>,
            { onSuccess: () => setEditUser(null) }
        );
    }

    function handleToggle(userId: number) {
        router.patch(route('super-admin.tenants.users.toggle', [tenant.id, userId]));
    }

    function handleDelete(user: TenantUser) {
        if (!window.confirm(`Biztosan törölni akarod ${user.name} felhasználót?`)) return;
        router.delete(route('super-admin.tenants.users.destroy', [tenant.id, user.id]));
    }

    const roleLabel = (role: string) => {
        if (role === 'admin') return 'Admin';
        if (role === 'property_manager') return 'Property Manager';
        return 'Felhasználó';
    };

    const inputClass = 'w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition text-sm';
    const labelClass = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5';

    return (
        <SuperAdminLayout title={`${tenant.name} – Felhasználók`}>

            {/* Edit modal */}
            {editUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Felhasználó szerkesztése</h2>
                                <p className="text-xs text-slate-400 mt-0.5">{editUser.email}</p>
                            </div>
                            <button
                                onClick={() => setEditUser(null)}
                                type="button"
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {/* Modal form */}
                        <form onSubmit={submitEdit} className="p-6 space-y-4">
                            <div>
                                <label className={labelClass}>Teljes név *</label>
                                <input type="text" value={editUser.name} onChange={(e) => setEditUser((s) => s && ({...s, name: e.target.value}))} className={inputClass} required/>
                            </div>
                            <div>
                                <label className={labelClass}>Email cím *</label>
                                <input type="email" value={editUser.email} onChange={(e) => setEditUser((s) => s && ({...s, email: e.target.value}))} className={inputClass} required/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Szerepkör *</label>
                                    <select value={editUser.role} onChange={(e) => setEditUser((s) => s && ({...s, role: e.target.value}))} className={inputClass}>
                                        <option value="user">Felhasználó</option>
                                        <option value="property_manager">Property Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Belépett a céghez</label>
                                    <input type="date" value={editUser.employed_since} onChange={(e) => setEditUser((s) => s && ({...s, employed_since: e.target.value}))} className={inputClass}/>
                                </div>
                            </div>
                            <div className="border-t border-slate-100 pt-4">
                                <p className="text-xs text-slate-400 mb-3">Jelszó – csak ha változtatni szeretnéd</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Új jelszó</label>
                                        <input type="password" value={editUser.password} onChange={(e) => setEditUser((s) => s && ({...s, password: e.target.value}))} className={inputClass} placeholder="min. 8 karakter"/>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Megerősítés</label>
                                        <input type="password" value={editUser.password_confirmation} onChange={(e) => setEditUser((s) => s && ({...s, password_confirmation: e.target.value}))} className={inputClass} placeholder="••••••••"/>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditUser(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                                    Mégse
                                </button>
                                <button type="submit"
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer">
                                    Mentés
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Page header */}
            <div className="mb-8 flex items-center gap-3">
                <Link href={route('super-admin.dashboard')} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{tenant.name} – Felhasználók</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{users.length} felhasználó</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* User lista */}
                <div className="lg:col-span-3">
                    {users.length === 0 ? (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                            <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                            <p className="text-slate-400 text-sm font-medium">Még nincs felhasználó ennél a cégnél.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[520px]">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50">
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Név / Email</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Szerepkör</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Belépett</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Állapot</th>
                                            <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Műveletek</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div className="font-semibold text-slate-800">{user.name}</div>
                                                    <div className="text-xs text-slate-400">{user.email}</div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {user.role === 'admin' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Admin</span>
                                                    ) : user.role === 'property_manager' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Property Manager</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Felhasználó</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-slate-500">
                                                    {user.employed_since ? new Date(user.employed_since).toLocaleDateString('hu-HU') : '–'}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {user.is_active ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"/>Aktív
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"/>Inaktív
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(user)}
                                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                                                        >
                                                            Szerkesztés
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggle(user.id)}
                                                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${user.is_active ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'}`}
                                                        >
                                                            {user.is_active ? 'Deaktiválás' : 'Aktiválás'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(user)}
                                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
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
                </div>

                {/* Létrehozó form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
                        <h2 className="text-base font-bold text-slate-900 mb-5">Új felhasználó</h2>

                        <form onSubmit={submitNew}>
                            <div className="mb-4">
                                <label className={labelClass}>Teljes név *</label>
                                <input type="text" name="name" value={data.name} onChange={(e) => setData('name', e.target.value)} autoFocus
                                    className={`${inputClass} ${errors.name ? 'border-red-400' : ''}`} placeholder="Kovács János"/>
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="mb-4">
                                <label className={labelClass}>Email cím *</label>
                                <input type="email" name="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                                    className={`${inputClass} ${errors.email ? 'border-red-400' : ''}`} placeholder="kovacs@ceg.hu"/>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div className="mb-4">
                                <label className={labelClass}>Szerepkör *</label>
                                <select name="role" value={data.role} onChange={(e) => setData('role', e.target.value as UserRole)}
                                    className={`${inputClass} ${errors.role ? 'border-red-400' : ''}`}>
                                    <option value="user">Felhasználó</option>
                                    <option value="property_manager">Property Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role as string}</p>}
                            </div>

                            <div className="mb-4">
                                <label className={labelClass}>Belépett a céghez</label>
                                <input type="date" name="employed_since" value={data.employed_since} onChange={(e) => setData('employed_since', e.target.value)}
                                    className={inputClass}/>
                            </div>

                            <div className="mb-4">
                                <label className={labelClass}>Jelszó *</label>
                                <input type="password" name="password" value={data.password} onChange={(e) => setData('password', e.target.value)}
                                    className={`${inputClass} ${errors.password ? 'border-red-400' : ''}`} placeholder="min. 8 karakter"/>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            <div className="mb-6">
                                <label className={labelClass}>Jelszó megerősítése *</label>
                                <input type="password" name="password_confirmation" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className={inputClass} placeholder="••••••••"/>
                            </div>

                            <button type="submit" disabled={processing}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm cursor-pointer disabled:opacity-60">
                                {processing ? 'Létrehozás...' : 'Felhasználó létrehozása'}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </SuperAdminLayout>
    );
}
