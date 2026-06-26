import { Link, router } from '@inertiajs/react';
import SuperAdminLayout from '../../Layouts/SuperAdminLayout';
import type { TenantRecord } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    tenants: TenantRecord[];
}

export default function SuperAdminDashboard({ tenants }: Props) {
    function handleDelete(tenant: TenantRecord) {
        if (!window.confirm(`Biztosan törölni akarod a(z) ${tenant.name} céget és az összes adatát? Ez nem visszavonható!`)) return;
        router.delete(route('super-admin.tenants.destroy', tenant.id));
    }

    function handleToggle(tenant: TenantRecord) {
        router.patch(route('super-admin.tenants.toggle', tenant.id));
    }

    return (
        <SuperAdminLayout title="Cégek">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cégek</h1>
                    <p className="text-slate-500 mt-0.5 text-sm">{tenants.length} regisztrált cég</p>
                </div>
                <Link
                    href={route('super-admin.tenants.create')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Új cég felvétele
                </Link>
            </div>

            {tenants.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    <p className="text-slate-500 font-medium">Még nincs regisztrált cég.</p>
                    <Link href={route('super-admin.tenants.create')} className="inline-block mt-4 text-indigo-600 font-semibold hover:underline text-sm">
                        Hozd létre az első céget →
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[640px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cég neve</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">URL</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Létrehozva</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Állapot</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Műveletek</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                    {tenant.slug.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-slate-800">{tenant.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a href={tenant.url} target="_blank" rel="noopener noreferrer"
                                               className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                                                /{tenant.slug}
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                                </svg>
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString('hu-HU', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '.') : '–'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {tenant.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"/>
                                                    Aktív
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"/>
                                                    Inaktív
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('super-admin.tenants.users.index', tenant.id)}
                                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                                >
                                                    Felhasználók
                                                </Link>
                                                <button
                                                    onClick={() => handleToggle(tenant)}
                                                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${tenant.is_active ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'}`}
                                                >
                                                    {tenant.is_active ? 'Deaktiválás' : 'Aktiválás'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tenant)}
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
        </SuperAdminLayout>
    );
}
