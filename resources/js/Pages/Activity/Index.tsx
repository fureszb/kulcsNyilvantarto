import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import PmLayout from '../../Layouts/PmLayout';
import type { ActivityLog, PaginatedData, TenantUserBasic } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    logs: PaginatedData<ActivityLog>;
    date: string;
    type: string;
    userId?: string | null;
    workers: TenantUserBasic[];
    isPm?: boolean;
}

const colorMap: Record<string, { dot: string; badge: string }> = {
    'check.completed':    { dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700' },
    'training.completed': { dot: 'bg-indigo-400', badge: 'bg-indigo-50 text-indigo-700' },
    'exam.completed':     { dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700' },
    'security.created':   { dot: 'bg-rose-400',   badge: 'bg-rose-50 text-rose-700' },
    'security.updated':   { dot: 'bg-rose-300',   badge: 'bg-rose-50 text-rose-600' },
    'shift_note.created': { dot: 'bg-teal-400',   badge: 'bg-teal-50 text-teal-700' },
    'shift_note.updated': { dot: 'bg-teal-300',   badge: 'bg-teal-50 text-teal-600' },
    'shift_note.deleted': { dot: 'bg-teal-200',   badge: 'bg-teal-50 text-teal-500' },
    'pm_message.sent':    { dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700' },
    'pm_message.updated': { dot: 'bg-orange-300', badge: 'bg-orange-50 text-orange-600' },
    'pm_message.deleted': { dot: 'bg-orange-200', badge: 'bg-orange-50 text-orange-500' },
    'user.login':         { dot: 'bg-slate-300',  badge: 'bg-slate-100 text-slate-600' },
    'user.logout':        { dot: 'bg-slate-200',  badge: 'bg-slate-100 text-slate-500' },
};

const eventLabels: Record<string, string> = {
    'check.completed':    'Ellenőrzés',
    'training.completed': 'Oktatás',
    'exam.completed':     'Vizsga',
    'security.created':   'Napi jelentés',
    'security.updated':   'Jelentés módosítva',
    'shift_note.created': 'Váltóüzenet',
    'shift_note.updated': 'Váltóüzenet módosítva',
    'shift_note.deleted': 'Váltóüzenet törölve',
    'pm_message.sent':    'PM üzenet',
    'pm_message.updated': 'PM üzenet módosítva',
    'pm_message.deleted': 'PM üzenet törölve',
    'user.login':         'Bejelentkezés',
    'user.logout':        'Kijelentkezés',
};

function LogEntry({ log }: { log: ActivityLog }) {
    const [open, setOpen] = useState(false);
    const c = colorMap[log.event_type] ?? colorMap['user.login'];
    const label = eventLabels[log.event_type] ?? log.event_type;
    const meta = log.metadata;

    const timeStr = log.occurred_at
        ? new Date(log.occurred_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '';

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full text-left px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors"
            >
                <div className={`w-2 h-2 rounded-full shrink-0 mt-2 ${c.dot}`} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${c.badge}`}>{label}</span>
                        <span className="text-sm font-semibold text-slate-700">{log.user_name}</span>
                    </div>
                    <p className="text-sm text-slate-600">{log.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400 font-mono">{timeStr}</span>
                    {meta && (
                        <svg
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </div>
            </button>
            {meta && open && (
                <div className="px-6 pb-4 ml-6">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-2">

                        {meta['content'] && !meta['old_content'] && (
                            <div>
                                <p className="font-semibold text-slate-500 mb-1">Tartalom</p>
                                <p className="text-slate-700 whitespace-pre-line leading-relaxed">{String(meta['content'])}</p>
                            </div>
                        )}

                        {meta['old_content'] && meta['new_content'] && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-lg border border-rose-100 bg-rose-50 p-3">
                                    <p className="font-semibold text-rose-500 mb-1">Előtte</p>
                                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">{String(meta['old_content'])}</p>
                                </div>
                                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                                    <p className="font-semibold text-emerald-600 mb-1">Utána</p>
                                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">{String(meta['new_content'])}</p>
                                </div>
                            </div>
                        )}
                        {meta['old_content'] && meta['new_content'] && meta['old_date'] && meta['old_date'] !== meta['new_date'] && (
                            <p className="text-slate-500">Dátum: <span className="line-through text-rose-500">{String(meta['old_date'])}</span> → <span className="text-emerald-600">{String(meta['new_date'])}</span></p>
                        )}

                        {meta['note_date'] && !meta['old_date'] && (
                            <p className="text-slate-500">Dátum: <span className="font-medium text-slate-700">{String(meta['note_date'])}</span></p>
                        )}

                        {meta['score'] !== undefined && meta['total'] !== undefined && (
                            <p className="text-slate-500">Eredmény: <span className="font-medium text-slate-700">{Number(meta['score'])}/{Number(meta['total'])} ({Number(meta['total']) > 0 ? Math.round(Number(meta['score']) / Number(meta['total']) * 100) : 0}%)</span></p>
                        )}

                        {meta['send_to_all'] !== undefined && (
                            <p className="text-slate-500">Célzás: <span className="font-medium text-slate-700">{meta['send_to_all'] ? 'Mindenki' : `${meta['recipient_count'] ?? '?'} kiválasztott felhasználó`}</span></p>
                        )}

                        {meta['old_send_to_all'] !== undefined && meta['new_send_to_all'] !== undefined && meta['old_send_to_all'] !== meta['new_send_to_all'] && (
                            <p className="text-slate-500">Célzás módosult: <span className="text-rose-500">{meta['old_send_to_all'] ? 'Mindenki' : 'Kiválasztottak'}</span> → <span className="text-emerald-600">{meta['new_send_to_all'] ? 'Mindenki' : 'Kiválasztottak'}</span></p>
                        )}

                        {meta['checked'] !== undefined && meta['total'] !== undefined && meta['score'] === undefined && (
                            <p className="text-slate-500">Ellenőrzött: <span className="font-medium text-slate-700">{Number(meta['checked'])}/{Number(meta['total'])} tétel</span></p>
                        )}

                        {meta['report_date'] && (
                            <p className="text-slate-500">Jelentés dátuma: <span className="font-medium text-slate-700">{String(meta['report_date'])}</span></p>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}

function ActivityContent({ logs, date, type, userId, workers }: Omit<Props, 'isPm'>) {
    const [filterDate, setFilterDate] = useState(date);
    const [filterType, setFilterType] = useState(type);
    const [filterUserId, setFilterUserId] = useState(userId ?? '');

    const isDefault = filterDate === new Date().toISOString().slice(0, 10) && filterType === 'all' && !filterUserId;

    function handleFilter(e: React.FormEvent) {
        e.preventDefault();
        const q: Record<string, string> = { date: filterDate, type: filterType };
        if (filterUserId) q.user_id = filterUserId;
        router.get(route('activity.index'), q, { preserveState: true });
    }

    const displayDate = new Date(date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-800">Tevékenységnapló</h1>
                <p className="text-sm text-slate-500 mt-0.5">Napi szűrő – ellenőrzések, oktatások, vizsgák</p>
            </div>

            {/* Filter bar */}
            <form onSubmit={handleFilter} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Dátum</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Típus</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none transition"
                        >
                            <option value="all">Minden</option>
                            <option value="check.completed">Ellenőrzés</option>
                            <option value="training.completed">Oktatás</option>
                            <option value="exam.completed">Vizsga</option>
                            <option value="security.created">Napi jelentés</option>
                            <option value="security.updated">Jelentés módosítva</option>
                            <option value="shift_note.created">Váltóüzenet</option>
                            <option value="shift_note.updated">Váltóüzenet módosítva</option>
                            <option value="shift_note.deleted">Váltóüzenet törölve</option>
                            <option value="pm_message.sent">PM üzenet</option>
                            <option value="pm_message.updated">PM üzenet módosítva</option>
                            <option value="pm_message.deleted">PM üzenet törölve</option>
                            <option value="user.login">Bejelentkezés</option>
                            <option value="user.logout">Kijelentkezés</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Dolgozó</label>
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
                    <button
                        type="submit"
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                        Szűrés
                    </button>
                    {!isDefault && (
                        <button
                            type="button"
                            onClick={() => router.get(route('activity.index'))}
                            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors"
                        >
                            Visszaállítás
                        </button>
                    )}
                </div>
            </form>

            {/* Results */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h2 className="font-bold text-slate-800">{displayDate}</h2>
                    </div>
                    <span className="text-sm text-slate-400 font-medium">{logs.total} esemény</span>
                </div>

                {logs.data.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-slate-400 text-sm">Ezen a napon nem történt naplózott esemény.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {logs.data.map((log) => (
                            <LogEntry key={log.id} log={log} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ActivityIndex({ logs, date, type, userId, workers, isPm }: Props) {
    if (isPm) {
        return (
            <PmLayout title="Tevékenységnapló">
                <ActivityContent logs={logs} date={date} type={type} userId={userId} workers={workers} />
            </PmLayout>
        );
    }

    return (
        <AdminLayout title="Tevékenységnapló">
            <ActivityContent logs={logs} date={date} type={type} userId={userId} workers={workers} />
        </AdminLayout>
    );
}
