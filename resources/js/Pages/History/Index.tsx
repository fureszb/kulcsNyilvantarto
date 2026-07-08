import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, X, Download, MapPin, ChevronRight, FileText, CheckCircle2, AlertCircle, ClipboardList } from 'lucide-react';
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
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl"
            >
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none aurora-blob-1" />
                <div
                    className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />
                <div className="relative px-8 sm:px-10 py-10 flex items-center justify-between gap-6 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Előzmények</h1>
                        <p className="text-slate-400 mt-2 text-sm">
                            {checks.total ?? checks.data.length} korábbi ellenőrzés
                        </p>
                    </div>
                    <a
                        href={route('history.export', locationId ? { location_id: locationId } : {})}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all duration-200 shrink-0"
                    >
                        <Download className="w-4 h-4" />
                        CSV export
                    </a>
                </div>
            </motion.div>

            {/* Filter */}
            <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                onSubmit={handleFilter}
                className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm"
            >
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
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                id="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Keresés..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none transition"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            <Search className="w-4 h-4" />
                            Szűrés
                        </motion.button>
                        {hasFilter && (
                            <button
                                type="button"
                                onClick={clearFilter}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-xl transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                Törlés
                            </button>
                        )}
                    </div>
                </div>
            </motion.form>

            {/* Check list */}
            {checks.data.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                        <ClipboardList className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-600">Nincsenek bejegyzések</h2>
                    <p className="text-slate-400 text-sm mt-1">Próbálj más szűrőt, vagy töröld a jelenlegit.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {checks.data.map((check, index) => {
                        const total = check.check_items_count ?? 0;
                        const checkedCount = check.checked_count ?? 0;
                        const complete = total > 0 && checkedCount === total;
                        return (
                            <motion.div
                                key={check.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: 'easeOut' }}
                            >
                                <Link
                                    href={route('checks.show', check.id)}
                                    className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg hover:shadow-blue-100/60 hover:border-blue-200 transition-all duration-300"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-100 group-hover:border-blue-200 transition-colors">
                                        <MapPin className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                                                {check.location?.name ?? '–'}
                                            </span>
                                            {complete ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Teljes
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Hiányos
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400 flex-wrap">
                                            <span>Ellenőrző: <span className="text-slate-500 font-medium">{check.checked_by}</span></span>
                                            <span className="text-slate-200">·</span>
                                            <span className="whitespace-nowrap">
                                                {new Date(check.created_at).toLocaleString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}
                                            </span>
                                            <span className="text-slate-200">·</span>
                                            <span className="font-semibold text-slate-500">{checkedCount}/{total}</span> tétel
                                        </div>
                                        {check.notes && (
                                            <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5 truncate">
                                                <FileText className="w-3.5 h-3.5 shrink-0 text-slate-300" />
                                                {check.notes.length > 60 ? check.notes.substring(0, 60) + '...' : check.notes}
                                            </p>
                                        )}
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}

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
