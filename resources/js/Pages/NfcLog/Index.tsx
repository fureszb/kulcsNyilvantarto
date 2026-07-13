import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useOwnLayout } from '../../hooks/useOwnLayout';
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

export default function NfcLogIndex({ logs, dateFrom, dateTo, userId, locationId, workers, viewableLocations }: Props) {
    const Layout = useOwnLayout();
    const [filterDateFrom, setFilterDateFrom] = useState(dateFrom);
    const [filterDateTo, setFilterDateTo] = useState(dateTo);
    const [filterUserId, setFilterUserId] = useState(userId ?? '');
    const [filterLocationId, setFilterLocationId] = useState(locationId ?? '');

    const today = new Date().toISOString().slice(0, 10);
    const isDefault = filterDateFrom === today && filterDateTo === today && !filterUserId && !filterLocationId;

    function handleFilter(e: React.FormEvent) {
        e.preventDefault();
        const q: Record<string, string> = { date_from: filterDateFrom, date_to: filterDateTo };
        if (filterUserId) q.user_id = filterUserId;
        if (filterLocationId) q.location_id = filterLocationId;
        router.get(route('nfc-log.index'), q, { preserveState: true });
    }

    function reset() {
        router.get(route('nfc-log.index'));
    }

    return (
        <Layout title="NFC beléptetési napló">
            <div>
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-slate-800">NFC beléptetési napló</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Be-/kilépések és elutasított próbálkozások telephelyenként</p>
                </div>

                <form onSubmit={handleFilter} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6">
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
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Felhasználó</label>
                            <select
                                value={filterUserId}
                                onChange={(e) => setFilterUserId(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none transition"
                            >
                                <option value="">Mindenki</option>
                                {workers.map((w) => (
                                    <option key={w.id} value={String(w.id)}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Telephely</label>
                            <select
                                value={filterLocationId}
                                onChange={(e) => setFilterLocationId(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none transition"
                            >
                                <option value="">Minden telephely</option>
                                {viewableLocations.map((l) => (
                                    <option key={l.id} value={String(l.id)}>{l.name}</option>
                                ))}
                            </select>
                        </div>
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
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-800">Események</h2>
                        <span className="text-sm text-slate-400 font-medium">{logs.total} esemény</span>
                    </div>

                    {logs.data.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <p className="text-slate-400 text-sm">Nincs a szűrésnek megfelelő esemény.</p>
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
