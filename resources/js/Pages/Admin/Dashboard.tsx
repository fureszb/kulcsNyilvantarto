import { Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Card, CardHeader } from '../../Components/ui/Card';
import { IconBadge } from '../../Components/ui/IconBadge';

declare function route(name: string, params?: unknown): string;

interface Location {
    id: number;
    name: string;
}

interface Check {
    id: number;
    location: Location;
    checked_by: string;
    created_at: string;
    check_items_count: number;
    checked_count: number;
}

interface Stats {
    locations: number;
    checks_today: number;
    checks_total: number;
}

interface Props {
    stats: Stats;
    recentChecks: Check[];
}

const STAT_CONFIG = [
    {
        key: 'locations' as const,
        label: 'Helyszínek',
        icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
        tone: 'blue' as const,
        valueCss: 'text-blue-700',
    },
    {
        key: 'checks_today' as const,
        label: 'Mai ellenőrzések',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        tone: 'emerald' as const,
        valueCss: 'text-emerald-700',
    },
    {
        key: 'checks_total' as const,
        label: 'Összes ellenőrzés',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        tone: 'indigo' as const,
        valueCss: 'text-indigo-700',
    },
];

const QUICK_ACTIONS = [
    {
        href: 'admin.locations.create',
        label: 'Új helyszín felvétele',
        tone: 'blue' as const,
        icon: 'M12 4v16m8-8H4',
    },
    {
        href: 'admin.settings.edit',
        label: 'Email és jelszó beállítások',
        tone: 'slate' as const,
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
        href: 'history.index',
        label: 'Ellenőrzési előzmények',
        tone: 'indigo' as const,
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
];

export default function Dashboard({ stats, recentChecks }: Props) {
    return (
        <AdminLayout title="Áttekintés">

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {STAT_CONFIG.map(s => (
                    <Card key={s.key} className="p-6 flex items-center gap-4">
                        <IconBadge tone={s.tone}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon}/>
                            </svg>
                        </IconBadge>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{s.label}</p>
                            <p className={`text-3xl font-extrabold leading-none mt-1 ${s.valueCss}`}>{stats[s.key]}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Quick actions */}
                <Card>
                    <CardHeader className="justify-start">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gyors műveletek</p>
                    </CardHeader>
                    <div className="p-3 space-y-1">
                        {QUICK_ACTIONS.map(a => (
                            <Link
                                key={a.href}
                                href={route(a.href)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 group"
                            >
                                <IconBadge tone={a.tone} size="sm" className="transition-all duration-200 group-hover:scale-105">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={a.icon}/>
                                    </svg>
                                </IconBadge>
                                {a.label}
                                <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 ml-auto shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </Link>
                        ))}
                    </div>
                </Card>

                {/* Recent checks */}
                <Card>
                    <CardHeader>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Legutóbbi ellenőrzések</p>
                        <Link href={route('history.index')} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">Összes →</Link>
                    </CardHeader>
                    {recentChecks.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400">Még nincs ellenőrzés rögzítve.</div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {recentChecks.map((check) => {
                                const total = check.check_items_count;
                                const checked = check.checked_count;
                                const done = total > 0 && checked === total;
                                return (
                                    <div key={check.id} className="px-5 py-3 flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${done ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                                            {done ? (
                                                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">{check.location?.name ?? '–'}</p>
                                            <p className="text-xs text-slate-400">{check.checked_by} · {check.created_at}</p>
                                        </div>
                                        <span className={`text-xs font-bold shrink-0 ${done ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {checked}/{total}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}
