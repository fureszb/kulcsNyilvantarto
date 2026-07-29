import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
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
    media_path?: string;
    media_width?: number;
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

type MediaMode = 'none' | 'file' | 'url';

const DEFAULT_MEDIA_WIDTH = 100;

function WidthField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Megjelenítési szélesség</span>
            <input
                type="number" min={10} max={100} value={value}
                onChange={e => onChange(Math.max(10, Math.min(100, Number(e.target.value) || DEFAULT_MEDIA_WIDTH)))}
                className="w-20 form-input text-sm text-center py-1"
            />
            <span className="text-xs text-slate-400">%</span>
            {value !== DEFAULT_MEDIA_WIDTH && (
                <button type="button" onClick={() => onChange(DEFAULT_MEDIA_WIDTH)}
                    className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors">
                    Visszaállítás
                </button>
            )}
        </div>
    );
}

function resolveMediaUrl(path: string): string {
    return path.startsWith('http') ? path : `/storage/${path}`;
}

function isVideoPath(path: string): boolean {
    return /\.(mp4|webm)$/i.test(path);
}

function MediaField({ label, mode, onModeChange, file, onFileChange, url, onUrlChange, existingPath, removeExisting, onRemoveChange, error }: {
    label: string; mode: MediaMode; onModeChange: (m: MediaMode) => void;
    file: File | null; onFileChange: (f: File | null) => void;
    url: string; onUrlChange: (u: string) => void;
    existingPath?: string; removeExisting?: boolean; onRemoveChange?: (v: boolean) => void;
    error?: string;
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
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

export default function StepEdit({ exam, step }: Props) {
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
    const [correctRadio, setCorrectRadio] = useState(initialCorrectRadio);
    const [correctCheckboxes, setCorrectCheckboxes] = useState<number[]>(initialCorrectIdxes);
    const [processing, setProcessing] = useState(false);

    const [mediaMode, setMediaMode] = useState<MediaMode>('none');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaUrl, setMediaUrl] = useState('');
    const [removeMedia, setRemoveMedia] = useState(false);
    const [mediaError, setMediaError] = useState('');
    const [mediaWidth, setMediaWidth] = useState(step.media_width ?? DEFAULT_MEDIA_WIDTH);

    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];

    function handleMediaFile(f: File | null) {
        setMediaError('');
        if (f && f.size > MAX_FILE_SIZE) { setMediaError('A fájl mérete meghaladja az 50 MB-os limitet.'); return; }
        if (f && !ALLOWED_TYPES.includes(f.type)) { setMediaError('Nem támogatott fájlformátum.'); return; }
        setMediaFile(f);
    }

    function changeType(type: string) {
        setQtype(type);
        setCorrectRadio(0);
        setCorrectCheckboxes([]);
    }

    function addAnswer() {
        setAnswers([...answers, { text: '', is_correct: false }]);
    }

    function removeAnswer(idx: number) {
        if (answers.length <= 1) return;
        const next = answers.filter((_, i) => i !== idx);
        setAnswers(next);
        if (correctRadio >= next.length) setCorrectRadio(0);
        setCorrectCheckboxes(correctCheckboxes.filter(c => c < next.length));
    }

    function updateAnswerText(idx: number, text: string) {
        setAnswers(answers.map((a, i) => i === idx ? { ...a, text } : a));
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
        if (mediaError) return;
        setProcessing(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('question', question);
        formData.append('question_type', qtype);
        answers.forEach((a, idx) => {
            formData.append(`answers[${idx}][text]`, a.text);
        });
        if (qtype === 'radio') {
            formData.append('correct', String(correctRadio));
        } else if (qtype === 'checkbox') {
            correctCheckboxes.forEach(i => formData.append('correct[]', String(i)));
        }

        if (mediaMode === 'file' && mediaFile) {
            formData.append('media', mediaFile);
        } else if (mediaMode === 'url' && mediaUrl) {
            formData.append('media_url', mediaUrl);
        } else if (removeMedia) {
            formData.append('remove_media', '1');
        }
        formData.append('media_width', String(mediaWidth));

        router.post(
            route('admin.exams.steps.update', [exam.id, step.id]),
            formData as unknown as Record<string, unknown>,
            {
                onError: (errors) => {
                    if (errors.media) setMediaError(errors.media);
                },
                onFinish: () => setProcessing(false),
            }
        );
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
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                rows={2}
                                className="form-input resize-none"
                                required
                            />
                        </div>

                        <div>
                            <MediaField
                                label="Médiatartalom (kép/videó)"
                                mode={mediaMode} onModeChange={setMediaMode}
                                file={mediaFile} onFileChange={handleMediaFile}
                                url={mediaUrl} onUrlChange={setMediaUrl}
                                existingPath={step.media_path}
                                removeExisting={removeMedia}
                                onRemoveChange={setRemoveMedia}
                                error={mediaError}
                            />
                            <WidthField value={mediaWidth} onChange={setMediaWidth} />
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
