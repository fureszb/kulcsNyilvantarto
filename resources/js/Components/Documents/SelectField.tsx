import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface Props {
    value: string;
    placeholder: string;
    options: Option[];
    onChange: (value: string) => void;
    surface?: 'default' | 'card';
}

/** Natív <select> helyett — teljesen stílusozható legördülő az űrlapokon,
 *  ugyanaz a minta, mint a Documents/Index.tsx szűrő-dropdownja. */
export default function SelectField({ value, placeholder, options, onChange, surface = 'default' }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const selectedLabel = options.find(o => o.value === value)?.label ?? placeholder;
    const idleCls = surface === 'card' ? 'border-amber-200/70 bg-white' : 'border-slate-200 bg-slate-50 hover:bg-white';

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 w-full pl-3.5 pr-3 py-2.5 rounded-xl border text-sm font-medium transition cursor-pointer ${
                    open ? 'border-amber-400 bg-white ring-4 ring-amber-100' : `${idleCls} hover:border-amber-300`
                }`}
            >
                <span className={`flex-1 text-left truncate ${value ? 'text-slate-700' : 'text-slate-400'}`}>{selectedLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute z-20 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10 py-1.5">
                    <button
                        type="button"
                        onClick={() => { onChange(''); setOpen(false); }}
                        className={`flex items-center justify-between gap-3 w-full px-3.5 py-2 text-sm text-left transition-colors cursor-pointer ${value === '' ? 'text-amber-700 bg-amber-50 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <span className="truncate">{placeholder}</span>
                        {value === '' && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                    </button>
                    {options.map(o => (
                        <button
                            key={o.value}
                            type="button"
                            onClick={() => { onChange(o.value); setOpen(false); }}
                            className={`flex items-center justify-between gap-3 w-full px-3.5 py-2 text-sm text-left transition-colors cursor-pointer ${value === o.value ? 'text-amber-700 bg-amber-50 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <span className="truncate">{o.label}</span>
                            {value === o.value && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
