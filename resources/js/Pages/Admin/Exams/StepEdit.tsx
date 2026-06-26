import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
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

interface Props {
    exam: Exam;
    step: ExamStep;
}

interface AnswerDraft {
    text: string;
    is_correct: boolean;
}

interface FormData {
    order: number;
    question: string;
    question_type: string;
    answers: AnswerDraft[];
    [key: string]: unknown;
}

export default function StepEdit({ exam, step }: Props) {
    const initialAnswers: AnswerDraft[] = (step.answers ?? []).map((a) => ({
        text: a.text,
        is_correct: a.is_correct,
    }));

    const initialType = step.question_type ?? 'radio';
    const initialCorrectIdxes = initialAnswers
        .map((a, i) => a.is_correct ? i : null)
        .filter((i): i is number => i !== null);

    const [qtype, setQtype] = useState(initialType);
    const [answers, setAnswers] = useState<AnswerDraft[]>(
        initialAnswers.length > 0 ? initialAnswers : [{ text: '', is_correct: false }, { text: '', is_correct: false }]
    );
    const [correctRadio, setCorrectRadio] = useState(
        initialType === 'radio' ? (initialCorrectIdxes.length > 0 ? initialCorrectIdxes[0] : 0) : 0
    );
    const [correctCheckboxes, setCorrectCheckboxes] = useState<number[]>(initialCorrectIdxes);

    const { data, setData, put, processing, errors } = useForm<FormData>({
        order: step.order,
        question: step.question,
        question_type: initialType,
        answers: initialAnswers.length > 0 ? initialAnswers : [{ text: '', is_correct: false }, { text: '', is_correct: false }],
    });

    function changeType(type: string) {
        setQtype(type);
        setData('question_type', type);
        setCorrectRadio(0);
        setCorrectCheckboxes([]);
    }

    function addAnswer() {
        const next = [...answers, { text: '', is_correct: false }];
        setAnswers(next);
        setData('answers', next);
    }

    function removeAnswer(idx: number) {
        if (answers.length <= 1) return;
        const next = answers.filter((_, i) => i !== idx);
        setAnswers(next);
        setData('answers', next);
        if (correctRadio >= next.length) setCorrectRadio(0);
        setCorrectCheckboxes(correctCheckboxes.filter(c => c < next.length));
    }

    function updateAnswerText(idx: number, text: string) {
        const next = answers.map((a, i) => i === idx ? { ...a, text } : a);
        setAnswers(next);
        setData('answers', next);
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
        put(route('admin.exams.steps.update', [exam.id, step.id]));
    }

    return (
        <AdminLayout title="Kérdés szerkesztése">
            <div className="max-w-2xl">
                <Link
                    href={route('admin.exams.steps.index', exam.id)}
                    className="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1 mb-5"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Vissza: {exam.title}
                </Link>

                <div className="card p-6">
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="form-label">Kérdés <span className="text-red-500">*</span></label>
                            <textarea
                                value={data.question}
                                onChange={(e) => setData('question', e.target.value)}
                                rows={2}
                                className="form-input resize-none"
                                required
                            />
                            {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question}</p>}
                        </div>

                        <div>
                            <label className="form-label">Kérdés típusa</label>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => changeType('radio')}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all${qtype === 'radio' ? ' bg-amber-500 text-white border-amber-500 shadow-sm' : ' bg-white text-slate-600 border-slate-200 hover:border-amber-300'}`}
                                >
                                    Rádiógomb (1 helyes)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changeType('checkbox')}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all${qtype === 'checkbox' ? ' bg-amber-500 text-white border-amber-500 shadow-sm' : ' bg-white text-slate-600 border-slate-200 hover:border-amber-300'}`}
                                >
                                    Jelölőnégyzet (több helyes)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changeType('text')}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all${qtype === 'text' ? ' bg-amber-500 text-white border-amber-500 shadow-sm' : ' bg-white text-slate-600 border-slate-200 hover:border-amber-300'}`}
                                >
                                    Szöveges válasz
                                </button>
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
                                            />
                                        )}
                                        {qtype === 'checkbox' && (
                                            <input
                                                type="checkbox"
                                                checked={correctCheckboxes.includes(idx)}
                                                onChange={(e) => toggleCorrect(idx, e.target.checked)}
                                                className="shrink-0 text-amber-500"
                                            />
                                        )}
                                        <input
                                            type="text"
                                            value={ans.text}
                                            onChange={(e) => updateAnswerText(idx, e.target.value)}
                                            className="form-input flex-1 text-sm"
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

                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={processing} className="btn-primary">
                                {processing ? 'Mentés...' : 'Mentés'}
                            </button>
                            <Link
                                href={route('admin.exams.steps.index', exam.id)}
                                className="btn-secondary"
                            >
                                Mégse
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
