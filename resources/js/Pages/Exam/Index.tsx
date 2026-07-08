import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import { Trophy, FileQuestion, PlayCircle, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import type { Exam } from '../../types';

declare function route(name: string, params?: unknown): string;

interface MyResult {
    id: number;
    exam_title: string;
    score: number;
    total: number;
    score_percent: number;
    completed_at: string;
    tab_violations: number;
}

interface Props {
    exams: Exam[];
    myResults?: MyResult[];
}

export default function ExamIndex({ exams, myResults = [] }: Props) {
    return (
        <AppLayout title="Vizsgák">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl"
            >
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-600/20 rounded-full blur-3xl pointer-events-none aurora-blob-1" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none aurora-blob-2" />
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
                        <Trophy className="w-8 h-8 text-amber-300" strokeWidth={1.5} />
                    </div>
                </div>
            </motion.div>

            {exams.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
                        <Trophy className="w-8 h-8 text-amber-200" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-600">Még nincs vizsga</h2>
                    <p className="text-slate-400 text-sm mt-1">Az adminisztrátor hamarosan feltölti a vizsgákat.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {exams.map((exam, index) => (
                        <motion.div
                            key={exam.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4), ease: 'easeOut' }}
                            className="group relative flex flex-col overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-amber-100/80 hover:border-amber-200 motion-safe:hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* Banner */}
                            <div className="relative h-20 shrink-0 bg-gradient-to-br from-amber-50 via-amber-50/60 to-orange-50 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 -translate-x-full pointer-events-none z-10 bg-gradient-to-r from-transparent via-white/50 to-transparent motion-safe:group-hover:translate-x-full motion-safe:transition-transform motion-safe:duration-700" />
                                <div className="relative w-12 h-12 rounded-2xl bg-white shadow-sm border border-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                    <Trophy className="w-6 h-6 text-amber-600" strokeWidth={1.75} />
                                </div>
                                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur text-amber-700 border border-amber-100 shadow-sm">
                                    <FileQuestion className="w-3 h-3" />
                                    {exam.steps_count}
                                </span>
                            </div>

                            <div className="p-5 sm:p-6 flex flex-col flex-1">
                                <h2 className="text-base font-bold text-slate-800 leading-tight">{exam.title}</h2>
                                {exam.description ? (
                                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 flex-1 leading-relaxed">{exam.description}</p>
                                ) : (
                                    <div className="flex-1" />
                                )}

                                <Link
                                    href={route('exam.show', exam.id)}
                                    className="mt-5 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors w-full"
                                >
                                    <PlayCircle className="w-4 h-4" />
                                    Vizsga megkezdése
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Elvégzett vizsgák */}
            {myResults.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                    className="mt-10"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h2 className="text-lg font-extrabold text-slate-800">Elvégzett vizsgák</h2>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{myResults.length}</span>
                    </div>

                    <div className="space-y-3">
                        {myResults.map((r, index) => {
                            const pct = r.score_percent;
                            const scoreColor = pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600';
                            const scoreBg   = pct >= 70 ? 'bg-emerald-50 border-emerald-200' : pct >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
                            return (
                                <motion.div
                                    key={r.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                                >
                                    <Link
                                        href={route('exam.result.show', r.id)}
                                        className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg hover:shadow-amber-100/60 hover:border-amber-200 transition-all duration-300"
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-100 group-hover:border-amber-200 transition-colors">
                                            <Trophy className="w-5 h-5 text-amber-600" strokeWidth={1.75} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors truncate block">{r.exam_title}</span>
                                            <div className="flex items-center gap-x-3 gap-y-1 mt-1 flex-wrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-xs font-extrabold ${scoreBg} ${scoreColor}`}>
                                                    {r.score}/{r.total} · {pct}%
                                                </span>
                                                {r.tab_violations > 0 && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold" title="Fókuszvesztések száma">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        {r.tab_violations}
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-400">{r.completed_at}</span>
                                            </div>
                                        </div>
                                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 group-hover:text-amber-700 transition-colors shrink-0">
                                            <Eye className="w-3.5 h-3.5" />
                                            Visszanézés
                                        </span>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AppLayout>
    );
}
