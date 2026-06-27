import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface TrainingAnswer {
    id: number;
    step_id: number;
    text: string;
    is_correct: boolean;
}

interface TrainingStep {
    id: number;
    training_id: number;
    order: number;
    question?: string;
    question_type?: string;
    media_path?: string;
    reveal_media_path?: string;
    answers?: TrainingAnswer[];
}

interface Training {
    id: number;
    title: string;
    description?: string;
    is_active: boolean;
    steps_count?: number;
}

interface Props {
    training: Training;
    steps: TrainingStep[];
}

const TYPE_BADGE: Record<string, [string, string]> = {
    radio: ['Rádiógomb', 'bg-blue-100 text-blue-700'],
    checkbox: ['Jelölőnégyzet', 'bg-violet-100 text-violet-700'],
    text: ['Szöveges', 'bg-amber-100 text-amber-700'],
};

interface AnswerDraft {
    text: string;
    is_correct: boolean;
}

type MediaMode = 'none' | 'file' | 'url';

function MediaField({ label, mode, onModeChange, file, onFileChange, url, onUrlChange }: {
    label: string; mode: MediaMode; onModeChange: (m: MediaMode) => void;
    file: File | null; onFileChange: (f: File | null) => void;
    url: string; onUrlChange: (u: string) => void;
}) {
    return (
        <div>
            <label className="form-label">{label}</label>
            <div className="flex gap-2 mb-2 flex-wrap">
                {(['none', 'file', 'url'] as MediaMode[]).map(m => (
                    <button key={m} type="button" onClick={() => onModeChange(m)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                            mode === m
                                ? m === 'none' ? 'bg-slate-700 text-white border-slate-700'
                                : m === 'file' ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}>
                        {m === 'none' ? 'Nincs' : m === 'file' ? 'Fájl' : 'URL'}
                    </button>
                ))}
            </div>
            {mode === 'file' && (
                <>
                    <input type="file" accept="image/*,video/*"
                        onChange={e => onFileChange(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    <p className="text-xs text-slate-400 mt-1">Max. 50 MB · jpg, png, gif, webp, mp4, webm</p>
                </>
            )}
            {mode === 'url' && (
                <input type="url" value={url} onChange={e => onUrlChange(e.target.value)}
                    className="form-input" placeholder="https://..."/>
            )}
        </div>
    );
}

function StepAccordion({ step, index, trainingId }: { step: TrainingStep; index: number; trainingId: number }) {
    const [open, setOpen] = useState(false);
    const [typeLabel, typeClass] = TYPE_BADGE[step.question_type ?? 'radio'] ?? TYPE_BADGE['radio'];

    function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        if (!window.confirm('Töröljük ezt a lépést?')) return;
        router.delete(route('admin.trainings.steps.destroy', [trainingId, step.id]));
    }

    return (
        <div className="card overflow-hidden">
            <div
                className="px-5 py-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
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
                        href={route('admin.trainings.steps.edit', [trainingId, step.id])}
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

function NewStepForm({ trainingId }: { trainingId: number }) {
    const [qtype, setQtype] = useState<'radio' | 'checkbox' | 'text'>('radio');
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState<AnswerDraft[]>([{ text: '', is_correct: false }, { text: '', is_correct: false }]);
    const [correctIdx, setCorrectIdx] = useState(0);
    const [correctIdxes, setCorrectIdxes] = useState<number[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [mediaMode, setMediaMode] = useState<MediaMode>('none');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaUrl, setMediaUrl] = useState('');
    const [revealMode, setRevealMode] = useState<MediaMode>('none');
    const [revealFile, setRevealFile] = useState<File | null>(null);
    const [revealUrl, setRevealUrl] = useState('');

    function changeType(type: 'radio' | 'checkbox' | 'text') {
        setQtype(type);
        setCorrectIdx(0);
        setCorrectIdxes([]);
        if (type !== 'text' && answers.length < 2) {
            const extra = [...answers];
            while (extra.length < 2) extra.push({ text: '', is_correct: false });
            setAnswers(extra);
        }
    }

    function addAnswer() {
        setAnswers([...answers, { text: '', is_correct: false }]);
    }

    function removeAnswer(idx: number) {
        const min = qtype === 'text' ? 1 : 2;
        if (answers.length <= min) return;
        const next = answers.filter((_, i) => i !== idx);
        setAnswers(next);
        if (qtype === 'radio' && correctIdx >= next.length) setCorrectIdx(0);
        if (qtype === 'checkbox') {
            setCorrectIdxes(correctIdxes.filter(i => i !== idx).map(i => i > idx ? i - 1 : i));
        }
    }

    function toggleCorrect(idx: number) {
        if (correctIdxes.includes(idx)) {
            setCorrectIdxes(correctIdxes.filter(i => i !== idx));
        } else {
            setCorrectIdxes([...correctIdxes, idx]);
        }
    }

    function updateAnswer(idx: number, text: string) {
        setAnswers(answers.map((a, i) => i === idx ? { ...a, text } : a));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!question.trim()) { setError('A kérdés megadása kötelező.'); return; }
        setError('');
        setProcessing(true);

        const formData = new FormData();
        formData.append('question', question);
        formData.append('question_type', qtype);
        answers.forEach((a, idx) => {
            formData.append(`answers[${idx}][text]`, a.text);
        });
        if (qtype === 'radio') {
            formData.append('correct', String(correctIdx));
        } else if (qtype === 'checkbox') {
            correctIdxes.forEach(i => formData.append('correct[]', String(i)));
        }
        if (mediaMode === 'file' && mediaFile) formData.append('media', mediaFile);
        else if (mediaMode === 'url' && mediaUrl) formData.append('media_url', mediaUrl);
        if (revealMode === 'file' && revealFile) formData.append('reveal_media', revealFile);
        else if (revealMode === 'url' && revealUrl) formData.append('reveal_url', revealUrl);

        router.post(route('admin.trainings.steps.store', trainingId), formData as unknown as Record<string, unknown>, {
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                <h3 className="font-bold text-slate-800">Új lépés hozzáadása</h3>
            </div>
            <form onSubmit={submit} className="p-5 space-y-5">
                <div>
                    <label className="form-label">Kérdés <span className="text-red-500">*</span></label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={2}
                        className={`form-input resize-none${error ? ' border-red-400' : ''}`}
                        placeholder="Mit kell tenni, ha...?"
                        required
                    />
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                <MediaField
                    label="Médiatartalom (kép/videó)"
                    mode={mediaMode} onModeChange={setMediaMode}
                    file={mediaFile} onFileChange={setMediaFile}
                    url={mediaUrl} onUrlChange={setMediaUrl}
                />
                <MediaField
                    label="Megoldás médiatartalma"
                    mode={revealMode} onModeChange={setRevealMode}
                    file={revealFile} onFileChange={setRevealFile}
                    url={revealUrl} onUrlChange={setRevealUrl}
                />

                <div>
                    <label className="form-label">Kérdés típusa</label>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => changeType('radio')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all${qtype === 'radio' ? ' bg-blue-600 text-white border-blue-600 shadow-sm' : ' bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                        >
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-12a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                            </svg>
                            Rádiógomb
                            <span className="text-xs font-normal opacity-70">1 helyes</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => changeType('checkbox')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all${qtype === 'checkbox' ? ' bg-violet-600 text-white border-violet-600 shadow-sm' : ' bg-white text-slate-600 border-slate-200 hover:border-violet-300'}`}
                        >
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            Jelölőnégyzet
                            <span className="text-xs font-normal opacity-70">több helyes</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => changeType('text')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all${qtype === 'text' ? ' bg-amber-500 text-white border-amber-500 shadow-sm' : ' bg-white text-slate-600 border-slate-200 hover:border-amber-300'}`}
                        >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Szöveges
                            <span className="text-xs font-normal opacity-70">beírás</span>
                        </button>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="form-label mb-0">
                            {qtype === 'text' ? 'Elfogadott válaszok' : 'Válaszok'} <span className="text-red-500">*</span>
                            {qtype === 'radio' && <span className="text-xs text-slate-400 font-normal"> (jelöld be az egyetlen helyeset)</span>}
                            {qtype === 'checkbox' && <span className="text-xs text-slate-400 font-normal"> (jelöld be az összes helyeset)</span>}
                            {qtype === 'text' && <span className="text-xs text-slate-400 font-normal"> (az összes elfogadott változat)</span>}
                        </label>
                        <button
                            type="button"
                            onClick={addAnswer}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                            + Hozzáadás
                        </button>
                    </div>

                    <div className="space-y-2">
                        {answers.map((answer, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                {qtype === 'radio' && (
                                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                                        <input
                                            type="radio"
                                            name="_correct_radio"
                                            value={idx}
                                            checked={correctIdx === idx}
                                            onChange={() => setCorrectIdx(idx)}
                                            className="w-4 h-4 text-green-600 border-slate-300"
                                        />
                                        <span className="text-xs text-slate-500">Helyes</span>
                                    </label>
                                )}
                                {qtype === 'checkbox' && (
                                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={correctIdxes.includes(idx)}
                                            onChange={() => toggleCorrect(idx)}
                                            className="w-4 h-4 text-green-600 rounded border-slate-300"
                                        />
                                        <span className="text-xs text-slate-500">Helyes</span>
                                    </label>
                                )}
                                {qtype === 'text' && (
                                    <span className="text-slate-400 font-mono text-xs shrink-0 w-5">→</span>
                                )}
                                <input
                                    type="text"
                                    value={answer.text}
                                    onChange={(e) => updateAnswer(idx, e.target.value)}
                                    className={`form-input flex-1${qtype === 'text' ? ' font-mono text-sm' : ''}`}
                                    placeholder={qtype === 'text' ? 'Elfogadott szöveg...' : 'Válasz szövege...'}
                                    required
                                />
                                {((qtype !== 'text' && answers.length > 2) || (qtype === 'text' && answers.length > 1)) && (
                                    <button
                                        type="button"
                                        onClick={() => removeAnswer(idx)}
                                        className="w-8 h-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {qtype === 'text' && (
                        <p className="text-xs text-slate-400 mt-1">A beírás nem érzékeny a kis/nagybetűkre és a vezető/záró szóközökre.</p>
                    )}
                </div>

                <div className="pt-1">
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Mentés...' : 'Lépés hozzáadása'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function TrainingSteps({ training, steps }: Props) {
    return (
        <AdminLayout
            title={`${training.title} – Lépések`}
            headerActions={
                <Link
                    href={route('admin.trainings.index')}
                    className="btn-secondary text-sm"
                >
                    ← Oktatások listája
                </Link>
            }
        >
            <div className="max-w-3xl space-y-6">
                {steps.length === 0 ? (
                    <div className="card p-8 text-center text-slate-400 text-sm">
                        Még nincs lépés. Add hozzá az első lépést alább.
                    </div>
                ) : (
                    steps.map((step, index) => (
                        <StepAccordion key={step.id} step={step} index={index} trainingId={training.id} />
                    ))
                )}

                <NewStepForm trainingId={training.id} />
            </div>
        </AdminLayout>
    );
}
