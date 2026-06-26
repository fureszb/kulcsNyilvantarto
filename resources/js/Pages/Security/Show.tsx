import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import PmLayout from '../../Layouts/PmLayout';
import type { SecurityDailyReport, TenantUser, PageProps } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    report: SecurityDailyReport;
    sharedUsers: TenantUser[];
    allUsers: TenantUser[];
    isCreator: boolean;
}

type Row = Record<string, string | undefined>;

function SectionCard({ title, icon, count, countSuffix = 'db', border = 'border-slate-200', children }: {
    title: string; icon: React.ReactNode; count?: number; countSuffix?: string;
    border?: string; children: React.ReactNode;
}) {
    return (
        <div className={`bg-white border ${border} rounded-2xl shadow-sm overflow-hidden`}>
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                {icon}
                <h3 className="font-bold text-slate-800">{title}</h3>
                {count !== undefined && (
                    <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{count} {countSuffix}</span>
                )}
            </div>
            {children}
        </div>
    );
}

export default function SecurityShow({ report, sharedUsers, allUsers, isCreator }: Props) {
    const { auth } = usePage<PageProps>().props;
    const isPm = auth.user?.is_property_manager ?? false;
    const Layout = isPm ? PmLayout : AppLayout;

    const [shareOpen, setShareOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>(sharedUsers.map(u => u.id));

    function toggleUser(id: number) {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }

    function saveShare(e: React.FormEvent) {
        e.preventDefault();
        router.post(route('security.shares.update', report.id), { share_user_ids: selectedIds }, {
            onSuccess: () => setShareOpen(false),
        });
    }

    const serviceMems = (report.service_members ?? []) as Row[];
    const prevMems    = (report.previous_shift_members ?? []) as Row[];
    const equipment   = (report.equipment ?? []) as Row[];
    const inspectors  = (report.inspectors ?? []) as Row[];
    const patrols     = (report.patrols ?? []) as Row[];
    const incidents   = (report.incidents ?? []) as Row[];
    const events      = (report.events ?? []) as Row[];
    const fireAlarms  = (report.fire_alarms ?? []) as Row[];
    const elevators   = (report.elevators ?? []) as Row[];
    const maintenance = (report.maintenance ?? []) as Row[];

    const hasHandover = report.taken_over_from || report.handover_time || prevMems.length > 0;

    return (
        <Layout title={`Napi Jelentés – ${report.report_date}`}>
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-rose-800/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="relative px-4 py-6 sm:px-8 sm:py-8 flex items-start justify-between gap-6 flex-wrap">
                    <div>
                        <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Biztonsági Szolgálat</p>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">Napi Jelentés</h1>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                {report.report_date}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                Készítette: <strong className="text-slate-300 ml-0.5">{report.prepared_by}</strong>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                        <a href={isPm ? route('pm.security') : route('security.index')} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                            Vissza
                        </a>
                        {!isPm && isCreator && (
                            <a href={route('security.edit', report.id)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-sm font-medium transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                Szerkesztés
                            </a>
                        )}
                        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 012-2h6a2 2 0 012 2v2"/></svg>
                            Nyomtatás
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-5">

                {/* Átadás-átvétel */}
                {hasHandover && (
                    <div className="bg-white border border-rose-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-rose-100 flex items-center gap-2.5 bg-rose-50/40">
                            <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                            </div>
                            <h3 className="font-bold text-slate-800">Átadás-átvétel</h3>
                        </div>
                        <div className="px-4 py-4 sm:px-6 sm:py-5 flex flex-wrap items-center gap-6">
                            {report.taken_over_from && (
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Átadó</span>
                                        <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-sm font-bold text-slate-700">{report.taken_over_from}</span>
                                    </div>
                                    <svg className="w-5 h-5 text-rose-400 shrink-0 mt-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Átvevő</span>
                                        <span className="px-3 py-1.5 rounded-lg bg-rose-100 text-sm font-bold text-rose-700">{report.prepared_by}</span>
                                    </div>
                                </div>
                            )}
                            {report.handover_time && (
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Időpont</span>
                                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 font-mono text-sm font-bold text-slate-700">{report.handover_time}</span>
                                </div>
                            )}
                        </div>
                        {prevMems.length > 0 && (
                            <div className="border-t border-rose-100 overflow-x-auto">
                                <div className="px-6 py-3 bg-rose-50/30">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tegnapi csapat (átadók)</p>
                                </div>
                                <table className="w-full text-sm">
                                    <thead><tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Beosztás</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Név</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Munkaidő</th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {prevMems.map((r, i) => (
                                            <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-5 py-3.5 text-slate-500 text-sm">{r['beosztás'] ?? '–'}</td>
                                                <td className="px-5 py-3.5 font-semibold text-slate-800">{r['nev'] ?? '–'}</td>
                                                <td className="px-5 py-3.5 font-mono text-slate-400 text-xs">{r['idő_tól'] ?? ''} – {r['idő_ig'] ?? ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Napi Szolgálat */}
                {serviceMems.length > 0 && (
                    <SectionCard title="Napi Szolgálat tagjai" count={serviceMems.length} countSuffix="fő"
                        icon={<div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Beosztás</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Név</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Munkaidő</th>
                                </tr></thead>
                                <tbody className="divide-y divide-slate-50">
                                    {serviceMems.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-3.5 text-slate-500 text-sm">{r['beosztás'] ?? '–'}</td>
                                            <td className="px-5 py-3.5 font-semibold text-slate-800">{r['nev'] ?? '–'}</td>
                                            <td className="px-5 py-3.5 font-mono text-slate-400 text-xs">{r['idő_tól'] ?? ''} – {r['idő_ig'] ?? ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {/* Eszközök */}
                {equipment.length > 0 && (
                    <SectionCard title="Eszközök átadása / átvétele" count={equipment.length} countSuffix="tétel"
                        icon={<div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg></div>}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Megnevezés</th>
                                    <th className="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Darabszám</th>
                                </tr></thead>
                                <tbody className="divide-y divide-slate-50">
                                    {equipment.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-3.5 text-slate-700">{r['megnevezés'] ?? '–'}</td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">{r['darabszám'] ?? '–'}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {/* Ellenőrzést végző személyek */}
                {inspectors.length > 0 && (
                    <SectionCard title="Ellenőrzést végző személyek"
                        icon={<div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Neve</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Időtartam</th>
                                </tr></thead>
                                <tbody className="divide-y divide-slate-50">
                                    {inspectors.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-3.5 font-semibold text-slate-800">{r['neve'] ?? '–'}</td>
                                            <td className="px-5 py-3.5 font-mono text-slate-400 text-xs">{r['idő_tól'] ?? ''} – {r['idő_ig'] ?? ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {/* Járőrözés */}
                {patrols.length > 0 && (
                    <SectionCard title="Járőrözés és zártság ellenőrzése" count={patrols.length} countSuffix="kör"
                        icon={<div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vagyonőr</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Időpont</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Megjegyzés</th>
                                </tr></thead>
                                <tbody className="divide-y divide-slate-50">
                                    {patrols.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-3.5 font-semibold text-slate-800">{r['vagyonőr'] ?? '–'}</td>
                                            <td className="px-5 py-3.5 font-mono text-slate-400 text-xs">{r['időpont'] ?? '–'}</td>
                                            <td className="px-5 py-3.5 text-slate-500">{r['megjegyzés'] ?? '–'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {/* Rendkívüli események */}
                {incidents.length > 0 && (
                    <div className="bg-white border border-rose-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-rose-100 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            </div>
                            <h3 className="font-bold text-rose-700">Rendkívüli események</h3>
                            <span className="ml-auto text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">{incidents.length} esemény</span>
                        </div>
                        <div className="divide-y divide-rose-50">
                            {incidents.map((r, i) => (
                                <div key={i} className="px-6 py-4 flex gap-4 items-start hover:bg-rose-50/40 transition-colors">
                                    <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-lg shrink-0 mt-0.5">{r['időpont'] ?? '–'}</span>
                                    <p className="text-slate-700 text-sm leading-relaxed">{r['leírás'] ?? '–'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Eseménynaptár */}
                {events.length > 0 && (
                    <SectionCard title="Eseménynaptár" count={events.length} countSuffix="tétel"
                        icon={<div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>}>
                        <div className="divide-y divide-slate-50">
                            {events.map((r, i) => (
                                <div key={i} className="px-6 py-4 flex gap-4 items-start hover:bg-slate-50/80 transition-colors">
                                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg shrink-0 whitespace-nowrap mt-0.5">{r['idő_tól'] ?? ''} – {r['idő_ig'] ?? ''}</span>
                                    <p className="text-slate-700 text-sm leading-relaxed">{r['leírás'] ?? '–'}</p>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}

                {/* Tűzjelzések */}
                {fireAlarms.length > 0 && (
                    <SectionCard title="Tűzjelző rendszer jelzések" count={fireAlarms.length} countSuffix="jelzés"
                        icon={<div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/></svg></div>}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Megnevezés</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Készpont</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">Időpont</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ellenőrző</th>
                                </tr></thead>
                                <tbody className="divide-y divide-slate-50">
                                    {fireAlarms.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-3.5 text-slate-700">{r['megnevezés'] ?? '–'}</td>
                                            <td className="px-5 py-3.5 text-slate-500">{r['készpont'] ?? '–'}</td>
                                            <td className="px-5 py-3.5 font-mono text-slate-400 text-xs">{r['időpont'] ?? '–'}</td>
                                            <td className="px-5 py-3.5 font-semibold text-slate-800">{r['ellenőrző'] ?? '–'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {/* Liftek */}
                {elevators.length > 0 && (
                    <SectionCard title="Liftek ellenőrzése" count={elevators.length} countSuffix="lift"
                        icon={<div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg></div>}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Megnevezés</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Időpont</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ellenőrző</th>
                                </tr></thead>
                                <tbody className="divide-y divide-slate-50">
                                    {elevators.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-3.5 text-slate-700">{r['megnevezés'] ?? '–'}</td>
                                            <td className="px-5 py-3.5 font-mono text-slate-400 text-xs">{r['időpont'] ?? '–'}</td>
                                            <td className="px-5 py-3.5 font-semibold text-slate-800">{r['ellenőrző'] ?? '–'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {/* Karbantartások */}
                {maintenance.length > 0 && (
                    <SectionCard title="Karbantartások / munkavégzések" count={maintenance.length} countSuffix="tétel"
                        icon={<div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cég / kivitelező</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Helyszín / munka</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Időtartam</th>
                                </tr></thead>
                                <tbody className="divide-y divide-slate-50">
                                    {maintenance.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-3.5 font-semibold text-slate-800">{r['cég'] ?? '–'}</td>
                                            <td className="px-5 py-3.5 text-slate-500">{r['helyszín'] ?? '–'}</td>
                                            <td className="px-5 py-3.5 font-mono text-slate-400 text-xs">{r['idő_tól'] ?? ''} – {r['idő_ig'] ?? ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {/* Aláírás */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </div>
                            <span className="text-sm text-slate-500">A jelentést készítette:</span>
                        </div>
                        <span className="font-bold text-slate-800">{report.prepared_by}</span>
                    </div>
                </div>

                {/* Megosztás – PM nem látja */}
                {!isPm && <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700">Megosztva</p>
                                <p className="text-xs text-slate-400">
                                    {sharedUsers.length > 0 ? sharedUsers.map(u => u.name).join(', ') : 'Nincs megosztva senkivel'}
                                </p>
                            </div>
                        </div>
                        {isCreator && (
                            <button onClick={() => setShareOpen(!shareOpen)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-violet-50 hover:border-violet-200 text-slate-600 hover:text-violet-700 text-xs font-semibold transition-colors cursor-pointer">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                {shareOpen ? 'Bezárás' : 'Szerkesztés'}
                            </button>
                        )}
                    </div>
                    {isCreator && shareOpen && (
                        <form onSubmit={saveShare} className="border-t border-slate-100 px-6 py-5">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Válassza ki kik láthatják ezt a jelentést:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 mb-4">
                                {allUsers.map(u => (
                                    <label key={u.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${selectedIds.includes(u.id) ? 'border-violet-200 bg-violet-50' : 'border-slate-200 bg-slate-50 hover:bg-violet-50 hover:border-violet-200'}`}>
                                        <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleUser(u.id)}
                                            className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer" />
                                        <div className="min-w-0 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">{u.name.charAt(0)}</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                                                <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <button type="submit"
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                Megosztás mentése
                            </button>
                        </form>
                    )}
                </div>}

            </div>
        </Layout>
    );
}
