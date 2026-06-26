import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import type { Check, Location, PaginatedData } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    checks: PaginatedData<Check>;
    locations: Location[];
}

export default function HistoryIndex({ checks, locations }: Props) {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const [locationId, setLocationId] = useState(params.get('location_id') ?? '');
    const [search, setSearch] = useState(params.get('search') ?? '');

    const hasFilter = locationId !== '' || search !== '';

    function handleFilter(e: React.FormEvent) {
        e.preventDefault();
        const query: Record<string, string> = {};
        if (locationId) query.location_id = locationId;
        if (search) query.search = search;
        router.get(route('history.index'), query, { preserveState: true });
    }

    function clearFilter() {
        setLocationId('');
        setSearch('');
        router.get(route('history.index'));
    }

    return (
        <AppLayout title="Előzmények">

            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
                <div
                    className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />
                <div className="relative px-8 sm:px-10 py-10 flex items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Előzmények</h1>
                        <p className="text-slate-400 mt-2 text-sm">Korábbi ellenőrzések listája</p>
                    </div>
                    <a
                        href={route('history.export', locationId ? { location_id: locationId } : {})}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all duration-200 shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        CSV export
                    </a>
                </div>
            </div>

            {/* Filter */}
            <form onSubmit={handleFilter} className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Szűrők
                </p>
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-48">
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5" htmlFor="location_id">Helyszín</label>
                        <select
                            id="location_id"
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none transition"
                        >
                            <option value="">Összes helyszín</option>
                            {locations.map((loc) => (
                                <option key={loc.id} value={String(loc.id)}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 min-w-48">
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5" htmlFor="search">Ellenőrző neve</label>
                        <input
                            type="text"
                            id="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Keresés..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none transition"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Szűrés
                        </button>
                        {hasFilter && (
                            <button
                                type="button"
                                onClick={clearFilter}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-xl transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Törlés
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Helyszín</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ellenőrző</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Dátum</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Állapot</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Megjegyzés</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {checks.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <svg className="w-10 h-10 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <p className="text-slate-400 text-sm">Nincsenek ellenőrzési bejegyzések.</p>
                                    </td>
                                </tr>
                            ) : (
                                checks.data.map((check) => {
                                    const total = check.check_items_count ?? 0;
                                    const checked = check.checked_count ?? 0;
                                    const complete = total > 0 && checked === total;
                                    return (
                                        <tr key={check.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-4 text-slate-300 font-mono text-xs">#{check.id}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-semibold text-slate-800">{check.location?.name ?? '–'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-slate-500">{check.checked_by.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <span className="text-slate-700">{check.checked_by}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs">
                                                {new Date(check.created_at).toLocaleString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    {complete ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            Teljes
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                            Hiányos
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-slate-400 font-medium">{checked}/{total}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {check.notes ? (
                                                    <span title={check.notes} className="inline-flex items-center gap-1.5 text-xs text-slate-500 cursor-help max-w-[8rem] truncate">
                                                        <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                        </svg>
                                                        {check.notes.length > 30 ? check.notes.substring(0, 30) + '...' : check.notes}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-200">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {checks.last_page > 1 && (
                <div className="mt-5 flex items-center gap-1">
                    {checks.links.map((link, idx) => (
                        link.url ? (
                            <Link
                                key={idx}
                                href={link.url}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${link.active ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={idx}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 bg-white border border-slate-200 cursor-default"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    ))}
                </div>
            )}

        </AppLayout>
    );
}
