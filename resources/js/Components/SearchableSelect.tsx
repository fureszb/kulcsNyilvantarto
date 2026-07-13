import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Option { id: number; name: string; }

interface Props {
    label: string;
    options: Option[];
    value: number | null;
    onChange: (id: number | null) => void;
    placeholder?: string;
}

/** Kereshető, egyszeres választó szövegmezővel — a Documents/WorkerMultiSelect
 *  mintája alapján, de single-select-re (nem chip-lista, egy érték). Gépeléskor
 *  szűri a listát; kiválasztás után a mező a kiválasztott nevet mutatja, ×-szel
 *  törölhető. */
export default function SearchableSelect({ label, options, value, onChange, placeholder }: Props) {
    const selected = options.find(o => o.id === value) ?? null;
    const [search, setSearch] = useState(selected?.name ?? '');
    const [open, setOpen] = useState(false);
    const [dropStyle, setDropStyle] = useState({ top: 0, left: 0, width: 0 });
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setSearch(selected?.name ?? ''); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    const candidates = search.length > 0
        ? options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
        : options;

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

    function pick(o: Option) { onChange(o.id); setSearch(o.name); setOpen(false); }
    function clear() { onChange(null); setSearch(''); setOpen(false); }

    function handleBlur() {
        setTimeout(() => {
            setOpen(false);
            setSearch(selected?.name ?? ''); // ha nem választott ki semmit, visszaáll az eredeti értékre
        }, 150);
    }

    return (
        <div className="relative">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>

            <div ref={wrapRef} className="flex items-center gap-1.5 pl-3 pr-1.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-400 focus-within:bg-white transition">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                </svg>
                <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setOpen(true); }}
                    onFocus={() => { updatePos(); setOpen(true); }}
                    onClick={() => { updatePos(); setOpen(true); }}
                    onBlur={handleBlur}
                    placeholder={placeholder ?? 'Keresés…'}
                    autoComplete="off"
                    className="flex-1 min-w-[8rem] py-2 bg-transparent text-sm text-slate-700 focus:outline-none"
                />
                {selected && (
                    <button type="button" onMouseDown={clear} className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors shrink-0 cursor-pointer">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>

            {open && createPortal(
                candidates.length > 0 ? (
                    <div style={{ position: 'fixed', top: dropStyle.top, left: dropStyle.left, width: dropStyle.width, zIndex: 9999 }}
                        className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                        <ul className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                            {candidates.map(o => (
                                <li key={o.id}>
                                    <button type="button" onMouseDown={() => pick(o)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-indigo-50 transition-colors text-left cursor-pointer">
                                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                                            {o.name.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="text-sm text-slate-800 truncate">{o.name}</span>
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
                document.body,
            )}
        </div>
    );
}
