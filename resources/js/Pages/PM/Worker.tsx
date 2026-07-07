import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import PmLayout from '../../Layouts/PmLayout';
import type { TenantUser, Training, Exam, ActivityLog } from '../../types';

interface TrainingRow {
    training: Training;
    training_done: boolean;
    training_result: Record<string, unknown> | null;
}

interface ExamResult {
    id: number;
    score: number;
    max_score: number;
    passed: boolean;
    score_percent?: number;
}

interface ExamRow {
    exam: Exam;
    exam_done: boolean;
    last_exam: ExamResult | null;
    exam_count: number;
}

interface WorkerStats {
    worker: TenantUser;
    training_pct: number;
    location_pct: number;
    prof_pct: number | null;
}

interface Props {
    user: TenantUser;
    trainingRows: TrainingRow[];
    examRows: ExamRow[];
    stats: WorkerStats;
    recentActivity: ActivityLog[];
}

function pctTheme(pct: number, hi: number, mid: number) {
    if (pct >= hi) return { text: 'text-green-600', bar: 'bg-green-500' };
    if (pct >= mid) return { text: 'text-amber-600', bar: 'bg-amber-400' };
    return { text: 'text-red-600', bar: 'bg-red-400' };
}

function MiniBar({ pct, hi, mid, delay }: { pct: number; hi: number; mid: number; delay?: number }) {
    const { bar } = pctTheme(pct, hi, mid);
    return (
        <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden w-16 mx-auto">
            <div
                className={`h-full rounded-full ${bar}`}
                style={{ width: `${pct}%`, transition: 'width 1.1s cubic-bezier(.16,1,.3,1)', transitionDelay: `${delay ?? 0}ms` }}
            />
        </div>
    );
}

function dotColor(eventType: string) {
    if (eventType === 'check.completed')    return 'bg-blue-400';
    if (eventType === 'training.completed') return 'bg-indigo-400';
    if (eventType === 'exam.completed')     return 'bg-amber-400';
    return 'bg-slate-300';
}

