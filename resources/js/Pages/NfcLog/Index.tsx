import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { useOwnLayout } from '../../hooks/useOwnLayout';
import SearchableSelect from '../../Components/SearchableSelect';
import type { ActivityLog, PaginatedData, TenantUserBasic } from '../../types';

declare function route(name: string, params?: unknown): string;

interface LocationBasic { id: number; name: string; }

interface Props {
    logs: PaginatedData<ActivityLog>;
    dateFrom: string;
    dateTo: string;
    userId?: string | null;
    locationId?: string | null;
    workers: TenantUserBasic[];
    viewableLocations: LocationBasic[];
    canManage: boolean;
}

const TYPE_LABEL: Record<string, string> = {
    'nfc.entry':  'Belépés',
    'nfc.exit':   'Kilépés',
    'nfc.denied': 'Elutasítva',
};

const TYPE_BADGE: Record<string, string> = {
    'nfc.entry':  'bg-green-50 text-green-700',
    'nfc.exit':   'bg-blue-50 text-blue-700',
    'nfc.denied': 'bg-red-50 text-red-700',
};

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function NfcLogIndex({ logs, dateFrom, dateTo, userId, locationId, workers, viewableLocations, canManage }: Props) {
    const Layout = useOwnLayout();
    const [filterDateFrom, setFilterDateFrom] = useState(dateFrom);
    const [filterDateTo, setFilterDateTo] = useState(dateTo);
    const [filterUserId, setFilterUserId] = useState<number | null>(canManage && userId ? Number(userId) : null);
    const [filterLocationId, setFilterLocationId] = useState<number | null>(locationId ? Number(locationId) : null);

    const today = new Date().toISOString().slice(0, 10);
    const isDefault = filterDateFrom === today && filterDateTo === today && !filterLocationId && (!canManage || !filterUserId);

    function handleFilter(e: React.FormEvent) {
        e.preventDefault();
        const q: Record<string, string> = { date_from: filterDateFrom, date_to: filterDateTo };
        if (canManage && filterUserId) q.user_id = String(filterUserId);
        if (filterLocationId) q.location_id = String(filterLocationId);
        router.get(route('nfc-log.index'), q, { preserveState: true });
    }

    function reset() {
        router.get(route('nfc-log.index'));
    }

    return (
        <Layout title="NFC beléptetési napló">
            <div className="max-w-7xl mx-auto space-y-5">

                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-orange-800/10 rounded-full blur-3xl pointer-events-none" />
                    <div
                        className="absolute inset-0 opacity-[0.025] pointer-events-none"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
                            backgroundSize: '32px 32px',
                        }}
                    />
                    <div className="relative px-8 py-7 flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Fizikai biztonság</p>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">NFC beléptetési napló</h1>
                            <p className="text-slate-400 text-sm mt-1">
                                {canManage ? 'Be-/kilépések és elutasított próbálkozások telephelyenként' : 'A saját be-/kilépéseid és elutasított próbálkozásaid'}
                            </p>
                        </div>
                        <Link
                            href={route('home')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Vissza
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleFilter} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ettől</label>
                            <input
                                type="date"
                                value={filterDateFrom}
                                onChange={(e) => setFilterDateFrom(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Eddig</label>
                            <input
                                type="date"
                                value={filterDateTo}
                                onChange={(e) => setFilterDateTo(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none transition"
                            />
                        </div>
                        {canManage && (
                            <SearchableSelect
                                label="Felhasználó"
                                options={workers}
                                value={filterUserId}
                                onChange={setFilterUserId}
                                placeholder="Mindenki"
                            />
                        )}
                        <SearchableSelect
                            label="Telephely"
                            options={viewableLocations}
                            value={filterLocationId}
                            onChange={setFilterLocationId}
                            placeholder="Minden telephely"
                        />
                        <button
                            type="submit"
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                        >
                            Szűrés
                        </button>
                        {!isDefault && (
                            <button
                                type="button"
                                onClick={reset}
                                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors"
                            >
                                Visszaállítás
                            </button>
                        )}
                    </div>
                </form>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-4 8h4m-4 4h4m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <h2 className="font-bold text-slate-800">Események</h2>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{logs.total} esemény</span>
                    </div>

                    {logs.data.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-400">
                            <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-4 8h4m-4 4h4m-6-4h.01M9 16h.01" />
                            </svg>
                            <p className="text-sm font-medium">Nincs a szűrésnek megfelelő esemény.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[680px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Időpont</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Felhasználó</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Esemény</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Telephely</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Matrica</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs.data.map((log) => {
                                        const meta = log.metadata ?? {};
                                        const locName = (meta['location_name'] as string | undefined)
                                            ?? viewableLocations.find(l => l.id === meta['location_id'])?.name
                                            ?? '–';
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{formatDateTime(log.occurred_at)}</td>
                                                <td className="px-5 py-3.5 font-semibold text-slate-800">{log.user_name ?? '–'}</td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${TYPE_BADGE[log.event_type] ?? 'bg-slate-100 text-slate-500'}`}>
                                                        {TYPE_LABEL[log.event_type] ?? log.event_type}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-600">{locName}</td>
                                                <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{String(meta['tag_uid'] ?? '–')}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {logs.last_page > 1 && (
                        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-400">{logs.from}–{logs.to} / {logs.total}</span>
                            <div className="flex items-center gap-1">
                                {logs.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${link.active ? 'bg-indigo-600 text-white' : link.url ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
