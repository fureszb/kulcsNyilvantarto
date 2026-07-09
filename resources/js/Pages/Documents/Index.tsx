import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { motion } from 'motion/react';
import {
    FileText, Car, Package, AlertTriangle, DoorOpen, ClipboardList,
    KeyRound, Search, AlertOctagon, Flame, Plus, CheckCircle2, Clock,
    MapPin, User, Filter, Inbox, ChevronDown, Check, type LucideIcon,
} from 'lucide-react';
import { useOwnLayout } from '../../hooks/useOwnLayout';
import type { DocumentSummary, DocumentType, PaginatedData } from '../../types';

declare function route(name: string, params?: unknown): string;

interface LocationOption {
    id: number;
    name: string;
}

interface DropdownOption {
    value: string;
    label: string;
}

/** A `text`-en belül a `term` első előfordulását sárgával kiemeli. */
function HighlightMatch({ text, term }: { text: string; term: string }) {
    if (!term) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-amber-200 text-amber-900 rounded-sm">{text.slice(idx, idx + term.length)}</mark>
            {text.slice(idx + term.length)}
        </>
    );
}

/** Natív <select> helyett — a böngésző nem engedi a legördülő opciólista
 *  formázását (appearance-none csak a triggerre hat), ezért saját, teljesen
 *  stílusozható listboxot rajzolunk. */
