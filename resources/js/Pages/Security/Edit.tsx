import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import { useOwnLayout } from '../../hooks/useOwnLayout';
import type { SecurityDailyReport, TenantUser } from '../../types';

declare function route(name: string, params?: unknown): string;

interface LocationOption {
    id: number;
    name: string;
}

interface Props {
    security: SecurityDailyReport;
    sortedUsers: TenantUser[];
    sharedIds: number[];
    locations: LocationOption[];
    locationIds: number[];
}

type ShiftRow    = { 'beosztás': string; nev: string; 'idő_tól': string; 'idő_ig': string };
type EquipRow    = { 'megnevezés': string; 'darabszám': number };
type InspRow     = { neve: string; 'idő_tól': string; 'idő_ig': string };
type PatrolRow   = { 'vagyonőr': string; 'időpont': string; 'megjegyzés': string };
type IncidentRow = { 'időpont': string; 'leírás': string };
type EventRow    = { 'idő_tól': string; 'idő_ig': string; 'leírás': string };
type FireRow     = { 'megnevezés': string; 'készpont': string; 'időpont': string; 'ellenőrző': string };
type ElevRow     = { 'megnevezés': string; 'időpont': string; 'ellenőrző': string };
type MaintRow    = { 'cég': string; 'helyszín': string; 'idő_tól': string; 'idő_ig': string };

interface PickerProps {
    value: string;
    onChange: (v: string) => void;
    users: TenantUser[];
    placeholder?: string;
    focusColor?: string;
    hoverColor?: string;
    dotColor?: string;
}

