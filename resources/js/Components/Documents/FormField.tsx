import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { CheckCircle2 } from 'lucide-react';

type Surface = 'default' | 'card';

const base = 'w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-700 placeholder-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 focus:outline-none transition disabled:opacity-60';
const surfaceCls: Record<Surface, string> = {
    default: 'border-slate-200 bg-slate-50 focus:bg-white',
    card: 'border-amber-200/70 bg-white',
};

export function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {label}{required && <span className="text-amber-600 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        </div>
    );
}

export function TextInput({ surface = 'default', className, ...props }: InputHTMLAttributes<HTMLInputElement> & { surface?: Surface }) {
    return <input {...props} className={`${base} ${surfaceCls[surface]} ${className ?? ''}`} />;
}

export function Textarea({ surface = 'default', className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { surface?: Surface }) {
    return <textarea {...props} className={`${base} ${surfaceCls[surface]} resize-none leading-relaxed ${className ?? ''}`} />;
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
            <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            {label}
        </label>
    );
}

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50/40 border border-amber-100 space-y-4">
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">{title}</p>
            {children}
        </div>
    );
}

export function SubmitButton({ processing, label = 'Dokumentum létrehozása és PDF generálása' }: { processing: boolean; label?: string }) {
    return (
        <button
            type="submit"
            disabled={processing}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-bold transition-colors cursor-pointer shadow-sm"
        >
            {processing ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : (
                <CheckCircle2 className="w-4 h-4" />
            )}
            {processing ? 'Mentés…' : label}
        </button>
    );
}
