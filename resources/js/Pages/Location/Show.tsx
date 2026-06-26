import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import type { Location, Check, PaginatedData, AuthUser } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    location: Location;
    checks: PaginatedData<Check>;
    authUser: AuthUser;
}

export default function LocationShow({ location, checks, authUser }: Props) {
    const isAdmin = authUser?.is_admin;
    const isPm = authUser?.is_property_manager;
    const canSeeAll = isAdmin || isPm;

    return (
        <AppLayout title={`${location.name} – Ellenőrzések`}>
            <div className="max-w-5xl mx-auto">

                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-800/10 rounded-full blur-3xl pointer-events-none" />
                    <div
                        className="absolute inset-0 opacity-[0.025] pointer-events-none"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
                            backgroundSize: '32px 32px',
                        }}
                    />
                    <div className="relative px-4 py-6 sm:px-8 sm:py-8 flex items-start justify-between gap-6 flex-wrap">
                        <div className="flex items-center gap-5">
                            {/* Ikon */}
                            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 overflow-hidden">
                                {location.logo_path ? (
                                    <img src={`/storage/${location.logo_path}`} className="w-full h-full object-contain p-1" alt="" />
                                ) : location.icon ? (
                                    <span className="text-3xl leading-none">{location.icon}</span>
                                ) : (
                                    <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-0.5">Kulcs &amp; Kártya Ellenőrzés</p>
                                <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">{location.name}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                        {location.items_count ?? 0} tétel
                                    </span>
                                    {location.responsible_person && (
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {location.responsible_person}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                            <Link
                                href={route('keys.index')}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                Vissza
                            </Link>
                            <Link
                                href={route('check.show', location.id)}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Új ellenőrzés
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Szekció fej */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                        {canSeeAll ? 'Összes ellenőrzés' : 'Saját ellenőrzések'}
                        {checks.total > 0 && (
                            <span className="ml-1.5 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{checks.total}</span>
                        )}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Lista */}
                {checks.data.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-base font-semibold text-slate-600">Még nincs ellenőrzés</p>
                        <p className="text-sm text-slate-400 mt-1 mb-5">Az első ellenőrzés rögzítése után itt jelennek meg az előzmények.</p>
                        <Link
                            href={route('check.show', location.id)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Első ellenőrzés indítása
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {checks.data.map((check) => {
                            const total = check.check_items_count ?? 0;
                            const checked = check.checked_count ?? 0;
                            const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
                            const allOk = pct === 100;
                            const noneOk = pct === 0;

                            return (
                                <div key={check.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="px-5 py-4 flex items-center gap-4 flex-wrap">

                                        {/* Státusz ikon */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            allOk
                                                ? 'bg-emerald-50 border border-emerald-100'
                                                : noneOk
                                                ? 'bg-slate-100 border border-slate-200'
                                                : 'bg-amber-50 border border-amber-100'
                                        }`}>
                                            {allOk ? (
                                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : noneOk ? (
                                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Infók */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-bold text-slate-800">
                                                    {new Date(check.created_at).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(check.created_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {canSeeAll && (
                                                    <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-medium">
                                                        {check.checked_by}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Progress bar */}
                                            <div className="flex items-center gap-2.5 mt-2">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[160px]">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${allOk ? 'bg-emerald-500' : noneOk ? 'bg-slate-300' : 'bg-amber-400'}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-semibold whitespace-nowrap ${allOk ? 'text-emerald-600' : noneOk ? 'text-slate-400' : 'text-amber-600'}`}>
                                                    {checked}/{total} ({pct}%)
                                                </span>
                                            </div>
                                        </div>

                                        {/* Akció gombok */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link
                                                href={route('checks.show', check.id)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 text-slate-600 hover:text-blue-700 text-xs font-semibold transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Megtekintés
                                            </Link>
                                            {isAdmin && (
                                                <Link
                                                    href={route('checks.edit', check.id)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-200 text-slate-400 hover:text-amber-700 text-xs font-semibold transition-colors"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Szerkesztés
                                                </Link>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {checks.last_page > 1 && (
                    <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-400">{checks.from}–{checks.to} / {checks.total}</span>
                        <div className="flex items-center gap-1">
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
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
