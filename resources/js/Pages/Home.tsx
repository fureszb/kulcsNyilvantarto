import { Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import type { Location } from '../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    locations: Location[];
}

export default function Home({ locations }: Props) {
    return (
        <AppLayout title="Helyszín választó">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
                <div
                    className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />
                <div className="relative px-8 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                            <Link href={route('home')} className="hover:text-slate-300 transition-colors">Főoldal</Link>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                            <span className="text-slate-400">Kulcsnyilvántartó</span>
                        </nav>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Kulcs & Kártya Ellenőrzés</h1>
                        <p className="text-slate-400 mt-2 text-sm">Válasszon helyszínt az ellenőrzés megkezdéséhez</p>
                    </div>
                    <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                        </svg>
                    </div>
                </div>
            </div>

            {locations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-600">Nincs helyszín</h2>
                    <p className="text-slate-400 text-sm mt-1">Az adminisztrátor feltöltése után lesznek helyszínek.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {locations.map((location) => (
                        <Link
                            key={location.id}
                            href={route('keys.show', location.id)}
                            className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-blue-100/80 hover:border-blue-200 motion-safe:hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        >
                            {/* Top accent bar */}
                            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            {/* Shimmer */}
                            <div className="absolute inset-0 -translate-x-full pointer-events-none z-10 bg-gradient-to-r from-transparent via-blue-50/60 to-transparent motion-safe:group-hover:translate-x-full motion-safe:transition-transform motion-safe:duration-700" />

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:border-blue-200 transition-all overflow-hidden shrink-0">
                                        {location.logo_path ? (
                                            <img src={`/storage/${location.logo_path}`} className="w-full h-full object-contain p-1" alt={location.name} />
                                        ) : location.icon ? (
                                            <span className="text-2xl leading-none">{location.icon}</span>
                                        ) : (
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                        {location.items_count} tétel
                                    </span>
                                </div>
                                <h2 className="text-base font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">
                                    {location.name}
                                </h2>
                                {location.responsible_person && (
                                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {location.responsible_person}
                                    </p>
                                )}
                                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">Megnyitás</span>
                                    <div className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-600 border border-blue-100 group-hover:border-blue-600 flex items-center justify-center transition-all duration-300">
                                        <svg className="w-3.5 h-3.5 text-blue-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
