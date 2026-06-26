import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface Item {
    id: number;
    name: string;
    description?: string;
    group_id?: number;
    location_id: number;
}

interface ItemGroup {
    id: number;
    name: string;
    location_id: number;
    items?: Item[];
}

interface Location {
    id: number;
    name: string;
    description?: string;
    responsible_person?: string;
    email?: string;
    icon?: string;
    logo_path?: string;
    is_active: boolean;
    items_count?: number;
    items?: Item[];
    groups?: ItemGroup[];
}

interface Props {
    locations: Location[];
}

export default function LocationsIndex({ locations }: Props) {
    function handleDelete(location: Location) {
        if (!window.confirm('Biztosan törli?')) return;
        router.delete(route('admin.locations.destroy', location.id));
    }

    return (
        <AdminLayout
            title="Helyszínek"
            headerActions={
                <Link
                    href={route('admin.locations.create')}
                    className="btn-primary text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Új helyszín
                </Link>
            }
        >
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Helyszín</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Felelős</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tételek</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Státusz</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {locations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                        Nincs még helyszín.{' '}
                                        <Link href={route('admin.locations.create')} className="text-blue-700 font-medium hover:underline">
                                            Első helyszín létrehozása →
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                locations.map((loc) => (
                                    <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3.5 font-semibold text-slate-800">{loc.name}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{loc.responsible_person ?? '–'}</td>
                                        <td className="px-5 py-3.5 text-slate-500 text-xs">{loc.email ?? '–'}</td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                                {loc.items_count ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {loc.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">Aktív</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Inaktív</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2 justify-end">
                                                <Link href={route('admin.locations.show', loc.id)} className="text-xs text-blue-700 hover:underline font-medium">Tételek</Link>
                                                <Link href={route('admin.locations.edit', loc.id)} className="text-xs text-slate-600 hover:underline font-medium">Szerk.</Link>
                                                <button
                                                    onClick={() => handleDelete(loc)}
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
