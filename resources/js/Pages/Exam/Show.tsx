import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import AppLayout from '../../Layouts/AppLayout';
import type { Exam } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Answer {
    id: number;
    text: string;
}

interface StepData {
    id: number;
    question: string;
    question_type: 'radio' | 'checkbox' | 'text';
    answers: Answer[];
}

interface ResultAnswer {
    id: number;
    text: string;
    is_correct: boolean;
}

interface ResultItem {
    step_id: number;
    question: string;
    question_type: 'radio' | 'checkbox' | 'text';
    is_correct: boolean;
    selected_ids: number[];
    text_input: string;
    answers: ResultAnswer[];
}

interface ServerResult {
    score: number;
    total: number;
    results: ResultItem[];
}

interface UserAnswer {
    step_id: number;
    selected_ids: number[];
    text_input: string;
}

interface Props {
    exam: Exam & {
        time_limit_minutes?: number | null;
        shuffle_questions?: boolean;
        shuffle_answers?: boolean;
    };
    stepsData?: StepData[];
    participantName?: string;
    attemptsUsed?: number;
    maxAttempts?: number | null;
    cooldownRemaining?: number;
    blocked?: boolean;
}

export default function ExamShow({
    exam,
    stepsData,
    participantName = '',
    attemptsUsed = 0,
    maxAttempts = null,
    cooldownRemaining = 0,
    blocked = false,
}: Props) {
    const steps: StepData[] = stepsData ?? (exam as any).steps ?? [];

    const [started,        setStarted]        = useState(false);
    const [completed,      setCompleted]       = useState(false);
    const [currentStep,    setCurrentStep]     = useState(0);
    const [advancing,      setAdvancing]       = useState(false);
    const [submitting,     setSubmitting]      = useState(false);
    const [serverResult,   setServerResult]    = useState<ServerResult | null>(null);
    const [submitError,    setSubmitError]     = useState('');

    // Per-step answer collection
    const [selectedAnswerId,  setSelectedAnswerId]  = useState<number | null>(null);
    const [checkedAnswerIds,  setCheckedAnswerIds]  = useState<number[]>([]);
    const [textInput,         setTextInput]         = useState('');
    const [answered,          setAnswered]          = useState(false);

    // Tab detection
    const [tabViolations,  setTabViolations]  = useState(0);
    const tabViolRef = useRef(0);

    // Timer
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const startedAtRef = useRef<string>('');
    const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
    const allAnswersRef = useRef<UserAnswer[]>([]);

    const step = steps[currentStep];
    const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

    // Tab visibility detection
    useEffect(() => {
        if (!started || completed) return;
        const handler = () => {
            if (document.hidden) {
                tabViolRef.current += 1;
                setTabViolations(tabViolRef.current);
            }
        };
        document.addEventListener('visibilitychange', handler);
        return () => document.removeEventListener('visibilitychange', handler);
    }, [started, completed]);

    // Timer
    useEffect(() => {
        if (!started || !exam.time_limit_minutes) return;
        const secs = exam.time_limit_minutes * 60;
        setTimeLeft(secs);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    if (!completed && !submitting) {
                        void doSubmit(allAnswersRef.current);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [started]);

    function resetStep() {
        setSelectedAnswerId(null);
        setCheckedAnswerIds([]);
        setTextInput('');
        setAnswered(false);
    }

    function handleStart() {
        startedAtRef.current = new Date().toISOString();
        setStarted(true);
    }

    async function doSubmit(answers: UserAnswer[]) {
        if (timerRef.current) clearInterval(timerRef.current);
        setSubmitting(true);
        setCompleted(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
            const resp = await fetch(route('exam.result', exam.id), {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
                body:    JSON.stringify({
                    answers,
                    tab_violations: tabViolRef.current,
                    started_at:     startedAtRef.current,
                }),
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                setSubmitError((err as any).error ?? 'Hiba történt a vizsga mentésekor.');
                return;
            }
            const data = await resp.json() as ServerResult;
            setServerResult(data);
        } catch {
            setSubmitError('Az eredmény mentése sikertelen – kérjük jelezze az adminisztrátornak.');
        } finally {
            setSubmitting(false);
        }
    }

    function advanceWith(answer: UserAnswer) {
        const newAnswers = [...allAnswersRef.current, answer];
        allAnswersRef.current = newAnswers;

        if (currentStep < steps.length - 1) {
            setAdvancing(true);
            setTimeout(() => {
                setCurrentStep(s => s + 1);
                resetStep();
                setAdvancing(false);
            }, 400);
        } else {
            void doSubmit(newAnswers);
        }
    }

    function selectRadio(answerId: number) {
        if (answered || advancing) return;
        setSelectedAnswerId(answerId);
        setAnswered(true);
        setAdvancing(true);
        setTimeout(() => {
            setAdvancing(false);
            advanceWith({ step_id: step.id, selected_ids: [answerId], text_input: '' });
        }, 500);
    }

    function toggleCheckbox(answerId: number) {
        if (answered) return;
        setCheckedAnswerIds(prev =>
            prev.includes(answerId) ? prev.filter(id => id !== answerId) : [...prev, answerId]
        );
    }

    function submitCheckbox() {
        if (answered || checkedAnswerIds.length === 0) return;
        setAnswered(true);
        advanceWith({ step_id: step.id, selected_ids: checkedAnswerIds, text_input: '' });
    }

    function submitText() {
        if (answered || !textInput.trim()) return;
        setAnswered(true);
        advanceWith({ step_id: step.id, selected_ids: [], text_input: textInput });
    }

    const score        = serverResult?.score ?? 0;
    const total        = serverResult?.total ?? steps.length;
    const scorePercent = total > 0 ? Math.round((score / total) * 100) : 0;

    const resultHeaderClass =
        scorePercent >= 70 ? 'bg-gradient-to-r from-emerald-600 to-green-500'
        : scorePercent >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500'
        : 'bg-gradient-to-r from-red-600 to-red-500';

    const fmtTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${String(sec).padStart(2, '0')}`;
    };

    const attemptsLeft = maxAttempts !== null ? maxAttempts - attemptsUsed : null;

    return (
        <AppLayout title={exam.title}>
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="relative px-8 py-7">
                    <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                        <a href={route('home')} className="hover:text-slate-300 transition-colors">Főoldal</a>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        <Link href={route('exam.index')} className="hover:text-slate-300 transition-colors">Vizsgák</Link>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        <span className="text-slate-400">{exam.title}</span>
                    </nav>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">{exam.title}</h1>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                Vizsga
                            </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {started && !completed && exam.time_limit_minutes && timeLeft !== null && (
                                <span className={`text-sm font-mono px-3 py-1 rounded-lg border ${timeLeft <= 60 ? 'text-red-400 bg-red-500/10 border-red-500/30 animate-pulse' : 'text-slate-300 bg-white/5 border-white/10'}`}>
                                    {fmtTime(timeLeft)}
                                </span>
                            )}
                            {started && !completed && tabViolations > 0 && (
                                <span className="text-xs px-2 py-1 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400">
                                    ⚠ {tabViolations}× fókuszvesztés
                                </span>
                            )}
                            {started && !completed && (
                                <span className="text-sm text-slate-400 font-mono bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                                    {currentStep + 1} / {steps.length} kérdés
                                </span>
                            )}
                            {completed && <span className="text-sm font-bold text-emerald-400">Befejezve</span>}
                        </div>
                    </div>
                    {started && !completed && (
                        <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                    )}
                    {completed && (
                        <div className="mt-4 h-1.5 bg-white/10 rounded-full">
                            <div className="h-full bg-emerald-400 rounded-full w-full transition-all duration-700" />
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Blocked */}
            {!started && blocked && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                    className="max-w-md mx-auto"
                >
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
                        <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                            </svg>
                        </div>
                        {cooldownRemaining > 0 ? (
                            <>
                                <h2 className="text-lg font-extrabold text-slate-900 mb-2">Várakozási idő</h2>
                                <p className="text-sm text-slate-500">A következő kísérletig még <strong className="text-slate-700">{cooldownRemaining} perc</strong> várakozás szükséges.</p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-lg font-extrabold text-slate-900 mb-2">Nincs több kísérlet</h2>
                                <p className="text-sm text-slate-500">Elérted a megengedett {maxAttempts} kísérlet maximumát ennél a vizsgánál.</p>
                            </>
                        )}
                        <Link href={route('exam.index')} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors">
                            Vissza a vizsgákhoz
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* Start */}
            {!started && !blocked && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                    className="max-w-md mx-auto"
                >
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                        <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mb-5">
                            <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 mb-1">Vizsga megkezdése</h2>
                        {exam.description ? (
                            <p className="text-sm text-slate-500 mb-4 leading-relaxed">{exam.description}</p>
                        ) : (
                            <p className="text-sm text-slate-500 mb-4">{steps.length} kérdéses vizsga.</p>
                        )}

                        {/* Attempt info */}
                        {maxAttempts !== null && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center gap-2.5">
                                <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <p className="text-sm text-blue-800">Kísérletek: <strong>{attemptsUsed} / {maxAttempts}</strong> felhasználva{attemptsLeft !== null ? ` (még ${attemptsLeft} maradt)` : ''}</p>
                            </div>
                        )}

                        {/* Timer info */}
                        {exam.time_limit_minutes && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center gap-2.5">
                                <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <p className="text-sm text-amber-800">Időkorlát: <strong>{exam.time_limit_minutes} perc</strong></p>
                            </div>
                        )}

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                            <div className="flex items-start gap-2.5">
                                <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <p className="text-sm text-amber-800 leading-relaxed">Vizsga módban <strong>nem látja menet közben</strong>, hogy helyesen válaszolt-e. A helyes válaszok és az értékelés csak a végén jelennek meg.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                            <span className="text-sm text-slate-600 font-medium">{participantName}</span>
                        </div>

                        <button
                            onClick={handleStart}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Vizsga megkezdése
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Kérdések */}
            {started && !completed && step && (
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
                        {currentStep + 1}. kérdés / {steps.length}
                    </p>
                    <h2 className="text-lg font-bold text-slate-800 mb-6 leading-snug">{step.question}</h2>

                    {step.question_type === 'radio' && (
                        <div className="space-y-3">
                            {step.answers.map(answer => (
                                <button
                                    key={answer.id}
                                    onClick={() => selectRadio(answer.id)}
                                    disabled={answered}
                                    className={`w-full text-left px-4 py-3.5 rounded-xl border-2 font-medium text-sm transition-all flex items-center gap-3 ${answered && selectedAnswerId === answer.id ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50 cursor-pointer'}`}
                                >
                                    <span className={`w-5 h-5 rounded-full border-2 shrink-0 ${answered && selectedAnswerId === answer.id ? 'border-amber-400 bg-amber-400' : 'border-slate-300'}`} />
                                    <span>{answer.text}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {step.question_type === 'checkbox' && (
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jelöljön meg minden helyes választ:</p>
                            <div className="space-y-3">
                                {step.answers.map(answer => {
                                    const isChecked = checkedAnswerIds.includes(answer.id);
                                    return (
                                        <button
                                            key={answer.id}
                                            onClick={() => toggleCheckbox(answer.id)}
                                            disabled={answered}
                                            className={`w-full text-left px-4 py-3.5 rounded-xl border-2 font-medium text-sm transition-all flex items-center gap-3 ${isChecked ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50 cursor-pointer'}`}
                                        >
                                            <span className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center ${isChecked ? 'border-amber-400 bg-amber-400' : 'border-slate-300'}`}>
                                                {isChecked && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                                            </span>
                                            <span>{answer.text}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {!answered && (
                                <button onClick={submitCheckbox} disabled={checkedAnswerIds.length === 0} className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors cursor-pointer">
                                    Válasz leadása
                                </button>
                            )}
                        </div>
                    )}

                    {step.question_type === 'text' && (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (!answered && textInput.trim()) submitText(); } }}
                                disabled={answered}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 font-mono placeholder-slate-400 focus:border-amber-400 focus:bg-white focus:outline-none transition"
                                placeholder="Írja be a válaszát..."
                            />
                            {!answered && (
                                <button onClick={submitText} disabled={!textInput.trim()} className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors cursor-pointer">
                                    Válasz leadása
                                </button>
                            )}
                        </div>
                    )}

                    {advancing && <p className="text-xs text-slate-400 mt-4 text-center animate-pulse">Következő kérdés...</p>}
                </motion.div>
            )}

            {/* Submitting */}
            {completed && submitting && (
                <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-200 border-t-amber-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Eredmény értékelése...</p>
                </div>
            )}

            {/* Eredmény */}
            {completed && !submitting && serverResult && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="space-y-5"
                >
                    {submitError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{submitError}</div>
                    )}
                    {tabViolations > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                            <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            <p className="text-sm text-orange-800"><strong>Figyelmeztetés:</strong> A vizsga alatt {tabViolations}× hagyta el az ablak fókuszát. Ez rögzítve lett.</p>
                        </div>
                    )}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className={`px-8 py-6 ${resultHeaderClass}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-white/70 text-sm font-semibold">Vizsga teljesítve</p>
                                    <h2 className="text-2xl font-extrabold text-white mt-0.5">{exam.title}</h2>
                                    <p className="text-white/70 text-sm mt-1">Vizsgázó: <span className="text-white font-semibold">{participantName}</span></p>
                                </div>
                                <motion.div
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.15 }}
                                    className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0"
                                >
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                </motion.div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-slate-100">
                            <div className="px-6 py-5 text-center">
                                <p className="text-3xl font-extrabold text-slate-800">{score} / {total}</p>
                                <p className="text-xs font-semibold text-slate-500 mt-1">helyes válasz</p>
                            </div>
                            <div className="px-6 py-5 text-center">
                                <p className={`text-3xl font-extrabold ${scorePercent >= 70 ? 'text-emerald-600' : scorePercent >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{scorePercent}%</p>
                                <p className="text-xs font-semibold text-slate-500 mt-1">teljesítmény</p>
                            </div>
                        </div>
                    </div>

                    {/* Részletes kiértékelés */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                            <h3 className="font-bold text-slate-800">Részletes kiértékelés</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {serverResult.results.map((r, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.5) }}
                                    className={`p-5 ${r.is_correct ? 'bg-green-50/30' : 'bg-red-50/30'}`}>
                                    <div className="flex items-start gap-3 mb-4">
                                        <span className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${r.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{idx + 1}</span>
                                        <p className="font-semibold text-slate-800 text-sm">{r.question}</p>
                                    </div>
                                    {r.question_type !== 'text' && (
                                        <div className="ml-9 space-y-1.5">
                                            {r.answers.map(answer => {
                                                const chosen = r.selected_ids.includes(answer.id);
                                                const cls = answer.is_correct && chosen ? 'bg-green-100 border border-green-300 text-green-800'
                                                    : answer.is_correct && !chosen ? 'bg-green-50 border border-green-200 text-green-700'
                                                    : !answer.is_correct && chosen ? 'bg-red-100 border border-red-300 text-red-800'
                                                    : 'bg-slate-50 border border-slate-200 text-slate-400';
                                                return (
                                                    <div key={answer.id} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${cls}`}>
                                                        {answer.is_correct && chosen && <svg className="w-3.5 h-3.5 shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                                                        {answer.is_correct && !chosen && <svg className="w-3.5 h-3.5 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"/></svg>}
                                                        {!answer.is_correct && chosen && <svg className="w-3.5 h-3.5 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>}
                                                        {!answer.is_correct && !chosen && <span className="w-3.5 h-3.5 shrink-0" />}
                                                        <span className="flex-1">{answer.text}</span>
                                                        {answer.is_correct && !chosen && <span className="text-xs font-semibold text-green-600 whitespace-nowrap">Helyes válasz</span>}
                                                        {chosen && answer.is_correct && <span className="text-xs font-semibold text-green-700 whitespace-nowrap">Az Ön válasza ✓</span>}
                                                        {chosen && !answer.is_correct && <span className="text-xs font-semibold text-red-600 whitespace-nowrap">Az Ön válasza ✗</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {r.question_type === 'text' && (
                                        <div className="ml-9 space-y-2">
                                            <div className={`px-3 py-2.5 rounded-lg text-sm border flex items-center gap-2 ${r.is_correct ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
                                                <span className={`text-xs font-bold uppercase shrink-0 ${r.is_correct ? 'text-green-600' : 'text-red-600'}`}>Az Ön válasza:</span>
                                                <span className="font-mono">{r.text_input}</span>
                                                {r.is_correct && <svg className="w-4 h-4 text-green-600 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                                                {!r.is_correct && <svg className="w-4 h-4 text-red-600 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>}
                                            </div>
                                            {!r.is_correct && r.answers.length > 0 && (
                                                <div className="px-3 py-2 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800">
                                                    <span className="text-xs font-bold uppercase text-green-600">Helyes válasz: </span>
                                                    <span className="font-mono">{r.answers.map(a => a.text).join(' / ')}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Link href={route('exam.index')} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                            Vissza a vizsgákhoz
                        </Link>
                    </div>
                </motion.div>
            )}
        </AppLayout>
    );
}
