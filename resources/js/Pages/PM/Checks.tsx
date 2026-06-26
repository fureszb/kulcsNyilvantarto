import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import PmLayout from '../../Layouts/PmLayout';
import type { Check, PaginatedData } from '../../types';

interface LocationOption { id: number; name: string; }
interface UserOption { id: number; name: string; }

interface Props {
    checks: PaginatedData<Check>;
    locations: LocationOption[];
    users?: UserOption[];
    filters?: { location_id?: string; user_id?: string; date_from?: string; date_to?: string };
}

export default function PmChecks({ checks, locations, users = [], filters }: Props) {
    const [locationId, setLocationId] = useState(filters?.location_id ?? '');
    const [userId, setUserId]         = useState(filters?.user_id     ?? '');
    const [dateFrom, setDateFrom]     = useState(filters?.date_from   ?? '');
    const [dateTo, setDateTo]         = useState(filters?.date_to     ?? '');
    const hasFilters = !!(filters?.location_id || filters?.user_id || filters?.date_from || filters?.date_to);

    function submitFilter(e: React.FormEvent) {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (locationId) params.location_id = locationId;
        if (userId)     params.user_id     = userId;
        if (dateFrom)   params.date_from   = dateFrom;
        if (dateTo)     params.date_to     = dateTo;
        router.get(route('pm.checks'), params, { preserveState: true });
    }

    function clearFilter() {
        setLocationId(''); setUserId(''); setDateFrom(''); setDateTo('');
        router.get(route('pm.checks'), {}, { preserveState: false });
    }

    return (
        <PmLayout title="Kulcsellenőrzések">
            <div className="max-w-6xl mx-auto">

                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
                    <div className="relative px-8 py-8 flex items-center justify-between gap-6">
                        <div>
                            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Property Manager · Kulcsnyilvántartó</p>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">Kulcsellenőrzések</h1>
                            <p className="text-slate-400 mt-1 text-sm">Összes leadott kulcs &amp; kártya ellenőrzés – {checks.total} db</p>
                        </div>
                        <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <form onSubmit={submitFilter} className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-5 mb-6">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Helyszín</label>
                            <select value={locationId} onChange={e => setLocationId(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none transition">
                                <option value="">— Összes —</option>
                                {locations.map(loc => <option key={loc.id} value={String(loc.id)}>{loc.name}</option>)}
                            </select>
                        </div>
                        {users.length > 0 && (
                            <div className="flex-1 min-w-[160px]">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ellenőrző</label>
                                <select value={userId} onChange={e => setUserId(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none transition">
                                    <option value="">— Mindenki —</option>
                                    {users.map(u => <option key={u.id} value={String(u.id)}>{u.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="flex-1 min-w-[140px]">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dátumtól</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none transition" />
                        </div>
                        <div className="flex-1 min-w-[140px]">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dátumig</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none transition" />
                        </div>
                        <div className="flex items-center gap-2 pb-0.5">
                            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/></svg>
                                Szűrés
                            </button>
                            {hasFilters && (
                                <button type="button" onClick={clearFilter} className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                    Törlés
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* List */}
                {checks.data.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                        </div>
                        <p className="text-base font-semibold text-slate-600">Nincs találat</p>
                        <p className="text-sm text-slate-400 mt-1">A szűrési feltételeknek megfelelő ellenőrzés nem található.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dátum &amp; Idő</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Helyszín</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ellenőrizte</th>
                                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Eredmény</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {checks.data.map((check) => {
                                    const total   = check.check_items_count ?? check.check_items?.length ?? 0;
                                    const checked = check.checked_count ?? check.check_items?.filter(i => i.is_checked).length ?? 0;
                                    const pct     = total > 0 ? Math.round(checked / total * 100) : 0;
                                    const allOk   = pct === 100;
                                    const noneOk  = pct === 0 && total > 0;
                                    const checkerInitial = check.checked_by ? check.checked_by.charAt(0) : '?';
                                    const dateStr = check.created_at ? new Date(check.created_at).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' }) : '–';
                                    const timeStr = check.created_at ? new Date(check.created_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }) : '';

                                    return (
                                        <tr key={check.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <p className="font-semibold text-slate-800">{dateStr}</p>
                                                {timeStr && <p className="text-xs text-slate-400 mt-0.5">{timeStr}</p>}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {check.location ? (
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                        </div>
                                                        <span className="font-medium text-slate-700 truncate max-w-[160px]">{check.location.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-xs">Törölt helyszín</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                                                        <span className="text-[10px] font-bold text-amber-600">{checkerInitial}</span>
                                                    </div>
                                                    <span className="text-slate-700 text-sm truncate max-w-[140px]">{check.checked_by ?? '–'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`text-xs font-bold ${allOk ? 'text-emerald-600' : noneOk ? 'text-slate-400' : 'text-amber-600'}`}>
                                                            {checked}/{total}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${allOk ? 'bg-emerald-100 text-emerald-700' : noneOk ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                                                            {pct}%
                                                        </span>
                                                    </div>
                                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${allOk ? 'bg-emerald-500' : noneOk ? 'bg-slate-200' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <Link
                                                    href={route('checks.show', check.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 text-slate-500 hover:text-blue-700 text-xs font-semibold transition-colors whitespace-nowrap"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                    Megtekintés
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {checks.last_page > 1 && (
                            <div className="mt-4 border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-4">
                                <span className="text-sm text-slate-400">{checks.from ?? 0}–{checks.to ?? 0} / {checks.total}</span>
                                <div className="flex items-center gap-1 flex-wrap">
                                    {checks.links.map((link, i) => (
                                        link.url ? (
                                            <Link key={i} href={link.url} className={`min-w-[2.25rem] h-9 px-3 flex items-center justify-center rounded-xl text-sm font-medium border transition-colors ${link.active ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ) : (
                                            <span key={i} className="min-w-[2.25rem] h-9 px-3 flex items-center justify-center rounded-xl text-sm font-medium border border-slate-100 text-slate-300 bg-white" dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PmLayout>
    );
}
