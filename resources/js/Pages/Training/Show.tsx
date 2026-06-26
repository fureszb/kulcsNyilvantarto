import { useState, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import type { Training } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Answer {
    id: number;
    text: string;
    is_correct: boolean;
}

interface StepData {
    id: number;
    question: string;
    question_type: 'radio' | 'checkbox' | 'text';
    answers: Answer[];
    media_url?: string;
    media_type?: string;
    reveal_url?: string;
    reveal_type?: string;
}

interface Props {
    training: Training & { steps?: StepData[] };
    stepsData?: StepData[];
    participantName?: string;
    participantEmail?: string;
}

interface ResultEntry {
    question: string;
    attempts: number;
    correct: boolean;
}

export default function TrainingShow({ training, stepsData, participantName = '', participantEmail = '' }: Props) {
    const steps: StepData[] = stepsData ?? (training.steps as StepData[] | undefined) ?? [];

    const [started, setStarted] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [attemptsPerStep, setAttemptsPerStep] = useState<number[]>(() => steps.map(() => 0));

    // radio
    const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
    const [isCorrect, setIsCorrect] = useState(false);

    // checkbox
    const [checkedAnswers, setCheckedAnswers] = useState<number[]>([]);
    const [checkboxError, setCheckboxError] = useState('');

    // text
    const [textInput, setTextInput] = useState('');
    const [textSubmitted, setTextSubmitted] = useState(false);
    const [textCorrect, setTextCorrect] = useState(false);

    // results
    const [results, setResults] = useState<ResultEntry[]>([]);
    const [completedAt, setCompletedAt] = useState('');
    const [submitError, setSubmitError] = useState('');

    const step = steps[currentStep];
    const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;
    const firstTryCount = results.filter((r) => r.attempts === 1 && r.correct !== false).length;

    function resetStep() {
        setIsCorrect(false);
        setWrongAnswers([]);
        setCheckedAnswers([]);
        setCheckboxError('');
        setTextInput('');
        setTextSubmitted(false);
        setTextCorrect(false);
    }

    function selectRadio(answerId: number, correct: boolean) {
        if (isCorrect) return;
        if (correct) {
            setIsCorrect(true);
        } else {
            setAttemptsPerStep((prev) => {
                const next = [...prev];
                next[currentStep] = (next[currentStep] ?? 0) + 1;
                return next;
            });
            setWrongAnswers((prev) => [...prev, answerId]);
        }
    }

    function toggleCheckbox(answerId: number) {
        if (isCorrect) return;
        setCheckedAnswers((prev) =>
            prev.includes(answerId) ? prev.filter((id) => id !== answerId) : [...prev, answerId]
        );
    }

    function checkCheckbox() {
        if (isCorrect || checkedAnswers.length === 0) return;
        const correctIds = step.answers.filter((a) => a.is_correct).map((a) => a.id).sort((a, b) => a - b);
        const selected = [...checkedAnswers].sort((a, b) => a - b);
        const ok = JSON.stringify(correctIds) === JSON.stringify(selected);
        if (ok) {
            setIsCorrect(true);
            setCheckboxError('');
        } else {
            setAttemptsPerStep((prev) => {
                const next = [...prev];
                next[currentStep] = (next[currentStep] ?? 0) + 1;
                return next;
            });
            const wrongSelected = checkedAnswers.filter((id) => !correctIds.includes(id));
            setWrongAnswers((prev) => [...new Set([...prev, ...wrongSelected])]);
            setCheckboxError('Nem a megfelelő kombináció – próbálja újra!');
            setCheckedAnswers([]);
        }
    }

    function submitText() {
        if (textSubmitted || !textInput.trim()) return;
        const acceptable = step.answers.map((a) => a.text.trim().toLowerCase());
        const ok = acceptable.includes(textInput.trim().toLowerCase());
        setTextCorrect(ok);
        setTextSubmitted(true);
    }

    function next() {
        const entry: ResultEntry = {
            question: step.question,
            attempts: (attemptsPerStep[currentStep] ?? 0) + 1,
            correct: step.question_type === 'text' ? textCorrect : true,
        };
        const newResults = [...results, entry];
        setResults(newResults);

        if (currentStep < steps.length - 1) {
            setCurrentStep((s) => s + 1);
            resetStep();
        } else {
            setCompleted(true);
            submitResult(newResults);
        }
    }

    async function submitResult(finalResults: ResultEntry[]) {
        const submitUrl = route('training.result', training.id);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
            const resp = await fetch(submitUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
                body: JSON.stringify({ name: participantName, email: participantEmail || null, results: finalResults }),
            });
            if (!resp.ok) throw new Error();
            const data = await resp.json();
            setCompletedAt(data.completedAt ?? '');
        } catch {
            setSubmitError('Az eredmény mentése sikertelen – kérjük jelezze az adminisztrátornak.');
            setCompletedAt(
                new Date()
                    .toLocaleString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                    .replace(',', '')
            );
        }
    }

    function restart() {
        setCurrentStep(0);
        setStarted(false);
        setCompleted(false);
        setAttemptsPerStep(steps.map(() => 0));
        setResults([]);
        setCompletedAt('');
        setSubmitError('');
        resetStep();
    }

    const canAdvance = isCorrect || (step?.question_type === 'text' && textSubmitted);

    return (
        <AppLayout title={training.title}>
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
                <div
                    className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />
                <div className="relative px-8 py-7">
                    <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                        <a href={route('home')} className="hover:text-slate-300 transition-colors">Főoldal</a>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        <Link href={route('training.index')} className="hover:text-slate-300 transition-colors">Oktatások</Link>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        <span className="text-slate-400">{training.title}</span>
                    </nav>
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="text-2xl font-extrabold text-white tracking-tight">{training.title}</h1>
                        {started && !completed && (
                            <span className="text-sm text-slate-400 shrink-0 font-mono bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                                {currentStep + 1} / {steps.length} lépés
                            </span>
                        )}
                        {completed && (
                            <span className="text-sm font-bold text-emerald-400 shrink-0">Befejezve</span>
                        )}
                    </div>
                    {started && !completed && (
                        <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                    {completed && (
                        <div className="mt-4 h-1.5 bg-white/10 rounded-full">
                            <div className="h-full bg-emerald-400 rounded-full w-full transition-all duration-700" />
                        </div>
                    )}
                </div>
            </div>

            {/* Start képernyő */}
            {!started && (
                <div className="max-w-md mx-auto">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                        <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-5">
                            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                            </svg>
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 mb-1">Oktatás megkezdése</h2>
                        {training.description ? (
                            <p className="text-sm text-slate-500 mb-5 leading-relaxed">{training.description}</p>
                        ) : (
                            <p className="text-sm text-slate-400 mb-5">{steps.length} kérdéses oktatás. Az eredményt emailben is elküldjük.</p>
                        )}
                        <div className="flex items-center gap-3 mb-5 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                            <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            <span className="text-sm text-indigo-700 font-medium">{participantName}</span>
                        </div>
                        <button
                            onClick={() => setStarted(true)}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Oktatás megkezdése
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Kiértékelő lap */}
            {completed && (
                <div className="space-y-5">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-indigo-200 text-sm font-semibold">Oktatás teljesítve!</p>
                                    <h2 className="text-2xl font-extrabold text-white mt-0.5">{training.title}</h2>
                                    <p className="text-indigo-200 text-sm mt-1">Kitöltő: <span className="text-white font-semibold">{participantName}</span></p>
                                </div>
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 w-fit">
                                <svg className="w-4 h-4 text-indigo-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                {completedAt ? (
                                    <span className="text-sm font-semibold text-white">Elvégezve: {completedAt}</span>
                                ) : (
                                    <span className="text-sm text-indigo-200">Mentés folyamatban...</span>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-slate-100">
                            <div className="px-8 py-5 text-center">
                                <p className="text-3xl font-extrabold text-green-600">{firstTryCount}/{steps.length}</p>
                                <p className="text-xs font-semibold text-slate-500 mt-1">első kísérletből helyes</p>
                            </div>
                            <div className="px-8 py-5 text-center">
                                <p className="text-3xl font-extrabold text-indigo-600">{steps.length}/{steps.length}</p>
                                <p className="text-xs font-semibold text-slate-500 mt-1">teljesített lépés</p>
                            </div>
                        </div>
                    </div>

                    {/* Email státusz */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-4 space-y-2">
                        <p className="text-sm font-semibold text-slate-700">Email értesítések</p>
                        {participantEmail ? (
                            <div className={`flex items-center gap-2 text-sm ${submitError ? 'text-red-600' : 'text-green-700'}`}>
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    {!submitError ? (
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                    ) : (
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                    )}
                                </svg>
                                {!submitError ? (
                                    <span>Eredmény elküldve: <strong>{participantEmail}</strong></span>
                                ) : (
                                    <span>{submitError}</span>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">Nem adott meg email-t – az eredmény nem lett elküldve Önnek.</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                            A felelős személy automatikusan értesítve lett az eredményről.
                        </div>
                    </div>

                    {/* Eredménytábla */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                            <h3 className="font-bold text-slate-800">Részletes eredmény</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-8">#</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kérdés</th>
                                        <th className="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Kísérletek</th>
                                        <th className="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Eredmény</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((r, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-3.5 text-sm text-slate-400">{idx + 1}</td>
                                            <td className="px-5 py-3.5 text-sm text-slate-700 font-medium">{r.question}</td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${r.attempts === 1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                    {r.attempts}×
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                {r.correct !== false ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 rounded-full">
                                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('training.index')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                            Vissza az oktatásokhoz
                        </Link>
                        <button
                            onClick={restart}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            Újra elvégzés
                        </button>
                    </div>
                </div>
            )}

            {/* Lépések */}
            {started && !completed && step && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bal: kérdés + media */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-5">
                        <h2 className="text-lg font-bold text-slate-800 leading-snug">{step.question}</h2>

                        {step.media_url && (
                            <div className="rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                                {step.media_type !== 'video' ? (
                                    <img src={step.media_url} className="w-full max-h-64 object-contain" alt="" />
                                ) : !isCorrect ? (
                                    <div className="w-full rounded-xl select-none" style={{ height: 256, background: '#1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg style={{ width: 28, height: 28, color: 'rgba(255,255,255,0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                            </svg>
                                        </div>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', fontWeight: 500, textAlign: 'center', padding: '0 24px', lineHeight: 1.4 }}>A videó a helyes válasz megadása után oldódik fel</p>
                                    </div>
                                ) : (
                                    <video src={step.media_url} className="w-full max-h-64 object-contain" controls autoPlay loop />
                                )}
                            </div>
                        )}

                        {step.reveal_url && isCorrect && (
                            <div className="rounded-xl overflow-hidden border-2 border-green-300 bg-green-50">
                                <div className="px-3 py-2 bg-green-100 border-b border-green-200 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                    <span className="text-xs font-semibold text-green-700">Helyes! Nézze meg a demonstrációt:</span>
                                </div>
                                {step.reveal_type === 'video' ? (
                                    <video src={step.reveal_url} className="w-full max-h-56 object-contain" autoPlay loop controls />
                                ) : (
                                    <img src={step.reveal_url} className="w-full max-h-56 object-contain" alt="" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Jobb: válasz UI */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between gap-4">
                        {step.question_type === 'radio' && (
                            <div className="flex flex-col gap-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Válasszon egyet:</p>
                                <div className="flex flex-col gap-3">
                                    {step.answers.map((answer) => {
                                        const isWrong = wrongAnswers.includes(answer.id);
                                        const isRight = isCorrect && answer.is_correct;
                                        return (
                                            <button
                                                key={answer.id}
                                                onClick={() => selectRadio(answer.id, answer.is_correct)}
                                                disabled={isCorrect}
                                                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 font-medium text-sm transition-all flex items-center gap-3 ${isRight ? 'border-green-400 bg-green-50 text-green-800 shadow-md shadow-green-100' : isWrong ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer'}`}
                                            >
                                                <span className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center text-xs font-bold ${isRight ? 'border-green-500 bg-green-500 text-white' : isWrong ? 'border-red-400 bg-red-100 text-red-600' : 'border-slate-300'}`}>
                                                    {isRight && (
                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                                    )}
                                                    {isWrong && !answer.is_correct && (
                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                                                    )}
                                                </span>
                                                <span>{answer.text}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {wrongAnswers.length > 0 && !isCorrect && (
                                    <p className="text-sm text-red-600 font-medium text-center">Helytelen válasz – próbálja újra!</p>
                                )}
                            </div>
                        )}

                        {step.question_type === 'checkbox' && (
                            <div className="flex flex-col gap-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jelölje be az összes helyes választ:</p>
                                <div className="flex flex-col gap-3">
                                    {step.answers.map((answer) => {
                                        const isChecked = checkedAnswers.includes(answer.id);
                                        const isWrong = wrongAnswers.includes(answer.id);
                                        const isRight = isCorrect && answer.is_correct;
                                        return (
                                            <button
                                                key={answer.id}
                                                onClick={() => toggleCheckbox(answer.id)}
                                                disabled={isCorrect}
                                                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 font-medium text-sm transition-all flex items-center gap-3 ${isRight ? 'border-green-400 bg-green-50 text-green-800' : isWrong ? 'border-red-300 bg-red-50 text-red-700' : isChecked ? 'border-indigo-400 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer'}`}
                                            >
                                                <span className={`w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center text-xs font-bold ${isRight ? 'border-green-500 bg-green-500 text-white' : isWrong ? 'border-red-400 bg-red-100 text-red-600' : isChecked ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300'}`}>
                                                    {(isRight || (isChecked && !isWrong)) && (
                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                                    )}
                                                </span>
                                                <span>{answer.text}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {!isCorrect && (
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={checkCheckbox}
                                            disabled={checkedAnswers.length === 0}
                                            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors cursor-pointer"
                                        >
                                            Ellenőrzés
                                        </button>
                                        {checkboxError && (
                                            <p className="text-sm text-red-600 font-medium text-center">{checkboxError}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {step.question_type === 'text' && (
                            <div className="flex flex-col gap-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Írja be a választ:</p>
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="text"
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (!textSubmitted && textInput.trim()) submitText(); } }}
                                        disabled={textSubmitted}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 font-mono placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none transition"
                                        placeholder="Írja be a válaszát..."
                                    />
                                    {!textSubmitted ? (
                                        <button
                                            onClick={submitText}
                                            disabled={!textInput.trim()}
                                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors cursor-pointer"
                                        >
                                            Tovább
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
                                            <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                            <span className="font-semibold text-slate-700 font-mono">{textInput}</span>
                                            <span className="text-xs text-slate-400 ml-auto">Rögzítve</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {canAdvance && (
                            <button
                                onClick={next}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>{currentStep < steps.length - 1 ? 'Következő lépés' : 'Befejezés és kiértékelés'}</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