function FilterDropdown({ value, placeholder, options, onChange }: {
    value: string;
    placeholder: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    useEffect(() => {
        if (!open) { setSearch(''); return; }
        const id = requestAnimationFrame(() => inputRef.current?.focus());
        return () => cancelAnimationFrame(id);
    }, [open]);

    const selectedLabel = options.find(o => o.value === value)?.label ?? placeholder;
    const term = search.trim().toLowerCase();
    const filtered = term ? options.filter(o => o.label.toLowerCase().includes(term)) : options;

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 pl-3.5 pr-3 py-2 rounded-xl border text-sm font-medium transition cursor-pointer min-w-[170px] ${
                    open
                        ? 'border-amber-400 bg-white ring-4 ring-amber-100'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-300 hover:bg-white'
                }`}
            >
                <span className={`flex-1 text-left truncate ${value ? 'text-slate-700' : 'text-slate-500'}`}>{selectedLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute z-20 mt-1.5 min-w-full w-max max-w-xs max-h-80 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10 flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus-within:border-amber-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-100 transition">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Keresés…"
                                className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto py-1.5">
                        {!term && (
                            <button
                                type="button"
                                onClick={() => { onChange(''); setOpen(false); }}
                                className={`flex items-center justify-between gap-3 w-full px-3.5 py-2 text-sm text-left transition-colors cursor-pointer ${value === '' ? 'text-amber-700 bg-amber-50 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <span className="truncate">{placeholder}</span>
                                {value === '' && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                            </button>
                        )}
                        {filtered.length === 0 ? (
                            <p className="px-3.5 py-3 text-xs text-slate-400 text-center">Nincs találat.</p>
                        ) : (
                            filtered.map(o => (
                                <button
                                    key={o.value}
                                    type="button"
                                    onClick={() => { onChange(o.value); setOpen(false); }}
                                    className={`flex items-center justify-between gap-3 w-full px-3.5 py-2 text-sm text-left transition-colors cursor-pointer ${value === o.value ? 'text-amber-700 bg-amber-50 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <span className="truncate"><HighlightMatch text={o.label} term={term} /></span>
                                    {value === o.value && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/** Nagyító ikon a helyszín-választó mellett — kattintásra dinamikusan
 *  kinyíló keresőmező, minden billentyűleütésre szűr, a találatokban a
 *  keresett részlet sárgával kiemelve. */
function LocationQuickSearch({ locations, onSelect }: { locations: LocationOption[]; onSelect: (id: string) => void }) {
    const [open, setOpen] = useState(false);
    const [term, setTerm] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setTerm(''); }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const id = requestAnimationFrame(() => inputRef.current?.focus());
        return () => cancelAnimationFrame(id);
    }, [open]);

    function toggle() {
        setOpen(o => {
            const next = !o;
            if (!next) setTerm('');
            return next;
        });
    }

    const filtered = term.trim() ? locations.filter(l => l.name.toLowerCase().includes(term.trim().toLowerCase())) : locations;

    return (
        <div className="relative flex items-center" ref={ref}>
            <button
                type="button"
                onClick={toggle}
                title="Helyszín keresése"
                className={`flex items-center justify-center w-9 h-9 rounded-xl border transition cursor-pointer shrink-0 ${
                    open ? 'border-amber-400 bg-white ring-4 ring-amber-100 text-amber-600' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-amber-300 hover:bg-white hover:text-amber-600'
                }`}
            >
                <Search className="w-4 h-4" />
            </button>

            <div className={`overflow-hidden transition-all duration-200 ease-out ${open ? 'w-44 ml-2 opacity-100' : 'w-0 ml-0 opacity-0'}`}>
                <input
                    ref={inputRef}
                    type="text"
                    value={term}
                    onChange={e => setTerm(e.target.value)}
                    placeholder="Helyszín neve…"
                    className="w-44 px-3 py-2 rounded-xl border border-amber-300 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-100"
                />
            </div>

            {open && term.trim() && (
                <div className="absolute z-20 top-full left-0 mt-1.5 w-64 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10 py-1.5">
                    {filtered.length === 0 ? (
                        <p className="px-3.5 py-3 text-xs text-slate-400 text-center">Nincs találat.</p>
                    ) : (
                        filtered.map(l => (
                            <button
                                key={l.id}
                                type="button"
                                onClick={() => { onSelect(String(l.id)); setOpen(false); setTerm(''); }}
                                className="flex items-center w-full px-3.5 py-2 text-sm text-left text-slate-600 hover:bg-amber-50 transition-colors cursor-pointer truncate"
                            >
                                <HighlightMatch text={l.name} term={term.trim()} />
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

interface Props {
    documents: PaginatedData<DocumentSummary>;
    locations: LocationOption[];
    documentType: string;
    locationId: number | string | null;
    canCreate: boolean;
}

const TYPE_LABELS: Record<DocumentType, string> = {
    feljegyzeses_jegyzokonyv: 'Feljegyzéses jegyzőkönyv',
    gepjarmu_beleptetes: 'Gépjármű beléptető nyilvántartás',
    eszkoz_atadas_atvetel: 'Eszközök átadás-átvétele',
    karfelveteli_jegyzokonyv: 'Kárfelvételi jegyzőkönyv',
    kiuritesi_jegyzokonyv: 'Kiürítési jegyzőkönyv',
    kiuritesi_nyilvantartas: 'Kiürítési nyilvántartás',
    kulcs_kartya_atadas_atvetel: 'Kulcs/Kártya átadás-átvétele',
    talalt_targy_jegyzokonyv: 'Talált tárgy jegyzőkönyv',
    robbantasi_fenyegetes: 'Robbantással fenyegetés',
    tuzkulcs_tuzkazetta_kiadas: 'Tűzkulcs és tűzkazetta kiadás',
};

const TYPE_ICONS: Record<DocumentType, LucideIcon> = {
    feljegyzeses_jegyzokonyv: FileText,
    gepjarmu_beleptetes: Car,
    eszkoz_atadas_atvetel: Package,
    karfelveteli_jegyzokonyv: AlertTriangle,
    kiuritesi_jegyzokonyv: DoorOpen,
    kiuritesi_nyilvantartas: ClipboardList,
    kulcs_kartya_atadas_atvetel: KeyRound,
    talalt_targy_jegyzokonyv: Search,
    robbantasi_fenyegetes: AlertOctagon,
    tuzkulcs_tuzkazetta_kiadas: Flame,
};

/** Típusonként a "Create" route neve — ahogy egy típus implementációja elkészül,
 *  ide kerül be, hogy megjelenjen az "Új dokumentum" listában. */
const CREATE_ROUTES: Record<string, string> = {
    feljegyzeses_jegyzokonyv: 'documents.incident-report.create',
    gepjarmu_beleptetes: 'documents.vehicle-entry.create',
    eszkoz_atadas_atvetel: 'documents.equipment-handover.create',
    karfelveteli_jegyzokonyv: 'documents.damage-report.create',
    kiuritesi_jegyzokonyv: 'documents.evacuation-report.create',
    kiuritesi_nyilvantartas: 'documents.evacuation-registry.create',
    kulcs_kartya_atadas_atvetel: 'documents.key-card-handover.create',
    talalt_targy_jegyzokonyv: 'documents.lost-found-report.create',
    robbantasi_fenyegetes: 'documents.bomb-threat.create',
    tuzkulcs_tuzkazetta_kiadas: 'documents.fire-key-issuance.create',
};

export default function DocumentsIndex({ documents, locations, documentType, locationId, canCreate }: Props) {
    function applyFilter(nextType: string, nextLocation: string) {
        router.get(route('documents.index'), { document_type: nextType, location_id: nextLocation }, { preserveState: true });
    }

    const Layout = useOwnLayout();

    return (
        <Layout title="Dokumentumok">
            <>

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl"
                >
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-orange-700/10 rounded-full blur-3xl pointer-events-none" />
                    <div
                        className="absolute inset-0 opacity-[0.025] pointer-events-none"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
                            backgroundSize: '32px 32px',
                        }}
                    />
                    <div className="relative px-4 py-6 sm:px-8 sm:py-8 flex items-start justify-between gap-6 flex-wrap">
                        <div>
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Fizikai biztonság</p>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">Dokumentumok</h1>
                            <p className="text-slate-400 mt-2 text-sm">Jegyzőkönyvek és nyilvántartások digitális aláírással</p>
                            <div className="flex items-center gap-1.5 mt-3 text-sm text-slate-400">
                                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                                <span className="font-semibold text-slate-300">{documents.total}</span> dokumentum összesen
                            </div>
                        </div>
                        <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                            <FileText className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                        </div>
                    </div>
                </motion.div>

                {/* Új dokumentum */}
                {canCreate && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                                <Plus className="w-4 h-4 text-amber-600" />
                            </div>
                            <h2 className="font-bold text-slate-800">Új dokumentum</h2>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {Object.entries(CREATE_ROUTES).map(([type, routeName]) => {
                                const Icon = TYPE_ICONS[type as DocumentType];
                                return (
                                    <Link
                                        key={type}
                                        href={route(routeName)}
                                        className="group flex items-center gap-3 px-3.5 py-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors">
                                            <Icon className="w-4 h-4 text-slate-500 group-hover:text-amber-700 transition-colors" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-amber-800 leading-tight transition-colors">
                                            {TYPE_LABELS[type as DocumentType]}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Szűrők */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-3.5 mb-4 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                        <Filter className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Szűrés</span>
                    </div>
                    <FilterDropdown
                        value={documentType}
                        placeholder="Összes típus"
                        options={Object.entries(TYPE_LABELS).map(([type, label]) => ({ value: type, label }))}
                        onChange={v => applyFilter(v, String(locationId ?? ''))}
                    />
                    <FilterDropdown
                        value={String(locationId ?? '')}
                        placeholder="Összes helyszín"
                        options={locations.map(l => ({ value: String(l.id), label: l.name }))}
                        onChange={v => applyFilter(documentType, v)}
                    />
                    <LocationQuickSearch locations={locations} onSelect={v => applyFilter(documentType, v)} />
                    <span className="ml-auto text-xs text-slate-400">
                        <span className="font-semibold text-slate-600">{documents.total}</span> találat
                    </span>
                </div>

                {/* Lista */}
                {documents.data.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                            <Inbox className="w-7 h-7 text-slate-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-base font-semibold text-slate-600">Nincs még dokumentum</p>
                        <p className="text-sm text-slate-400 mt-1">A szűrésnek megfelelő dokumentum még nem készült.</p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {documents.data.map((doc, i) => {
                            const Icon = TYPE_ICONS[doc.document_type] ?? FileText;
                            const isFinal = doc.status === 'finalized';
                            return (
                                <Link
                                    key={doc.id}
                                    href={route('documents.show', doc.id)}
                                    style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
                                    className="group animate-page-enter flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-200 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                                        <Icon className="w-5 h-5 text-amber-600" strokeWidth={1.75} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{TYPE_LABELS[doc.document_type] ?? doc.document_type}</p>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 shrink-0" />
                                                {doc.location?.name ?? 'Nincs helyszín'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3 shrink-0" />
                                                {doc.created_by?.name ?? '–'}
                                            </span>
                                            <span>{new Date(doc.created_at).toLocaleString('hu-HU')}</span>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${isFinal ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {isFinal ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {isFinal ? 'Kész' : 'Vázlat'}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Lapozás */}
                {documents.links.length > 3 && (
                    <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-400">
                            {documents.from}–{documents.to} / {documents.total} dokumentum
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {documents.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${link.active ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} disabled:opacity-40 disabled:cursor-default`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </>
        </Layout>
    );
}
