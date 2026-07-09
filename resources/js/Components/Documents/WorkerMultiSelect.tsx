import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { TenantUserBasic } from '../../types';

interface Props {
    label: string;
    workers: TenantUserBasic[];
    value: number[];
    onChange: (ids: number[]) => void;
}

/** Chip-alapú multi-select dolgozó-választó (a Security/Create.tsx SharePicker
 *  mintája alapján, TenantUserBasic-re adaptálva). */
export default function WorkerMultiSelect({ label, workers, value, onChange }: Props) {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [dropStyle, setDropStyle] = useState({ top: 0, left: 0, width: 0 });
    const wrapRef = useRef<HTMLDivElement>(null);

    const selected = workers.filter(w => value.includes(w.id));
    const candidates = (search.length > 0
        ? workers.filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
        : workers
    ).filter(w => !value.includes(w.id));

    function updatePos() {
        if (!wrapRef.current) return;
        const rect = wrapRef.current.getBoundingClientRect();
        const vp = window.visualViewport;
        setDropStyle({
            top: rect.bottom + (vp?.offsetTop ?? 0) + 4,
            left: rect.left + (vp?.offsetLeft ?? 0),
            width: rect.width,
        });
    }

    useEffect(() => {
        if (!open) return;
        window.addEventListener('scroll', updatePos, true);
        return () => window.removeEventListener('scroll', updatePos, true);
    }, [open]);

    function add(w: TenantUserBasic) { onChange([...value, w.id]); setSearch(''); setOpen(false); }
    function remove(id: number) { onChange(value.filter(v => v !== id)); }

    const showDropdown = open && (candidates.length > 0 || search.length > 0);

    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selected.map(w => (
                        <span key={w.id} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-800">
                            <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                {w.name.charAt(0).toUpperCase()}
                            </span>
                            <span>{w.name}</span>
                            <button type="button" onClick={() => remove(w.id)}
                                className="ml-0.5 w-5 h-5 rounded-full flex items-center justify-center hover:bg-blue-300 transition-colors cursor-pointer text-blue-500 hover:text-blue-800 shrink-0">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div ref={wrapRef} className="flex items-center gap-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-400 focus-within:bg-white transition">
                <svg className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"/>
                </svg>
                <input type="text" value={search}
                    onChange={e => { setSearch(e.target.value); setOpen(true); }}
                    onFocus={() => { updatePos(); setOpen(true); }}
                    onClick={() => { updatePos(); setOpen(true); }}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    placeholder="Keresés név alapján…"
                    autoComplete="off"
                    className="flex-1 py-2.5 bg-transparent text-sm text-slate-700 focus:outline-none"/>
            </div>

            {showDropdown && createPortal(
                candidates.length > 0 ? (
                    <div style={{ position: 'fixed', top: dropStyle.top, left: dropStyle.left, width: dropStyle.width, zIndex: 9999 }}
                        className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                        <ul className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                            {candidates.map(w => (
                                <li key={w.id}>
                                    <button type="button" onMouseDown={() => add(w)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 transition-colors text-left cursor-pointer">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                            {w.name.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="text-sm text-slate-800 truncate">{w.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div style={{ position: 'fixed', top: dropStyle.top, left: dropStyle.left, width: dropStyle.width, zIndex: 9999 }}
                        className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-xs text-slate-400">
                        Nincs találat.
                    </div>
                ),
                document.body
            )}
        </div>
    );
}