function PersonPicker({
    value, onChange, users,
    placeholder = 'Teljes név',
    focusColor = 'focus-within:border-rose-400',
    hoverColor = 'hover:bg-rose-50',
    dotColor   = 'bg-rose-100 text-rose-600',
}: PickerProps) {
    const [open, setOpen] = useState(false);
    const [dropStyle, setDropStyle] = useState({ top: 0, left: 0, width: 0 });
    const wrapRef = useRef<HTMLDivElement>(null);

    const filtered = users.filter(u =>
        value ? u.name.toLowerCase().includes(value.toLowerCase()) : true
    );

    function updatePos() {
        if (!wrapRef.current) return;
        const rect = wrapRef.current.getBoundingClientRect();
        const vp = window.visualViewport;
        setDropStyle({
            top:   rect.bottom + (vp?.offsetTop  ?? 0) + 4,
            left:  rect.left   + (vp?.offsetLeft ?? 0),
            width: rect.width,
        });
    }

    useEffect(() => {
        if (!open) return;
        window.addEventListener('scroll', updatePos, true);
        return () => window.removeEventListener('scroll', updatePos, true);
    }, [open]);

    return (
        <div ref={wrapRef}>
            <div className={`flex items-center gap-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 ${focusColor} focus-within:bg-white transition`}>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <input type="text" value={value}
                    onChange={e => { onChange(e.target.value); setOpen(true); }}
                    onFocus={() => { updatePos(); setOpen(true); }}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    placeholder={placeholder} autoComplete="off"
                    className="flex-1 py-1.5 bg-transparent text-sm focus:outline-none"/>
            </div>
            {open && filtered.length > 0 && createPortal(
                <div style={{ position: 'fixed', top: dropStyle.top, left: dropStyle.left, width: dropStyle.width, zIndex: 9999 }}
                    className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    <ul className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                        {filtered.map(u => (
                            <li key={u.id}>
                                <button type="button" onMouseDown={() => { onChange(u.name); setOpen(false); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 ${hoverColor} transition-colors text-left cursor-pointer`}>
                                    <span className={`w-6 h-6 rounded-full ${dotColor} flex items-center justify-center text-xs font-bold shrink-0`}>
                                        {u.name.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="text-sm text-slate-800 truncate">{u.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>,
                document.body
            )}
        </div>
    );
}

const XBtn = ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick} className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
    </button>
);

function SharePicker({ allUsers, value, onChange }: { allUsers: TenantUser[]; value: number[]; onChange: (ids: number[]) => void }) {
    const [search, setSearch] = useState('');
    const [open, setOpen]     = useState(false);
    const [dropStyle, setDropStyle] = useState({ top: 0, left: 0, width: 0 });
    const wrapRef = useRef<HTMLDivElement>(null);

    const selected   = allUsers.filter(u => value.includes(u.id));
    const candidates = (search.length > 0
        ? allUsers.filter(u =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
          )
        : allUsers
    ).filter(u => !value.includes(u.id));

    function updatePos() {
        if (!wrapRef.current) return;
        const rect = wrapRef.current.getBoundingClientRect();
        const vp = window.visualViewport;
        setDropStyle({
            top:   rect.bottom + (vp?.offsetTop  ?? 0) + 4,
            left:  rect.left   + (vp?.offsetLeft ?? 0),
            width: rect.width,
        });
    }

    useEffect(() => {
        if (!open) return;
        window.addEventListener('scroll', updatePos, true);
        return () => window.removeEventListener('scroll', updatePos, true);
    }, [open]);

    function add(u: TenantUser) { onChange([...value, u.id]); setSearch(''); setOpen(false); }
    function remove(id: number) { onChange(value.filter(v => v !== id)); }

    const showDropdown = open && (candidates.length > 0 || search.length > 0);

    return (
        <div>
            <label className={lSm}>Megosztás – ki láthatja ezt a jelentést</label>

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {selected.map(u => (
                        <span key={u.id} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-violet-100 border border-violet-200 text-xs font-semibold text-violet-800">
                            <span className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                {u.name.charAt(0).toUpperCase()}
                            </span>
                            <span>{u.name}</span>
                            <button type="button" onClick={() => remove(u.id)}
                                className="ml-0.5 w-5 h-5 rounded-full flex items-center justify-center hover:bg-violet-300 transition-colors cursor-pointer text-violet-500 hover:text-violet-800 shrink-0">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div ref={wrapRef} className="flex items-center gap-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-violet-400 focus-within:bg-white transition">
                <svg className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"/>
                </svg>
                <input type="text" value={search}
                    onChange={e => { setSearch(e.target.value); setOpen(true); }}
                    onFocus={() => { updatePos(); setOpen(true); }}
                    onClick={() => { updatePos(); setOpen(true); }}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    placeholder="Keresés névre vagy emailre…"
                    autoComplete="off"
                    className="flex-1 py-2.5 bg-transparent text-sm text-slate-700 focus:outline-none"/>
            </div>

            {showDropdown && createPortal(
                candidates.length > 0 ? (
                    <div style={{ position: 'fixed', top: dropStyle.top, left: dropStyle.left, width: dropStyle.width, zIndex: 9999 }}
                        className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                        <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                {search.length === 0 ? 'Összes kolléga (leggyakoribb elöl)' : 'Találatok'}
                            </span>
                            <span className="text-[10px] text-slate-400">{candidates.length} fő</span>
                        </div>
                        <ul className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                            {candidates.map(u => (
                                <li key={u.id}>
                                    <button type="button" onMouseDown={() => add(u)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 transition-colors text-left cursor-pointer">
                                        <span className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">
                                            {u.name.charAt(0).toUpperCase()}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                                            {u.email && <p className="text-xs text-slate-400 truncate">{u.email}</p>}
                                        </div>
                                        <svg className="w-4 h-4 text-violet-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div style={{ position: 'fixed', top: dropStyle.top, left: dropStyle.left, width: dropStyle.width, zIndex: 9999 }}
                        className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm text-slate-400">
                        Nincs találat: „<span className="font-medium text-slate-600">{search}</span>"
                    </div>
                ),
                document.body
            )}

            <p className="text-xs text-slate-400 mt-2">A kijelölt felhasználók láthatják ezt a jelentést a saját nézetükben.</p>
        </div>
    );
}

const AddBtn = ({ onClick, label, color = 'text-rose-500 hover:text-rose-700' }: { onClick: () => void; label: string; color?: string }) => (
    <button type="button" onClick={onClick} className={`ml-auto inline-flex items-center gap-1 text-xs font-semibold ${color} cursor-pointer transition-colors`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
        </svg>
        {label}
    </button>
);

const openTimePicker = (e: React.MouseEvent<HTMLInputElement>) => (e.currentTarget as any).showPicker?.();

const iSm  = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:bg-white focus:outline-none transition';
const tSm  = 'rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:bg-white focus:outline-none transition font-mono';
const iLg  = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-rose-400 focus:bg-white focus:outline-none transition';
const lSm  = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';
const thC  = 'text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider';
const tdC  = 'px-4 py-2.5';

function asArr<T>(v: unknown): T[] {
    if (Array.isArray(v)) return v as T[];
    return [];
}

export default function SecurityEdit({ security, sortedUsers, sharedIds, locations, locationIds: initialLocationIds }: Props) {
    const Layout = useOwnLayout();
    const [reportDate,    setReportDate]    = useState(security.report_date ?? '');
    const [preparedByVal, setPreparedByVal] = useState(security.prepared_by ?? '');
    const [takenOverFrom, setTakenOverFrom] = useState(security.taken_over_from ?? '');
    const [handoverTime,  setHandoverTime]  = useState(security.handover_time ?? '');
    const [ccRecipients,  setCcRecipients]  = useState(((security.cc_recipients ?? []) as string[]).join(', '));
    const [shareUserIds,  setShareUserIds]  = useState<number[]>(sharedIds);
    const [locationIds,   setLocationIds]   = useState<number[]>(initialLocationIds);
    const [processing,    setProcessing]    = useState(false);
    const [errors,        setErrors]        = useState<Record<string, string>>({});
    const [valErrors,     setValErrors]     = useState<string[]>([]);

    const [serviceMembers,       setServiceMembers]       = useState<ShiftRow[]>(asArr(security.service_members));
    const [previousShiftMembers, setPreviousShiftMembers] = useState<ShiftRow[]>(asArr(security.previous_shift_members));
    const [equipment,   setEquipment]   = useState<EquipRow[]>(asArr(security.equipment));
    const [inspectors,  setInspectors]  = useState<InspRow[]>(asArr(security.inspectors));
    const [patrols,     setPatrols]     = useState<PatrolRow[]>(asArr(security.patrols));
    const [incidents,   setIncidents]   = useState<IncidentRow[]>(asArr(security.incidents));
    const [events,      setEvents]      = useState<EventRow[]>(asArr(security.events));
    const [fireAlarms,  setFireAlarms]  = useState<FireRow[]>(asArr(security.fire_alarms));
    const [elevators,   setElevators]   = useState<ElevRow[]>(asArr(security.elevators));
    const [maintenance, setMaintenance] = useState<MaintRow[]>(asArr(security.maintenance));

    function updShift<K extends keyof ShiftRow>(arr: ShiftRow[], set: React.Dispatch<React.SetStateAction<ShiftRow[]>>, i: number, k: K, v: ShiftRow[K]) {
        set(arr.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const ve: string[] = [];
        if (!takenOverFrom.trim()) ve.push('Az „Átadás-átvétel → Kitől veszi át a szolgálatot" mező kitöltése kötelező.');
        if (locationIds.length === 0) ve.push('Legalább egy irodaházat ki kell választani, amelyre a jelentés vonatkozik.');
        if (serviceMembers.some(r => !r.nev.trim())) ve.push('A „Napi Szolgálat tagjai → Név" mező kitöltése kötelező minden sornál.');
        if (inspectors.some(r => !r.neve.trim())) ve.push('Az „Ellenőrzést végző személyek → Neve" mező kitöltése kötelező minden sornál.');
        if (patrols.some(r => !r['vagyonőr'].trim())) ve.push('A „Járőrözés → Vagyonőr" mező kitöltése kötelező minden sornál.');
        if (ve.length > 0) { setValErrors(ve); return; }
        setValErrors([]);
        setProcessing(true);
        router.put(route('security.update', security.id), {
            report_date:            reportDate,
            prepared_by:            preparedByVal,
            taken_over_from:        takenOverFrom,
            handover_time:          handoverTime,
            cc_recipients:          ccRecipients,
            share_user_ids:         shareUserIds,
            location_ids:           locationIds,
            service_members:        JSON.stringify(serviceMembers),
            previous_shift_members: JSON.stringify(previousShiftMembers),
            equipment:              JSON.stringify(equipment),
            inspectors:             JSON.stringify(inspectors),
            patrols:                JSON.stringify(patrols),
            incidents:              JSON.stringify(incidents),
            events:                 JSON.stringify(events),
            fire_alarms:            JSON.stringify(fireAlarms),
            elevators:              JSON.stringify(elevators),
            maintenance:            JSON.stringify(maintenance),
        }, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Layout title="Napi Jelentés szerkesztése">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"/>
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-rose-800/10 rounded-full blur-3xl pointer-events-none"/>
                <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                <div className="relative px-4 py-6 sm:px-8 sm:py-8 flex items-start justify-between gap-6 flex-wrap">
                    <div>
                        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Biztonsági Szolgálat · Szerkesztés</p>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">Napi Jelentés szerkesztése</h1>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                {security.report_date}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                                Készítette: <strong className="text-slate-300 ml-0.5">{security.prepared_by}</strong>
                            </span>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <a href={route('security.show', security.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                            </svg>
                            Vissza
                        </a>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* 1. Fejléc */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-rose-600 to-rose-500 rounded-t-2xl px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                        <h2 className="font-bold text-white text-sm uppercase tracking-wider">Biztonsági Szolgálat Napi Jelentés</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={lSm}>Dátum</label>
                            <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} required className={iLg}/>
                            {errors.report_date && <p className="mt-1 text-xs text-red-500">{errors.report_date}</p>}
                        </div>
                        <div>
                            <label className={lSm}>Jelentést készítette</label>
                            <input type="text" value={preparedByVal} onChange={e => setPreparedByVal(e.target.value)} placeholder="Teljes név" required className={iLg}/>
                            {errors.prepared_by && <p className="mt-1 text-xs text-red-500">{errors.prepared_by}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label className={lSm}>Érintett irodaházak <span className="text-rose-500">*</span></label>
                            <div className="flex flex-wrap gap-2">
                                {locations.map(loc => {
                                    const checked = locationIds.includes(loc.id);
                                    return (
                                        <button
                                            key={loc.id}
                                            type="button"
                                            onClick={() => setLocationIds(ids => checked ? ids.filter(id => id !== loc.id) : [...ids, loc.id])}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${checked ? 'bg-rose-600 border-rose-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            {loc.name}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.location_ids && <p className="mt-1 text-xs text-red-500">{errors.location_ids}</p>}
                        </div>
                    </div>
                </div>

                {/* 2. Átadás-átvétel */}
                <div className="bg-white border border-rose-200 rounded-2xl shadow-sm">
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-rose-100 bg-rose-50/40 rounded-t-2xl flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Átadás-átvétel</h3>
                    </div>
                    <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={lSm}>Kitől veszi át a szolgálatot <span className="text-rose-500">*</span></label>
                            <PersonPicker value={takenOverFrom} onChange={setTakenOverFrom} users={sortedUsers} placeholder="Előző műszak vagyonőre…"/>
                            {errors.taken_over_from && <p className="mt-1 text-xs text-red-500">{errors.taken_over_from}</p>}
                        </div>
                        <div>
                            <label className={lSm}>Átadás időpontja</label>
                            <input type="time" onClick={openTimePicker} value={handoverTime} onChange={e => setHandoverTime(e.target.value)} className={iLg}/>
                        </div>
                    </div>
                </div>

                {/* 3. Tegnapi csapat */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Tegnapi csapat (átadók)</h3>
                        <AddBtn onClick={() => setPreviousShiftMembers(p => [...p, { 'beosztás': '', nev: '', 'idő_tól': '19:00', 'idő_ig': '07:00' }])} label="Sor hozzáadása" color="text-slate-500 hover:text-slate-700"/>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[500px]">
                            <thead><tr className="bg-slate-50 border-b border-slate-100">
                                <th className={thC}>Beosztás</th>
                                <th className={thC}>Név</th>
                                <th className={`${thC} w-28`}>Idő (tól)</th>
                                <th className={`${thC} w-28`}>Idő (ig)</th>
                                <th className="w-10"/>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {previousShiftMembers.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                        <td className={tdC}><input type="text" value={row['beosztás']} onChange={e => updShift(previousShiftMembers, setPreviousShiftMembers, i, 'beosztás', e.target.value)} placeholder="pl. Vagyonőr" className={`${iSm} focus:border-rose-400`}/></td>
                                        <td className={tdC}><PersonPicker value={row.nev} onChange={v => updShift(previousShiftMembers, setPreviousShiftMembers, i, 'nev', v)} users={sortedUsers}/></td>
                                        <td className={tdC}><input type="time" onClick={openTimePicker} value={row['idő_tól']} onChange={e => updShift(previousShiftMembers, setPreviousShiftMembers, i, 'idő_tól', e.target.value)} className={`${tSm} focus:border-rose-400 w-full`}/></td>
                                        <td className={tdC}><input type="time" onClick={openTimePicker} value={row['idő_ig']} onChange={e => updShift(previousShiftMembers, setPreviousShiftMembers, i, 'idő_ig', e.target.value)} className={`${tSm} focus:border-rose-400 w-full`}/></td>
                                        <td className="px-2 py-2.5 text-center"><XBtn onClick={() => setPreviousShiftMembers(p => p.filter((_, idx) => idx !== i))}/></td>
                                    </tr>
                                ))}
                                {previousShiftMembers.length === 0 && (
                                    <tr><td colSpan={5} className="px-5 py-4 text-center text-sm text-slate-400">Nincs rögzítve tegnapi csapat</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. Napi Szolgálat tagjai */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Napi Szolgálat tagjai</h3>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{serviceMembers.length} fő</span>
                        <AddBtn onClick={() => setServiceMembers(p => [...p, { 'beosztás': '', nev: '', 'idő_tól': '07:00', 'idő_ig': '19:00' }])} label="Sor hozzáadása"/>
                    </div>
                    {errors.service_members && <p className="px-6 pt-3 text-xs text-red-500">{errors.service_members}</p>}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[500px]">
                            <thead><tr className="bg-slate-50 border-b border-slate-100">
                                <th className={thC}>Beosztás</th>
                                <th className={thC}>Név <span className="text-rose-500">*</span><span className="block normal-case font-normal text-[10px] text-slate-400 mt-0.5">Ha nincs benne a listában, gépeld be</span></th>
                                <th className={`${thC} w-28`}>Idő (tól)</th>
                                <th className={`${thC} w-28`}>Idő (ig)</th>
                                <th className="w-10"/>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {serviceMembers.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                        <td className={tdC}><input type="text" value={row['beosztás']} onChange={e => updShift(serviceMembers, setServiceMembers, i, 'beosztás', e.target.value)} placeholder="pl. Vagyonőr" className={`${iSm} focus:border-rose-400`}/></td>
                                        <td className={tdC}><PersonPicker value={row.nev} onChange={v => updShift(serviceMembers, setServiceMembers, i, 'nev', v)} users={sortedUsers}/></td>
                                        <td className={tdC}><input type="time" onClick={openTimePicker} value={row['idő_tól']} onChange={e => updShift(serviceMembers, setServiceMembers, i, 'idő_tól', e.target.value)} className={`${tSm} focus:border-rose-400 w-full`}/></td>
                                        <td className={tdC}><input type="time" onClick={openTimePicker} value={row['idő_ig']} onChange={e => updShift(serviceMembers, setServiceMembers, i, 'idő_ig', e.target.value)} className={`${tSm} focus:border-rose-400 w-full`}/></td>
                                        <td className="px-2 py-2.5 text-center"><XBtn onClick={() => setServiceMembers(p => p.filter((_, idx) => idx !== i))}/></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Eszközök */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Eszközök átadása / átvétele</h3>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{equipment.length} tétel</span>
                        <AddBtn onClick={() => setEquipment(p => [...p, { 'megnevezés': '', 'darabszám': 1 }])} label="Sor hozzáadása" color="text-indigo-500 hover:text-indigo-700"/>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[400px]">
                            <thead><tr className="bg-slate-50 border-b border-slate-100">
                                <th className={thC}>Megnevezés</th>
                                <th className={`${thC} w-28 text-center`}>Darabszám</th>
                                <th className="w-10"/>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {equipment.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                        <td className={tdC}><input type="text" value={row['megnevezés']} onChange={e => setEquipment(p => p.map((r, idx) => idx === i ? { ...r, 'megnevezés': e.target.value } : r))} className={`${iSm} focus:border-indigo-400`}/></td>
                                        <td className={`${tdC} text-center`}><input type="number" value={row['darabszám']} min={0} onChange={e => setEquipment(p => p.map((r, idx) => idx === i ? { ...r, 'darabszám': Number(e.target.value) } : r))} className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none transition text-center"/></td>
                                        <td className="px-2 py-2.5 text-center"><XBtn onClick={() => setEquipment(p => p.filter((_, idx) => idx !== i))}/></td>
                                    </tr>
                                ))}
                                {equipment.length === 0 && <tr><td colSpan={3} className="px-5 py-4 text-center text-sm text-slate-400">Nincs eszköz rögzítve</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 6. Ellenőrzők */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Ellenőrzést végző személyek</h3>
                        <AddBtn onClick={() => setInspectors(p => [...p, { neve: '', 'idő_tól': '', 'idő_ig': '' }])} label="Sor hozzáadása" color="text-violet-500 hover:text-violet-700"/>
                    </div>
                    {errors.inspectors && <p className="px-6 pt-3 text-xs text-red-500">{errors.inspectors}</p>}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[400px]">
                            <thead><tr className="bg-slate-50 border-b border-slate-100">
                                <th className={thC}>Neve <span className="text-rose-500">*</span><span className="block normal-case font-normal text-[10px] text-slate-400 mt-0.5">Ha nincs benne a listában, gépeld be</span></th>
                                <th className={`${thC} w-28`}>Időtartam (tól)</th>
                                <th className={`${thC} w-28`}>Időtartam (ig)</th>
                                <th className="w-10"/>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {inspectors.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                        <td className={tdC}><PersonPicker value={row.neve} onChange={v => setInspectors(p => p.map((r, idx) => idx === i ? { ...r, neve: v } : r))} users={sortedUsers} focusColor="focus-within:border-violet-400" hoverColor="hover:bg-violet-50" dotColor="bg-violet-100 text-violet-600"/></td>
                                        <td className={tdC}><input type="time" onClick={openTimePicker} value={row['idő_tól']} onChange={e => setInspectors(p => p.map((r, idx) => idx === i ? { ...r, 'idő_tól': e.target.value } : r))} className={`${tSm} focus:border-violet-400 w-full`}/></td>
                                        <td className={tdC}><input type="time" onClick={openTimePicker} value={row['idő_ig']} onChange={e => setInspectors(p => p.map((r, idx) => idx === i ? { ...r, 'idő_ig': e.target.value } : r))} className={`${tSm} focus:border-violet-400 w-full`}/></td>
                                        <td className="px-2 py-2.5 text-center"><XBtn onClick={() => setInspectors(p => p.filter((_, idx) => idx !== i))}/></td>
                                    </tr>
                                ))}
                                {inspectors.length === 0 && <tr><td colSpan={4} className="px-5 py-4 text-center text-sm text-slate-400">Nincs rögzített ellenőr</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 7. Járőrözés */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Járőrözés és zártság ellenőrzése</h3>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{patrols.length} kör</span>
                        <AddBtn onClick={() => setPatrols(p => [...p, { 'vagyonőr': '', 'időpont': '', 'megjegyzés': '' }])} label="Sor hozzáadása" color="text-emerald-600 hover:text-emerald-800"/>
                    </div>
                    {errors.patrols && <p className="px-6 pt-3 text-xs text-red-500">{errors.patrols}</p>}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[480px]">
                            <thead><tr className="bg-slate-50 border-b border-slate-100">
                                <th className={thC}>Vagyonőr <span className="text-rose-500">*</span><span className="block normal-case font-normal text-[10px] text-slate-400 mt-0.5">Ha nincs benne a listában, gépeld be</span></th>
                                <th className={`${thC} w-28`}>Időpont</th>
                                <th className={thC}>Megjegyzés / hiba</th>
                                <th className="w-10"/>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {patrols.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                        <td className={tdC}><PersonPicker value={row['vagyonőr']} onChange={v => setPatrols(p => p.map((r, idx) => idx === i ? { ...r, 'vagyonőr': v } : r))} users={sortedUsers} focusColor="focus-within:border-emerald-400" hoverColor="hover:bg-emerald-50" dotColor="bg-emerald-100 text-emerald-600" placeholder="Név"/></td>
                                        <td className={tdC}><input type="time" onClick={openTimePicker} value={row['időpont']} onChange={e => setPatrols(p => p.map((r, idx) => idx === i ? { ...r, 'időpont': e.target.value } : r))} className={`${tSm} focus:border-emerald-400 w-full`}/></td>
                                        <td className={tdC}><input type="text" value={row['megjegyzés']} onChange={e => setPatrols(p => p.map((r, idx) => idx === i ? { ...r, 'megjegyzés': e.target.value } : r))} placeholder="–" className={`${iSm} focus:border-emerald-400`}/></td>
                                        <td className="px-2 py-2.5 text-center"><XBtn onClick={() => setPatrols(p => p.filter((_, idx) => idx !== i))}/></td>
                                    </tr>
                                ))}
                                {patrols.length === 0 && <tr><td colSpan={4} className="px-5 py-4 text-center text-sm text-slate-400">Nincs rögzített járőrözés</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 8. Rendkívüli események */}
                <div className="bg-white border border-rose-200 rounded-2xl shadow-sm">
                    <div className="px-6 py-4 border-b border-rose-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-rose-700">Rendkívüli események</h3>
                        {incidents.length > 0 && <span className="text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">{incidents.length} esemény</span>}
                        <AddBtn onClick={() => setIncidents(p => [...p, { 'időpont': '', 'leírás': '' }])} label="Esemény hozzáadása"/>
                    </div>
                    <div className="divide-y divide-rose-50">
                        {incidents.map((row, i) => (
                            <div key={i} className="px-6 py-4 flex gap-4 items-start hover:bg-rose-50/40 transition-colors">
                                <input type="time" onClick={openTimePicker} value={row['időpont']} onChange={e => setIncidents(p => p.map((r, idx) => idx === i ? { ...r, 'időpont': e.target.value } : r))} className={`${tSm} focus:border-rose-400 w-28 shrink-0`}/>
                                <textarea value={row['leírás']} onChange={e => setIncidents(p => p.map((r, idx) => idx === i ? { ...r, 'leírás': e.target.value } : r))} rows={2} placeholder="Esemény leírása..." className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm focus:border-rose-400 focus:outline-none transition resize-none"/>
                                <div className="mt-1 shrink-0"><XBtn onClick={() => setIncidents(p => p.filter((_, idx) => idx !== i))}/></div>
                            </div>
                        ))}
                        {incidents.length === 0 && <div className="px-6 py-5 text-sm text-slate-400 text-center">Nem volt rendkívüli esemény</div>}
                    </div>
                </div>

                {/* 9. Eseménynaptár */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Eseménynaptár</h3>
                        {events.length > 0 && <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{events.length} tétel</span>}
                        <AddBtn onClick={() => setEvents(p => [...p, { 'idő_tól': '', 'idő_ig': '', 'leírás': '' }])} label="Esemény hozzáadása" color="text-blue-500 hover:text-blue-700"/>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {events.map((row, i) => (
                            <div key={i} className="px-6 py-4 flex gap-4 items-start hover:bg-slate-50/80 transition-colors">
                                <div className="flex items-center gap-1 shrink-0">
                                    <input type="time" onClick={openTimePicker} value={row['idő_tól']} onChange={e => setEvents(p => p.map((r, idx) => idx === i ? { ...r, 'idő_tól': e.target.value } : r))} className={`${tSm} focus:border-blue-400 w-24`}/>
                                    <span className="text-slate-400 text-xs">–</span>
                                    <input type="time" onClick={openTimePicker} value={row['idő_ig']} onChange={e => setEvents(p => p.map((r, idx) => idx === i ? { ...r, 'idő_ig': e.target.value } : r))} className={`${tSm} focus:border-blue-400 w-24`}/>
                                </div>
                                <textarea value={row['leírás']} onChange={e => setEvents(p => p.map((r, idx) => idx === i ? { ...r, 'leírás': e.target.value } : r))} rows={2} placeholder="Esemény leírása..." className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm focus:border-blue-400 focus:outline-none transition resize-none"/>
                                <div className="mt-1 shrink-0"><XBtn onClick={() => setEvents(p => p.filter((_, idx) => idx !== i))}/></div>
                            </div>
                        ))}
                        {events.length === 0 && <div className="px-6 py-5 text-sm text-slate-400 text-center">Nincs bejegyzett esemény</div>}
                    </div>
                </div>

                {/* 10. Tűzjelző */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Tűzjelző rendszer jelzések</h3>
                        {fireAlarms.length > 0 && <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{fireAlarms.length} jelzés</span>}
                        <AddBtn onClick={() => setFireAlarms(p => [...p, { 'megnevezés': 'Tűzjelzés', 'készpont': '', 'időpont': '', 'ellenőrző': '' }])} label="Sor hozzáadása" color="text-orange-500 hover:text-orange-700"/>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[560px]">
                            <thead><tr className="bg-slate-50 border-b border-slate-100">
                                <th className={thC}>Megnevezés</th>
                                <th className={thC}>Készpont</th>
                                <th className={`${thC} w-24`}>Időpont</th>
                                <th className={thC}>Ellenőrző</th>
                                <th className="w-10"/>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {fireAlarms.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                        <td className={tdC}><input type="text" value={row['megnevezés']} onChange={e => setFireAlarms(p => p.map((r, idx) => idx === i ? { ...r, 'megnevezés': e.target.value } : r))} className={`${iSm} focus:border-orange-400`}/></td>
                                        <td className={tdC}><input type="text" value={row['készpont']} onChange={e => setFireAlarms(p => p.map((r, idx) => idx === i ? { ...r, 'készpont': e.target.value } : r))} className={`${iSm} focus:border-orange-400`}/></td>
                                        <td className={tdC}><input type="time" onClick={openTimePicker} value={row['időpont']} onChange={e => setFireAlarms(p => p.map((r, idx) => idx === i ? { ...r, 'időpont': e.target.value } : r))} className={`${tSm} focus:border-orange-400 w-full`}/></td>
                                        <td className={tdC}><input type="text" value={row['ellenőrző']} onChange={e => setFireAlarms(p => p.map((r, idx) => idx === i ? { ...r, 'ellenőrző': e.target.value } : r))} className={`${iSm} focus:border-orange-400`}/></td>
                                        <td className="px-2 py-2.5 text-center"><XBtn onClick={() => setFireAlarms(p => p.filter((_, idx) => idx !== i))}/></td>
                                    </tr>
                                ))}
                                {fireAlarms.length === 0 && <tr><td colSpan={5} className="px-5 py-4 text-center text-sm text-slate-400">Nem volt tűzjelzés</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 11. Liftek */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Liftek ellenőrzése</h3>
                        {elevators.length > 0 && <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{elevators.length} lift</span>}
                        <AddBtn onClick={() => setElevators(p => [...p, { 'megnevezés': 'Liftek', 'időpont': '', 'ellenőrző': '' }])} label="Sor hozzáadása" color="text-cyan-600 hover:text-cyan-800"/>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[400px]">
                            <thead><tr className="bg-slate-50 border-b border-slate-100">
                                <th className={thC}>Megnevezés</th>
                                <th className={`${thC} w-28`}>Időpont</th>
                                <th className={thC}>Ellenőrző</th>
                                <th className="w-10"/>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {elevators.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                        <td className={tdC}><input type="text" value={row['megnevezés']} onChange={e => setElevators(p => p.map((r, idx) => idx === i ? { ...r, 'megnevezés': e.target.value } : r))} className={`${iSm} focus:border-cyan-400`}/></td>
                                        <td className={tdC}><input type="time" onClick={openTimePicker} value={row['időpont']} onChange={e => setElevators(p => p.map((r, idx) => idx === i ? { ...r, 'időpont': e.target.value } : r))} className={`${tSm} focus:border-cyan-400 w-full`}/></td>
                                        <td className={tdC}><PersonPicker value={row['ellenőrző']} onChange={v => setElevators(p => p.map((r, idx) => idx === i ? { ...r, 'ellenőrző': v } : r))} users={sortedUsers} focusColor="focus-within:border-cyan-400" hoverColor="hover:bg-cyan-50" dotColor="bg-cyan-100 text-cyan-600"/></td>
                                        <td className="px-2 py-2.5 text-center"><XBtn onClick={() => setElevators(p => p.filter((_, idx) => idx !== i))}/></td>
                                    </tr>
                                ))}
                                {elevators.length === 0 && <tr><td colSpan={4} className="px-5 py-4 text-center text-sm text-slate-400">Nincs rögzített liftellenőrzés</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 12. Karbantartások */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Karbantartások / munkavégzések</h3>
                        {maintenance.length > 0 && <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{maintenance.length} tétel</span>}
                        <AddBtn onClick={() => setMaintenance(p => [...p, { 'cég': '', 'helyszín': '', 'idő_tól': '', 'idő_ig': '' }])} label="Sor hozzáadása" color="text-amber-600 hover:text-amber-800"/>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[520px]">
                            <thead><tr className="bg-slate-50 border-b border-slate-100">
                                <th className={thC}>Cég / kivitelező</th>
                                <th className={thC}>Helyszín / munka</th>
                                <th className={`${thC} w-28`}>Kezdete</th>
                                <th className={`${thC} w-28`}>Vége</th>
                                <th className="w-10"/>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {maintenance.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                        <td className={tdC}><input type="text" value={row['cég']} onChange={e => setMaintenance(p => p.map((r, idx) => idx === i ? { ...r, 'cég': e.target.value } : r))} className={`${iSm} focus:border-amber-400`}/></td>
                                        <td className={tdC}><input type="text" value={row['helyszín']} onChange={e => setMaintenance(p => p.map((r, idx) => idx === i ? { ...r, 'helyszín': e.target.value } : r))} className={`${iSm} focus:border-amber-400`}/></td>
                                        <td className={tdC}><input type="time" onClick={openTimePicker} value={row['idő_tól']} onChange={e => setMaintenance(p => p.map((r, idx) => idx === i ? { ...r, 'idő_tól': e.target.value } : r))} className={`${tSm} focus:border-amber-400 w-full`}/></td>
                                        <td className={tdC}><input type="time" onClick={openTimePicker} value={row['idő_ig']} onChange={e => setMaintenance(p => p.map((r, idx) => idx === i ? { ...r, 'idő_ig': e.target.value } : r))} className={`${tSm} focus:border-amber-400 w-full`}/></td>
                                        <td className="px-2 py-2.5 text-center"><XBtn onClick={() => setMaintenance(p => p.filter((_, idx) => idx !== i))}/></td>
                                    </tr>
                                ))}
                                {maintenance.length === 0 && <tr><td colSpan={5} className="px-5 py-4 text-center text-sm text-slate-400">Nem volt karbantartás</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 13. Email & megosztás */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Email értesítés & megosztás</h3>
                    </div>
                    <div className="p-6 space-y-5">
                        {sortedUsers.length > 0 && (
                            <SharePicker
                                allUsers={sortedUsers}
                                value={shareUserIds}
                                onChange={setShareUserIds}
                            />
                        )}
                        <div>
                            <label className={lSm}>Extra CC email-ek (opcionális)</label>
                            <input type="text" value={ccRecipients} onChange={e => setCcRecipients(e.target.value)} placeholder="email1@pelda.hu, email2@pelda.hu" className={iLg}/>
                            <p className="text-xs text-slate-400 mt-1.5">Vesszővel elválasztva.</p>
                        </div>
                    </div>
                </div>

                {/* Validációs hibák */}
                {valErrors.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl px-6 py-4">
                        <p className="text-sm font-bold text-rose-700 mb-2">Kérlek töltsd ki az összes kötelező mezőt:</p>
                        <ul className="space-y-1">
                            {valErrors.map(err => (
                                <li key={err} className="flex items-start gap-2 text-sm text-rose-600">
                                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <span>{err}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Submit */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between">
                    <a href={route('security.show', security.id)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors">
                        Mégse
                    </a>
                    <button type="submit" disabled={processing}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white text-sm font-bold rounded-xl transition-colors shadow-sm cursor-pointer">
                        {processing ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                        )}
                        Változtatások mentése
                    </button>
                </div>

            </form>
        </Layout>
    );
}
