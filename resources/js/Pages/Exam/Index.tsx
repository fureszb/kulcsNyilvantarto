import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import type { Exam } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    exams: Exam[];
}

export default function ExamIndex({ exams }: Props) {
    return (
        <AppLayout title="Vizsgák">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
                <div
                    className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />
                <div className="relative px-8 sm:px-10 py-10 flex items-center justify-between gap-6">
                    <div>
                        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                            <a href={route('home')} className="hover:text-slate-300 transition-colors">Főoldal</a>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                            <span className="text-slate-400">Vizsgák</span>
                        </nav>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Vizsgák</h1>
                        <p className="text-slate-400 mt-2 text-sm">Válasszon vizsgát a megkezdéséhez</p>
                    </div>
                    <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                        <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                    </div>
                </div>
            </div>

            {exams.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-600">Még nincs vizsga</h2>
                    <p className="text-slate-400 text-sm mt-1">Az adminisztrátor hamarosan feltölti a vizsgákat.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {exams.map((exam) => (
                        <div
                            key={exam.id}
                            className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-amber-100/80 hover:border-amber-200 motion-safe:hover:-translate-y-1 transition-all duration-300 flex flex-col"
                        >
                            {/* Accent sáv */}
                            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Shimmer */}
                            <div className="absolute inset-0 -translate-x-full pointer-events-none z-10 bg-gradient-to-r from-transparent via-amber-50/60 to-transparent motion-safe:group-hover:translate-x-full motion-safe:transition-transform motion-safe:duration-700" />

                            <div className="p-6 flex flex-col flex-1">
                                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 group-hover:bg-amber-100 group-hover:border-amber-200 flex items-center justify-center mb-5 transition-all shrink-0">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                    </svg>
                                </div>

                                <h2 className="text-base font-bold text-slate-800 leading-tight">{exam.title}</h2>
                                {exam.description ? (
                                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 flex-1 leading-relaxed">{exam.description}</p>
                                ) : (
                                    <div className="flex-1" />
                                )}

                                <div className="mt-5 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        <span className="text-xs font-medium text-slate-400">{exam.steps_count} kérdés</span>
                                    </div>
                                    <Link
                                        href={route('exam.show', exam.id)}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors w-full"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                        </svg>
                                        Vizsga megkezdése
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
