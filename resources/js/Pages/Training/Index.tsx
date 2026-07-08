import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import { GraduationCap, FileText, PlayCircle } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import type { Training } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    trainings: Training[];
}

export default function TrainingIndex({ trainings }: Props) {
    return (
        <AppLayout title="Oktatások">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl"
            >
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none aurora-blob-1" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none aurora-blob-2" />
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
                            <span className="text-slate-400">Oktatások</span>
                        </nav>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Oktatások</h1>
                        <p className="text-slate-400 mt-2 text-sm">Válasszon oktatást a megkezdéséhez</p>
                    </div>
                    <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                        <GraduationCap className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                    </div>
                </div>
            </motion.div>

            {trainings.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
                        <GraduationCap className="w-8 h-8 text-indigo-200" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-600">Még nincs oktatás</h2>
                    <p className="text-slate-400 text-sm mt-1">Az adminisztrátor hamarosan feltölti az oktatási anyagokat.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {trainings.map((t, index) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4), ease: 'easeOut' }}
                            className="group relative flex flex-col overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-100/80 hover:border-indigo-200 motion-safe:hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* Banner */}
                            <div className="relative h-20 shrink-0 bg-gradient-to-br from-indigo-50 via-indigo-50/60 to-violet-50 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 -translate-x-full pointer-events-none z-10 bg-gradient-to-r from-transparent via-white/50 to-transparent motion-safe:group-hover:translate-x-full motion-safe:transition-transform motion-safe:duration-700" />
                                <div className="relative w-12 h-12 rounded-2xl bg-white shadow-sm border border-indigo-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                    <GraduationCap className="w-6 h-6 text-indigo-600" strokeWidth={1.75} />
                                </div>
                                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur text-indigo-700 border border-indigo-100 shadow-sm">
                                    <FileText className="w-3 h-3" />
                                    {t.steps_count}
                                </span>
                            </div>

                            <div className="p-5 sm:p-6 flex flex-col flex-1">
                                <h2 className="text-base font-bold text-slate-800 leading-tight">{t.title}</h2>
                                {t.description ? (
                                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 flex-1 leading-relaxed">{t.description}</p>
                                ) : (
                                    <div className="flex-1" />
                                )}

                                <Link
                                    href={route('training.show', t.id)}
                                    className="mt-5 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors w-full"
                                >
                                    <PlayCircle className="w-4 h-4" />
                                    Oktatás megkezdése
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