export default function PmWorker({ user, trainingRows, examRows, stats, recentActivity }: Props) {
    const employedSince = user.employed_since ? new Date(user.employed_since) : null;
    const initial = user.name ? user.name.charAt(0) : '?';
    const trainingTheme = pctTheme(stats.training_pct, 80, 50);
    const locationTheme = pctTheme(stats.location_pct, 80, 50);
    const profTheme = stats.prof_pct !== null ? pctTheme(stats.prof_pct, 70, 50) : null;
    const isSecurityLead = route().current('security-lead.*');
    const backRoute = isSecurityLead ? 'security-lead.workers' : 'pm.dashboard';
    const [nudged, setNudged] = useState<Record<number, boolean>>({});

    function nudgeExam(examId: number) {
        router.post(route('security-lead.workers.nudge-exam', [user.id, examId]), {}, {
            preserveScroll: true,
            onSuccess: () => setNudged(n => ({ ...n, [examId]: true })),
        });
    }

    return (
        <PmLayout title={`${user.name} – részletek`}>

            {/* Hero */}
            <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                <div
                    className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }}
                />
                <div className="relative px-8 py-8 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 items-center justify-center text-2xl font-extrabold text-amber-300 shrink-0">
                            {initial}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Property Manager · Dolgozó</p>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">{user.name}</h1>
                            <p className="text-slate-400 mt-1 text-sm">
                                {user.email}
                                {employedSince && (
                                    <> &nbsp;· Belépett: {employedSince.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}</>
                                )}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route(backRoute)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                        Vissza
                    </Link>
                </div>
            </div>

            {/* Stats row */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                <div className="grid grid-cols-3 divide-x divide-slate-100">
                    {/* Training */}
                    <div className="px-6 py-5 text-center">
                        <p className={`text-2xl font-extrabold ${trainingTheme.text}`}>{stats.training_pct}%</p>
                        <MiniBar pct={stats.training_pct} hi={80} mid={50} delay={400} />
                        <p className="text-xs text-slate-500 font-semibold mt-1.5">Oktatási anyagok</p>
                    </div>
                    {/* Location */}
                    <div className="px-6 py-5 text-center">
                        <p className={`text-2xl font-extrabold ${locationTheme.text}`}>{stats.location_pct}%</p>
                        <MiniBar pct={stats.location_pct} hi={80} mid={50} delay={550} />
                        <p className="text-xs text-slate-500 font-semibold mt-1.5">Helyismeret</p>
                    </div>
                    {/* Proficiency */}
                    <div className="px-6 py-5 text-center">
                        {stats.prof_pct !== null && profTheme ? (
                            <>
                                <p className={`text-2xl font-extrabold ${profTheme.text}`}>{stats.prof_pct}%</p>
                                <MiniBar pct={stats.prof_pct} hi={70} mid={50} delay={700} />
                            </>
                        ) : (
                            <>
                                <p className="text-2xl font-extrabold text-slate-300">–</p>
                                <div className="mt-2 h-1 w-16 mx-auto" />
                            </>
                        )}
                        <p className="text-xs text-slate-500 font-semibold mt-1.5">Szakmai tudás</p>
                    </div>
                </div>
            </div>

            {/* Training table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                    <h2 className="font-bold text-slate-800">Oktatások</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Oktatás neve</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Típus</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Elvégzett</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {trainingRows.length === 0 ? (
                                <tr><td colSpan={3} className="px-6 py-6 text-center text-slate-400 text-sm">Nincs aktív oktatás.</td></tr>
                            ) : trainingRows.map(({ training, training_done }) => (
                                <tr key={training.id} className="hover:bg-amber-50/40 transition-colors duration-150">
                                    <td className="px-6 py-3.5 font-medium text-slate-800">{training.title}</td>
                                    <td className="px-4 py-3.5">
                                        {training.is_location_knowledge ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                                                Helyismereti
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Általános</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        {training_done ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                                Elvégzett
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-400">Hiányzik</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Exam table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <h2 className="font-bold text-slate-800">Vizsgák</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vizsga neve</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Legjobb eredmény</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Alkalmak</th>
                                {isSecurityLead && <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {examRows.length === 0 ? (
                                <tr><td colSpan={isSecurityLead ? 4 : 3} className="px-6 py-6 text-center text-slate-400 text-sm">Nincs aktív vizsga.</td></tr>
                            ) : examRows.map(({ exam, exam_done, last_exam, exam_count }) => {
                                const pct = last_exam?.score_percent ?? (last_exam && last_exam.max_score > 0 ? Math.round(last_exam.score / last_exam.max_score * 100) : null);
                                return (
                                    <tr key={exam.id} className="hover:bg-amber-50/40 transition-colors duration-150">
                                        <td className="px-6 py-3.5 font-medium text-slate-800">{exam.title}</td>
                                        <td className="px-4 py-3.5 text-center">
                                            {exam_done && pct !== null ? (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${pct >= 70 ? 'bg-green-50 text-green-700' : pct >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                                    {pct}%
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-xs">–</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3.5 text-right text-slate-500">
                                            {exam_count > 0 ? `${exam_count} alkalom` : '–'}
                                        </td>
                                        {isSecurityLead && (
                                            <td className="px-6 py-3.5 text-right">
                                                <button
                                                    onClick={() => nudgeExam(exam.id)}
                                                    disabled={!!nudged[exam.id]}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:cursor-default ${nudged[exam.id] ? 'text-green-600' : 'text-blue-600 hover:bg-blue-50'}`}
                                                >
                                                    {nudged[exam.id] ? (
                                                        <>
                                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                                            Elküldve
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                                                            Emlékeztető
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent activity */}
            {recentActivity.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <h2 className="font-bold text-slate-800">Legutóbbi tevékenységek</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentActivity.map((log) => (
                            <div key={log.id} className="px-6 py-3.5 flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor(log.event_type ?? '')}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 truncate">{log.description}</p>
                                </div>
                                <span className="text-xs text-slate-400 shrink-0">
                                    {new Date(log.created_at).toLocaleString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </PmLayout>
    );
}
