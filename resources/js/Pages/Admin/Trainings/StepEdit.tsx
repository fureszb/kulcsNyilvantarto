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
    step: TrainingStep;
}

interface AnswerDraft {
    text: string;
    is_correct: boolean;
}

type MediaMode = 'none' | 'file' | 'url';

function resolveMediaUrl(path: string): string {
    return path.startsWith('http') ? path : `/storage/${path}`;
}

function isVideoPath(path: string): boolean {
    return /\.(mp4|webm)$/i.test(path);
}

function MediaField({ label, mode, onModeChange, file, onFileChange, url, onUrlChange, existingPath, removeExisting, onRemoveChange }: {
    label: string; mode: MediaMode; onModeChange: (m: MediaMode) => void;
    file: File | null; onFileChange: (f: File | null) => void;
    url: string; onUrlChange: (u: string) => void;
    existingPath?: string; removeExisting?: boolean; onRemoveChange?: (v: boolean) => void;
}) {
    return (
        <div>
            <label className="form-label">{label}</label>
            {existingPath && !removeExisting && (
                <div className="mb-2 p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                    {isVideoPath(existingPath) ? (
                        <video src={resolveMediaUrl(existingPath)} controls className="max-h-24 rounded"/>
                    ) : existingPath.startsWith('http') || /\.(jpg|jpeg|png|gif|webp)$/i.test(existingPath) ? (
                        <img src={resolveMediaUrl(existingPath)} alt="" className="max-h-24 rounded object-contain"/>
                    ) : (
                        <a href={resolveMediaUrl(existingPath)} target="_blank" rel="noopener" className="text-xs text-blue-600 underline break-all">{existingPath}</a>
                    )}
                    <button type="button" onClick={() => onRemoveChange?.(true)}
                        className="ml-auto text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors shrink-0">
                        Eltávolítás
                    </button>
                </div>
            )}
            {existingPath && removeExisting && (
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                    <span className="line-through opacity-50">{existingPath}</span>
                    <button type="button" onClick={() => onRemoveChange?.(false)}
                        className="text-blue-600 hover:underline">Visszaállítás</button>
                </div>
            )}
            {(!existingPath || removeExisting) && (
                <>
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
                </>
            )}
        </div>
    );
}

export default function StepEdit({ training, step }: Props) {
    const initialAnswers: AnswerDraft[] = (step.answers ?? []).map((a) => ({
        text: a.text,
        is_correct: a.is_correct,
    }));

    const initialType = step.question_type ?? 'radio';
    const initialCorrectRadio = initialAnswers.findIndex(a => a.is_correct) >= 0
        ? initialAnswers.findIndex(a => a.is_correct)
        : 0;
    const initialCorrectIdxes = initialAnswers
        .map((a, i) => a.is_correct ? i : null)
        .filter((i): i is number => i !== null);

    const [question, setQuestion] = useState(step.question ?? '');
    const [qtype, setQtype] = useState(initialType);
    const [answers, setAnswers] = useState<AnswerDraft[]>(
        initialAnswers.length > 0 ? initialAnswers : [{ text: '', is_correct: false }, { text: '', is_correct: false }]
    );
    const [correctIdx, setCorrectIdx] = useState(initialCorrectRadio);
    const [correctIdxes, setCorrectIdxes] = useState<number[]>(initialCorrectIdxes);
    const [processing, setProcessing] = useState(false);

    const [mediaMode, setMediaMode] = useState<MediaMode>('none');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaUrl, setMediaUrl] = useState('');
    const [removeMedia, setRemoveMedia] = useState(false);
    const [revealMode, setRevealMode] = useState<MediaMode>('none');
    const [revealFile, setRevealFile] = useState<File | null>(null);
    const [revealUrl, setRevealUrl] = useState('');
    const [removeReveal, setRemoveReveal] = useState(false);

    function changeType(type: string) {
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

    function updateAnswerText(idx: number, text: string) {
        setAnswers(answers.map((a, i) => i === idx ? { ...a, text } : a));
    }

    function toggleCorrect(idx: number) {
        if (correctIdxes.includes(idx)) {
            setCorrectIdxes(correctIdxes.filter(i => i !== idx));
        } else {
            setCorrectIdxes([...correctIdxes, idx]);
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
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

        if (removeMedia) {
            formData.append('remove_media', '1');
        } else if (mediaMode === 'file' && mediaFile) {
            formData.append('media', mediaFile);
        } else if (mediaMode === 'url' && mediaUrl) {
            formData.append('media_url', mediaUrl);
        }

        if (removeReveal) {
            formData.append('remove_reveal', '1');
        } else if (revealMode === 'file' && revealFile) {
            formData.append('reveal_media', revealFile);
        } else if (revealMode === 'url' && revealUrl) {
            formData.append('reveal_url', revealUrl);
        }

        router.post(
            route('admin.trainings.steps.update', [training.id, step.id]),
            formData as unknown as Record<string, unknown>,
            { onFinish: () => setProcessing(false) }
        );
    }

    return (
        <AdminLayout title="Lépés szerkesztése">
            <div className="max-w-2xl">
                <Link
                    href={route('admin.trainings.steps.index', training.id)}
                    className="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1 mb-5"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Vissza: {training.title}
                </Link>

                <div className="card p-6">
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="form-label">Kérdés <span className="text-red-500">*</span></label>
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                rows={2}
                                className="form-input resize-none"
                                required
                            />
                        </div>

                        <MediaField
                            label="Médiatartalom (kép/videó)"
                            mode={mediaMode} onModeChange={setMediaMode}
                            file={mediaFile} onFileChange={setMediaFile}
                            url={mediaUrl} onUrlChange={setMediaUrl}
                            existingPath={step.media_path}
                            removeExisting={removeMedia}
                            onRemoveChange={setRemoveMedia}
                        />
                        <MediaField
                            label="Megoldás médiatartalma"
                            mode={revealMode} onModeChange={setRevealMode}
                            file={revealFile} onFileChange={setRevealFile}
                            url={revealUrl} onUrlChange={setRevealUrl}
                            existingPath={step.reveal_media_path}
                            removeExisting={removeReveal}
                            onRemoveChange={setRemoveReveal}
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
                                    Rádiógomb <span className="text-xs font-normal opacity-70">1 helyes</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changeType('checkbox')}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all${qtype === 'checkbox' ? ' bg-violet-600 text-white border-violet-600 shadow-sm' : ' bg-white text-slate-600 border-slate-200 hover:border-violet-300'}`}
                                >
                                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    Jelölőnégyzet <span className="text-xs font-normal opacity-70">több helyes</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changeType('text')}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all${qtype === 'text' ? ' bg-amber-500 text-white border-amber-500 shadow-sm' : ' bg-white text-slate-600 border-slate-200 hover:border-amber-300'}`}
                                >
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                    Szöveges <span className="text-xs font-normal opacity-70">beírás</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="form-label mb-0">
                                    {qtype === 'text' ? 'Elfogadott válaszok' : 'Válaszok'}
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
                                                    className="w-4 h-4 text-green-600"
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
                                            onChange={(e) => updateAnswerText(idx, e.target.value)}
                                            className={`form-input flex-1${qtype === 'text' ? ' font-mono text-sm' : ''}`}
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
                                <p className="text-xs text-slate-400 mt-1">Kis/nagybetű és szóköz nem számít.</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button type="submit" disabled={processing} className="btn-primary">
                                {processing ? 'Mentés...' : 'Mentés'}
                            </button>
                            <Link
                                href={route('admin.trainings.steps.index', training.id)}
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
