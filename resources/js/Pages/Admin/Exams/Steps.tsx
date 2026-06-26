import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface Exam {
    id: number;
    title: string;
    description?: string | null;
    is_active: boolean;
    pass_score: number;
    steps_count?: number;
}

interface ExamAnswer {
    id: number;
    step_id: number;
    text: string;
    is_correct: boolean;
}

interface ExamStep {
    id: number;
    exam_id: number;
    order: number;
    question: string;
    question_type?: string;
    answers?: ExamAnswer[];
}

interface Training {
    id: number;
    title: string;
}

interface Props {
    exam: Exam;
    steps: ExamStep[];
    trainings?: Training[];
    flash?: { success?: string };
}

const TYPE_BADGE: Record<string, [string, string]> = {
    radio: ['Rádiógomb', 'bg-blue-100 text-blue-700'],
    checkbox: ['Jelölőnégyzet', 'bg-violet-100 text-violet-700'],
    text: ['Szöveges', 'bg-amber-100 text-amber-700'],
};

interface AnswerDraft {
    text: string;
}

function StepAccordion({ step, index, examId }: { step: ExamStep; index: number; examId: number }) {
    const [open, setOpen] = useState(false);
    const [typeLabel, typeClass] = TYPE_BADGE[step.question_type ?? 'radio'] ?? TYPE_BADGE['radio'];

    function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        if (!window.confirm('Töröljük ezt a kérdést?')) return;
        router.delete(route('admin.exams.steps.destroy', [examId, step.id]));
    }

    return (
        <div className="card overflow-hidden">
            <div
                className="px-5 py-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                    </span>
                    <div className="min-w-0">
                        <span className="font-semibold text-slate-800 block truncate">{step.question}</span>
                        <span className={`inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${typeClass}`}>{typeLabel}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">{step.answers?.length ?? 0} válasz</span>
                    <Link
                        href={route('admin.exams.steps.edit', [examId, step.id])}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                    >
                        Szerkesztés
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                        Törlés
                    </button>
                    <svg
                        className={`w-4 h-4 text-slate-400 transition-transform${open ? ' rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </div>
            </div>
            {open && (
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50 space-y-3">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2">
                            {step.question_type === 'text' ? 'Elfogadott válaszok:' : 'Válaszok:'}
                        </p>
                        <div className="space-y-1.5">
                            {(step.answers ?? []).map((answer) => (
                                <div key={answer.id} className="flex items-center gap-2 text-sm">
                                    {step.question_type === 'text' ? (
                                        <>
                                            <span className="w-4 h-4 text-slate-400 shrink-0 font-mono text-xs">→</span>
                                            <span className="text-slate-700 font-mono">{answer.text}</span>
                                        </>
                                    ) : answer.is_correct ? (
                                        <>
                                            <svg className="w-4 h-4 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                            </svg>
                                            <span className="text-green-800 font-medium">{answer.text}</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 text-slate-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                            </svg>
                                            <span className="text-slate-600">{answer.text}</span>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function NewStepForm({ examId }: { examId: number }) {
    const [qtype, setQtype] = useState<'radio' | 'checkbox' | 'text'>('radio');
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState<AnswerDraft[]>([{ text: '' }, { text: '' }]);
    const [correctRadio, setCorrectRadio] = useState(0);
    const [correctCheckboxes, setCorrectCheckboxes] = useState<number[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    function addAnswer() {
        setAnswers([...answers, { text: '' }]);
    }

    function removeAnswer(idx: number) {
        if (answers.length <= 1) return;
        const next = answers.filter((_, i) => i !== idx);
        setAnswers(next);
        if (correctRadio >= next.length) setCorrectRadio(0);
        setCorrectCheckboxes(correctCheckboxes.filter(c => c < next.length));
    }

    function updateAnswer(idx: number, text: string) {
        setAnswers(answers.map((a, i) => i === idx ? { text } : a));
    }

    function toggleCorrect(idx: number, checked: boolean) {
        if (checked) {
            if (!correctCheckboxes.includes(idx)) setCorrectCheckboxes([...correctCheckboxes, idx]);
        } else {
            setCorrectCheckboxes(correctCheckboxes.filter(c => c !== idx));
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!question.trim()) { setError('A kérdés megadása kötelező.'); return; }
        setError('');
        setProcessing(true);

        const formData: Record<string, unknown> = {
            question,
            question_type: qtype,
        };
        answers.forEach((a, idx) => {
            formData[`answers[${idx}][text]`] = a.text;
        });
        if (qtype === 'radio') {
            formData['correct'] = correctRadio;
        } else if (qtype === 'checkbox') {
            formData['correct[]'] = correctCheckboxes;
        }

        router.post(route('admin.exams.steps.store', examId), formData, {
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                <h3 className="font-bold text-slate-800">Új kérdés hozzáadása</h3>
            </div>
            <form onSubmit={submit} className="p-5 space-y-5">
                <div>
                    <label className="form-label">Kérdés <span className="text-red-500">*</span></label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={2}
                        className={`form-input resize-none${error ? ' border-red-400' : ''}`}
                        placeholder="Kérdés szövege…"
                        required
                    />
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                <div>
                    <label className="form-label">Kérdés típusa</label>
                    <div className="flex gap-3 mt-1">
                        {([['radio', 'Rádiógomb (1 helyes)'], ['checkbox', 'Jelölőnégyzet (több helyes)'], ['text', 'Szöveges válasz']] as const).map(([val, label]) => (
                            <label key={val} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value={val}
                                    checked={qtype === val}
                                    onChange={() => setQtype(val)}
                                    className="text-amber-500"
                                />
                                <span className="text-sm text-slate-700">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="form-label mb-0">
                            {qtype !== 'text' ? 'Válaszlehetőségek' : 'Elfogadott válaszok'}
                            <span className="text-red-500">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={addAnswer}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-800"
                        >
                            + Válasz hozzáadása
                        </button>
                    </div>
                    <div className="space-y-2">
                        {answers.map((ans, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                {qtype === 'radio' && (
                                    <input
                                        type="radio"
                                        name="correct"
                                        value={idx}
                                        checked={correctRadio === idx}
                                        onChange={() => setCorrectRadio(idx)}
                                        className="shrink-0 text-amber-500"
                                        title="Helyes válasz"
                                    />
                                )}
                                {qtype === 'checkbox' && (
                                    <input
                                        type="checkbox"
                                        checked={correctCheckboxes.includes(idx)}
                                        onChange={(e) => toggleCorrect(idx, e.target.checked)}
                                        className="shrink-0 text-amber-500"
                                        title="Helyes válasz"
                                    />
                                )}
                                <input
                                    type="text"
                                    value={ans.text}
                                    onChange={(e) => updateAnswer(idx, e.target.value)}
                                    className="form-input flex-1 text-sm"
                                    placeholder={qtype === 'text' ? 'Elfogadott válasz szövege' : 'Válasz szövege'}
                                    required
                                />
                                {answers.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeAnswer(idx)}
                                        className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Mentés...' : 'Kérdés hozzáadása'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function ImportForm({ examId, trainings }: { examId: number; trainings: Training[] }) {
    const [open, setOpen] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState('');
    const [processing, setProcessing] = useState(false);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedTraining) return;
        if (!window.confirm('Importálod a kiválasztott oktatás összes kérdését?')) return;
        setProcessing(true);
        router.post(route('admin.exams.import', examId), { training_id: selectedTraining }, {
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <div className="card p-5">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                Kérdések importálása oktatásból
                <svg className={`w-4 h-4 transition-transform${open ? ' rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            {open && (
                <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-3">Az oktatás összes kérdése és válasza átmásolódik ebbe a vizsgába. A másolatot utána szabadon szerkesztheted.</p>
                    <form onSubmit={submit}>
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedTraining}
                                onChange={(e) => setSelectedTraining(e.target.value)}
                                className="form-input flex-1"
                                required
                            >
                                <option value="">Válassz oktatást…</option>
                                {trainings.map((t) => (
                                    <option key={t.id} value={t.id}>{t.title}</option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                disabled={processing}
                                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
                            >
                                {processing ? 'Importálás...' : 'Importálás'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default function ExamSteps({ exam, steps, trainings, flash }: Props) {
    return (
        <AdminLayout
            title={`${exam.title} – Kérdések`}
            headerActions={
                <Link
                    href={route('admin.exams.index')}
                    className="btn-secondary text-sm"
                >
                    ← Vizsgák listája
                </Link>
            }
        >
            <div className="max-w-3xl space-y-6">
                {trainings && trainings.length > 0 && (
                    <ImportForm examId={exam.id} trainings={trainings} />
                )}

                {flash?.success && (
                    <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {steps.length === 0 ? (
                    <div className="card p-8 text-center text-slate-400 text-sm">
                        Még nincs kérdés. Add hozzá az első kérdést alább, vagy importáld oktatásból.
                    </div>
                ) : (
                    steps.map((step, index) => (
                        <StepAccordion key={step.id} step={step} index={index} examId={exam.id} />
                    ))
                )}

                <NewStepForm examId={exam.id} />
            </div>
        </AdminLayout>
    );
}
