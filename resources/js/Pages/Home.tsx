import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import { Search, MapPin, KeyRound } from 'lucide-react';
import AppLayout from '../Layouts/AppLayout';
import type { Location } from '../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    locations: Location[];
}

export default function Home({ locations }: Props) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return locations;
        return locations.filter(l =>
            l.name.toLowerCase().includes(q) ||
            (l.responsible_person ?? '').toLowerCase().includes(q)
        );
    }, [locations, query]);

    return (
        <AppLayout title="Helyszín választó">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl"
            >
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none aurora-blob-1" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none aurora-blob-2" />
                <div
                    className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />
                <div className="relative px-8 sm:px-10 py-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
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

                    {/* Search */}
                    {locations.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="relative mt-6 max-w-md"
                        >
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Helyszín vagy felelős keresése..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:border-white/20 focus:ring-4 focus:ring-blue-500/10 transition"
                            />
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {locations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                        <MapPin className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-600">Nincs helyszín</h2>
                    <p className="text-slate-400 text-sm mt-1">Az adminisztrátor feltöltése után lesznek helyszínek.</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                        <Search className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-600">Nincs találat</h2>
                    <p className="text-slate-400 text-sm mt-1">Próbálj más keresőszót &bdquo;{query}&rdquo; helyett.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map((location, index) => (
                        <motion.div
                            key={location.id}
                            layout
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5), ease: 'easeOut' }}
                        >
                            <Link
                                href={route('keys.show', location.id)}
                                className="group relative flex flex-col overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-100/80 hover:border-blue-200 motion-safe:hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                                {/* Banner / thumbnail area */}
                                <div className="relative h-24 shrink-0 bg-gradient-to-br from-blue-50 via-blue-50/60 to-indigo-50 flex items-center justify-center overflow-hidden">
                                    <div
                                        className="absolute inset-0 opacity-[0.4] pointer-events-none"
                                        style={{
                                            backgroundImage: 'radial-gradient(rgba(59,130,246,.12) 1px,transparent 1px)',
                                            backgroundSize: '16px 16px',
                                        }}
                                    />
                                    {/* Shimmer */}
                                    <div className="absolute inset-0 -translate-x-full pointer-events-none z-10 bg-gradient-to-r from-transparent via-white/50 to-transparent motion-safe:group-hover:translate-x-full motion-safe:transition-transform motion-safe:duration-700" />

                                    <div className="relative w-14 h-14 rounded-2xl bg-white shadow-sm border border-blue-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                                        {location.logo_path ? (
                                            <img src={`/storage/${location.logo_path}`} className="w-full h-full object-contain p-1.5" alt={location.name} />
                                        ) : location.icon ? (
                                            <span className="text-3xl leading-none">{location.icon}</span>
                                        ) : (
                                            <KeyRound className="w-7 h-7 text-blue-600" strokeWidth={1.5} />
                                        )}
                                    </div>

                                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur text-blue-700 border border-blue-100 shadow-sm">
                                        {location.items_count} tétel
                                    </span>
                                </div>

                                <div className="p-5 sm:p-6 flex flex-col flex-1">
                                    <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">
                                        {location.name}
                                    </h2>
                                    {location.responsible_person && (
                                        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Felelős: {location.responsible_person}
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
                        </motion.div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
