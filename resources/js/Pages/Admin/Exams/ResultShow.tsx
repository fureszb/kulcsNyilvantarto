import { Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface ResultAnswer {
    id: number;
    text: string;
    is_correct: boolean;
}

interface ResultItem {
    step_id?: number;
    question: string;
    question_type?: 'radio' | 'checkbox' | 'text';
    is_correct: boolean;
    selected_ids?: number[];
    text_input?: string;
    answers?: ResultAnswer[];
}

interface ResultData {
    id: number;
    exam_id: number;
    exam_title: string;
    user_id?: number;
    name: string;
    email?: string;
    score: number;
    total: number;
    score_percent: number;
    completed_at: string;
    tab_violations: number;
    ip_address?: string | null;
    time_taken_seconds?: number | null;
    results: ResultItem[];
}

interface Props {
    result: ResultData;
}

function fmtSeconds(s: number | null | undefined): string {
    if (!s) return '—';
    const m   = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m} p ${sec} mp` : `${sec} mp`;
}

export default function AdminResultShow({ result }: Props) {
    const pct = result.score_percent;

    const headerClass =
        pct >= 70 ? 'bg-gradient-to-r from-emerald-600 to-green-500'
        : pct >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500'
        : 'bg-gradient-to-r from-red-600 to-red-500';

    const scoreColor =
        pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600';

    const isNewFormat = result.results.length > 0 && 'selected_ids' in result.results[0];

    return (
        <AdminLayout
            title={`Kitöltés – ${result.name}`}
            headerActions={
                <Link href={route('admin.exam-results.index')} className="btn-secondary text-sm flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                    Kitöltések
                </Link>
            }
        >
            {/* Fejléc / összegzés */}
            <div className="card overflow-hidden mb-5">
                <div className={`px-6 py-5 ${headerClass}`}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Vizsga kitöltés</p>
                            <h2 className="text-xl font-extrabold text-white">{result.exam_title}</h2>
                            <p className="text-white/80 text-sm mt-1">Kitöltő: <span className="text-white font-semibold">{result.name}</span></p>
                            {result.email && <p className="text-white/60 text-xs mt-0.5">{result.email}</p>}
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-3xl font-extrabold text-white">{pct}%</p>
                            <p className="text-white/70 text-sm">{result.score} / {result.total} helyes</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
                    <div className="px-5 py-4 text-center">
                        <p className={`text-2xl font-extrabold ${scoreColor}`}>{result.score}/{result.total}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">helyes válasz</p>
                    </div>
                    <div className="px-5 py-4 text-center">
                        <p className={`text-2xl font-extrabold ${result.tab_violations > 0 ? 'text-orange-600' : 'text-slate-600'}`}>{result.tab_violations}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">fókuszvesztés</p>
                    </div>
                    <div className="px-5 py-4 text-center">
                        <p className="text-2xl font-extrabold text-slate-700">{fmtSeconds(result.time_taken_seconds)}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">kitöltési idő</p>
                    </div>
                    <div className="px-5 py-4 text-center">
                        <p className="text-sm font-extrabold text-slate-700 font-mono">{result.ip_address ?? '—'}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">IP-cím</p>
                    </div>
                </div>

                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                    <p className="text-xs text-slate-500">Kitöltve: <span className="font-medium text-slate-700">{result.completed_at}</span></p>
                </div>
            </div>

            {result.tab_violations > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                    <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <p className="text-sm text-orange-800">A vizsga alatt <strong>{result.tab_violations}×</strong> hagyta el az ablak fókuszát.</p>
                </div>
            )}

            {/* Részletes kiértékelés */}
            {result.results.length > 0 && (
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                        <h3 className="font-bold text-slate-800">Részletes kiértékelés</h3>
                        <span className="text-xs text-slate-400 ml-auto">{result.results.length} kérdés</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {result.results.map((r, idx) => {
                            const correct = r.is_correct;
                            return (
                                <div key={idx} className={`p-5 ${correct ? 'bg-green-50/30' : 'bg-red-50/30'}`}>
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{idx + 1}</span>
                                        <p className="font-semibold text-slate-800 text-sm leading-snug flex-1">{r.question}</p>
                                        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {correct ? 'Helyes' : 'Helytelen'}
                                        </span>
                                    </div>

                                    {isNewFormat && r.answers && r.question_type !== 'text' && (
                                        <div className="ml-9 space-y-1.5">
                                            {r.answers.map(answer => {
                                                const chosen = (r.selected_ids ?? []).includes(answer.id);
                                                const cls =
                                                    answer.is_correct && chosen    ? 'bg-green-100 border border-green-300 text-green-800'
                                                    : answer.is_correct && !chosen  ? 'bg-green-50 border border-green-200 text-green-700'
                                                    : !answer.is_correct && chosen  ? 'bg-red-100 border border-red-300 text-red-800'
                                                    : 'bg-slate-50 border border-slate-200 text-slate-400';
                                                return (
                                                    <div key={answer.id} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${cls}`}>
                                                        {answer.is_correct && chosen   && <svg className="w-3.5 h-3.5 shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                                                        {answer.is_correct && !chosen  && <svg className="w-3.5 h-3.5 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"/></svg>}
                                                        {!answer.is_correct && chosen  && <svg className="w-3.5 h-3.5 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>}
                                                        {!answer.is_correct && !chosen && <span className="w-3.5 h-3.5 shrink-0" />}
                                                        <span className="flex-1">{answer.text}</span>
                                                        {answer.is_correct && !chosen  && <span className="text-xs font-semibold text-green-600 whitespace-nowrap">Helyes válasz</span>}
                                                        {chosen && answer.is_correct   && <span className="text-xs font-semibold text-green-700 whitespace-nowrap">Bejelölve ✓</span>}
                                                        {chosen && !answer.is_correct  && <span className="text-xs font-semibold text-red-600 whitespace-nowrap">Bejelölve ✗</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {isNewFormat && r.question_type === 'text' && (
                                        <div className="ml-9 space-y-2">
                                            <div className={`px-3 py-2.5 rounded-lg text-sm border flex items-center gap-2 ${correct ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
                                                <span className={`text-xs font-bold uppercase shrink-0 ${correct ? 'text-green-600' : 'text-red-600'}`}>Beírt válasz:</span>
                                                <span className="font-mono">{r.text_input || '—'}</span>
                                                {correct
                                                    ? <svg className="w-4 h-4 text-green-600 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                                    : <svg className="w-4 h-4 text-red-600 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                                                }
                                            </div>
                                            {!correct && r.answers && r.answers.length > 0 && (
                                                <div className="px-3 py-2 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800">
                                                    <span className="text-xs font-bold uppercase text-green-600">Helyes válasz: </span>
                                                    <span className="font-mono">{r.answers.map(a => a.text).join(' / ')}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!isNewFormat && (
                                        <div className="ml-9">
                                            <span className={`text-xs px-2 py-1 rounded-md font-semibold ${correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {correct ? '✓ Helyes választ adott' : '✗ Helytelen válasz'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
