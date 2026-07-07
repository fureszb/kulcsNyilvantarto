import { useMemo, useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { useOwnLayout } from '../../hooks/useOwnLayout';

declare function route(name: string, params?: unknown): string;

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

const HU_MONTHS = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];

interface Area { id: number; name: string; location_id: number | null; }
interface Employee { id: number; area_id: number; name: string; user_id: number | null; }
interface ScheduleRow { employee_id: number; day: number; value: string | null; }
interface OverrideRow { area_id: number; employee_id: number; day: number; slot: 'night' | 'day'; cover_employee_id: number; cover_area_id: number; }
interface ChangelogRow { id: number; year: number; month: number; day: number; absent_employee: string | null; absent_area: string | null; cover_employee: string | null; cover_area: string | null; slot: string | null; action: string | null; }
interface UserRow { id: number; name: string; }
interface LocationOption { id: number; name: string; }

interface Props {
    year: number;
    month: number;
    areas: Area[];
    employees: Employee[];
    schedule: ScheduleRow[];
    overrides: OverrideRow[];
    changelog: ChangelogRow[];
    users: UserRow[];
    canEdit: boolean;
    canImport: boolean;
    assignableLocations: LocationOption[] | null;
}

interface Candidate { empId: number; name: string; areaId: number; area: string; source: 'natural' | 'free'; flag: 'plus' | 'uncertain' | null; }

const FLAG_ORDER: Record<string, number> = { plus: 0, none: 1, uncertain: 2 };
function sortCandidates(list: Candidate[]) {
    return list.sort((a, b) => {
        if (a.source !== b.source) return a.source === 'natural' ? -1 : 1;
        return FLAG_ORDER[a.flag ?? 'none'] - FLAG_ORDER[b.flag ?? 'none'];
    });
}

const visitOpts = { preserveScroll: true, preserveState: true } as const;

function daysInMonth(y: number, m: number) { return new Date(y, m, 0).getDate(); }
function isWeekend(y: number, m: number, d: number) { const dow = new Date(y, m - 1, d).getDay(); return dow === 0 || dow === 6; }

function cellKind(val: string | null | undefined) {
    if (val === null || val === undefined) return 'empty';
    if (val === 'X') return 'x';
    if (val === '?') return 'q';
    if (val === '+') return 'plus';
    if (val === '24') return 'work24';
    return 'num';
}

export default function VezenylesIndex({ year, month, areas, employees, schedule, overrides, changelog, users, canEdit, canImport, assignableLocations }: Props) {
    const Layout = useOwnLayout();

    const [currentView, setCurrentView] = useState<'felvitel' | 'potlas'>('felvitel');
    const [selectedAreaId, setSelectedAreaId] = useState<number | null>(areas[0]?.id ?? null);
    const [currentAreaTab, setCurrentAreaTab] = useState(0);
    const [selection, setSelection] = useState<{ areaId: number; employeeId: number; day: number } | null>(null);
    const [newEmpName, setNewEmpName] = useState('');
    const [newEmpUserId, setNewEmpUserId] = useState('');
    const [newAreaName, setNewAreaName] = useState('');
    const [newAreaLocationId, setNewAreaLocationId] = useState('');
    const [importing, setImporting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const effectiveAreaId = useMemo(() => {
        if (selectedAreaId && areas.some(a => a.id === selectedAreaId)) return selectedAreaId;
        return areas[0]?.id ?? null;
    }, [selectedAreaId, areas]);

    // ── Lookup map-ek ────────────────────────────────────────────────────────
    const scheduleMap = useMemo(() => {
        const m = new Map<string, string | null>();
        schedule.forEach(r => m.set(`${r.employee_id}:${r.day}`, r.value));
        return m;
    }, [schedule]);
    const scheduleVal = (empId: number, day: number): string | null => {
        if (day < 1) return null;
        const v = scheduleMap.get(`${empId}:${day}`);
        return v === undefined ? null : v;
    };

    const overrideMap = useMemo(() => {
        const m = new Map<string, { night: OverrideRow | null; day: OverrideRow | null }>();
        overrides.forEach(o => {
            const key = `${o.area_id}:${o.employee_id}:${o.day}`;
            const cur = m.get(key) ?? { night: null, day: null };
            cur[o.slot] = o;
            m.set(key, cur);
        });
        return m;
    }, [overrides]);
    const overridesForAbsence = (areaId: number, empId: number, day: number) =>
        overrideMap.get(`${areaId}:${empId}:${day}`) ?? { night: null, day: null };

    const empsByArea = useMemo(() => {
        const m = new Map<number, Employee[]>();
        [...employees].sort((a, b) => a.name.localeCompare(b.name, 'hu')).forEach(e => {
            const arr = m.get(e.area_id) ?? [];
            arr.push(e); m.set(e.area_id, arr);
        });
        return m;
    }, [employees]);
    const empById = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);
    const areaById = useMemo(() => new Map(areas.map(a => [a.id, a])), [areas]);

    const classifyOT = (empId: number, day: number): 'night' | 'day' | null => {
        const prev1 = scheduleVal(empId, day - 1);
        const prev2 = scheduleVal(empId, day - 2);
        if (prev1 === '24') return 'night';
        if (prev2 === '24' && prev1 !== '24') return 'day';
        return null;
    };

    const nd = daysInMonth(year, month);

    // ── Navigáció / hónapváltás ──────────────────────────────────────────────
    function goto(newYear: number, newMonth: number) {
        setSelection(null);
        router.get(route('vezenyles.index'), { year: newYear, month: newMonth }, { ...visitOpts, replace: true });
    }

    // ── Mutációk ─────────────────────────────────────────────────────────────
    function editCell(empId: number, day: number) {
        const current = scheduleVal(empId, day);
        const raw = window.prompt('Érték (óraszám, pl. 24 / 12 / 10, vagy X / ? / +). Üresen hagyva törli:', current ?? '');
        if (raw === null) return;
        router.post(route('vezenyles.schedule.upsert'), { year, month, employee_id: empId, day, value: raw }, visitOpts);
    }
    function addArea() {
        const name = newAreaName.trim();
        if (!name) return;
        if ((assignableLocations?.length ?? 0) > 0 && !newAreaLocationId) {
            window.alert('Válassz irodaházat az új területhez.');
            return;
        }
        router.post(route('vezenyles.areas.store'), {
            year, month, name,
            location_id: newAreaLocationId ? Number(newAreaLocationId) : null,
        }, { ...visitOpts, onSuccess: () => { setNewAreaName(''); setNewAreaLocationId(''); } });
    }
    function delArea() {
        if (!effectiveAreaId) return;
        if (!window.confirm('Biztosan törlöd ezt a területet, a dolgozóival és beosztásukkal együtt?')) return;
        router.delete(route('vezenyles.areas.destroy', effectiveAreaId), { data: { year, month }, ...visitOpts });
    }
    function setAreaLocation(areaId: number, locationId: string) {
        router.put(route('vezenyles.areas.update', areaId), {
            year, month, location_id: locationId ? Number(locationId) : null,
        }, visitOpts);
    }
    function addEmployee() {
        const name = newEmpName.trim();
        if (!name || !effectiveAreaId) return;
        router.post(route('vezenyles.employees.store'), {
            year, month, area_id: effectiveAreaId, name,
            user_id: newEmpUserId ? Number(newEmpUserId) : null,
        }, {
            ...visitOpts,
            onSuccess: () => { setNewEmpName(''); setNewEmpUserId(''); },
        });
    }
    function delEmployee(emp: Employee) {
        if (!window.confirm(`Törlöd "${emp.name}" dolgozót és teljes beosztását?`)) return;
        router.delete(route('vezenyles.employees.destroy', emp.id), { data: { year, month }, ...visitOpts });
    }
    function assignCover(cand: Candidate, slot: 'night' | 'day') {
        if (!selection) return;
        router.post(route('vezenyles.overrides.store'), {
            year, month,
            area_id: selection.areaId, employee_id: selection.employeeId, day: selection.day,
            slot, cover_employee_id: cand.empId, cover_area_id: cand.areaId,
        }, { ...visitOpts, onSuccess: () => setSelection(null) });
    }
    function removeCover(areaId: number, empId: number, day: number, slot: 'night' | 'day') {
        router.delete(route('vezenyles.overrides.destroy'), {
            data: { year, month, area_id: areaId, employee_id: empId, day, slot }, ...visitOpts,
        });
    }

    // ── Régi Excel import (kliens oldali parse) ──────────────────────────────
    async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || !files.length) return;
        const importYear = parseInt(window.prompt('Melyik évre vonatkozik ez az import? (pl. 2026)', String(year)) || '0', 10);
        if (!importYear) { if (fileRef.current) fileRef.current.value = ''; return; }
        setImporting(true);
        try {
            const XLSX = await import('xlsx');
            const normalize = (s: unknown) => (s ?? '').toString().trim().toLowerCase();
            const monthsLower = HU_MONTHS.map(m => m.toLowerCase());
            const sheets: { area: string; month: number; employees: { name: string; cells: Record<string, string | null> }[] }[] = [];

            for (const file of Array.from(files)) {
                const buf = await file.arrayBuffer();
                const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
                const fallbackArea = file.name.replace(/\.xlsx$/i, '');
                wb.SheetNames.forEach((sn) => {
                    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: true, defval: null }) as unknown[][];
                    let headerIdx = -1;
                    for (let i = 0; i < rows.length; i++) { if (normalize(rows[i]?.[0]).startsWith('név')) { headerIdx = i; break; } }
                    if (headerIdx === -1) return;
                    const header = rows[headerIdx];
                    const dayCols: { day: number; col: number }[] = [];
                    for (let c = 1; c < header.length; c++) { if (typeof header[c] === 'number') dayCols.push({ day: header[c] as number, col: c }); }
                    if (!dayCols.length) return;

                    const emps: { name: string; cells: Record<string, string | null> }[] = [];
                    for (let r = headerIdx + 1; r < rows.length; r++) {
                        const row = rows[r]; const nm = row?.[0]; if (!nm) continue;
                        if (normalize(nm).startsWith('össz')) break;
                        const cells: Record<string, string | null> = {};
                        for (const dc of dayCols) {
                            const v = row[dc.col]; let val: string | null = null;
                            if (typeof v === 'number') val = String(v);
                            else if (typeof v === 'string') { const t = v.trim(); if (/^x$/i.test(t)) val = 'X'; else if (t === '?' || t === '+') val = t; }
                            cells[dc.day] = val;
                        }
                        emps.push({ name: nm.toString().trim(), cells });
                    }
                    if (!emps.length) return;

                    const n = normalize(sn);
                    const monthIdx = monthsLower.findIndex(m => n.includes(m.slice(0, 4)));
                    if (monthIdx < 0) return;
                    let area = fallbackArea;
                    const slash = sn.split('/'); if (slash.length > 1) area = slash[1].trim();
                    sheets.push({ area, month: monthIdx + 1, employees: emps });
                });
            }

            if (!sheets.length) { window.alert('Nem találtam feldolgozható munkalapot (fejléc „Név” + számozott napok + felismerhető hónapnév kell).'); return; }
            router.post(route('vezenyles.import'), { year, month, import_year: importYear, sheets }, visitOpts);
        } catch (err) {
            window.alert('Import hiba: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setImporting(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    }

    // ── Jelöltek számítása (kliens oldali) ───────────────────────────────────
    const candidates = useMemo(() => {
        if (!selection) return null;
        const absentEmp = empById.get(selection.employeeId);
        const absentArea = areaById.get(selection.areaId);
        if (!absentEmp || !absentArea) return null;
        const day = selection.day;
        const ov = overridesForAbsence(selection.areaId, selection.employeeId, day);
        const needed: ('night' | 'day')[] = [];
        if (!ov.night) needed.push('night');
        if (!ov.day) needed.push('day');
        if (!needed.length) return { absentEmp, absentArea, day, ov, needed, night: [] as Candidate[], day_: [] as Candidate[] };

        const busy = new Set(overrides.filter(o => o.day === day).map(o => `${o.cover_area_id}:${o.cover_employee_id}`));
        const night: Candidate[] = []; const day_: Candidate[] = [];
        areas.forEach(a => {
            (empsByArea.get(a.id) ?? []).forEach(emp => {
                if (a.id === selection.areaId && emp.id === selection.employeeId) return;
                if (busy.has(`${a.id}:${emp.id}`)) return;

                // Aznapi elérhetőség: szabad, ha üres / '+' (túlórát vállal) / '?' (bizonytalan).
                // Kizárva, ha 'X' (nem ér rá) vagy bármilyen óraszám (aznap már dolgozik, 24 is).
                const dayVal = scheduleVal(emp.id, day);
                if (dayVal === 'X') return;
                if (dayVal !== null && dayVal !== '+' && dayVal !== '?') return;
                const flag: 'plus' | 'uncertain' | null = dayVal === '+' ? 'plus' : (dayVal === '?' ? 'uncertain' : null);

                const prev1 = scheduleVal(emp.id, day - 1);
                const prev2 = scheduleVal(emp.id, day - 2);
                const base = { empId: emp.id, name: emp.name, areaId: a.id, area: a.name, flag };

                // Éjszakai blokk: "természetes" jelölt, aki előző nap (D-1) 24h-t dolgozott;
                // egyébként minden szabad ember is felajánlható.
                if (needed.includes('night')) {
                    night.push({ ...base, source: prev1 === '24' ? 'natural' : 'free' });
                }
                // Nappali blokk: "természetes" jelölt, aki két nappal korábban (D-2) volt 24h-ban,
                // de D-1-en nem; egyébként minden szabad ember is felajánlható.
                if (needed.includes('day')) {
                    const naturalDay = prev2 === '24' && prev1 !== '24';
                    day_.push({ ...base, source: naturalDay ? 'natural' : 'free' });
                }
            });
        });
        return { absentEmp, absentArea, day, ov, needed, night: sortCandidates(night), day_: sortCandidates(day_) };
    }, [selection, overrides, areas, empsByArea, scheduleMap, overrideMap]);

    const felvitelEmps = effectiveAreaId ? (empsByArea.get(effectiveAreaId) ?? []) : [];
    const potlasArea = areas[Math.min(currentAreaTab, Math.max(0, areas.length - 1))];
    const potlasEmps = potlasArea ? (empsByArea.get(potlasArea.id) ?? []) : [];
    const days = Array.from({ length: nd }, (_, i) => i + 1);

    return (
        <Layout title="Vezénylés">
            <div className="vez-app">
                <style>{CSS}</style>

                {/* Hero */}
                <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 shadow-2xl"
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                    <div className="relative z-10 px-8 py-8 flex items-center justify-between gap-6 flex-wrap">
                        <div>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Vezénylés</p>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">Beosztás és pótlás tervezés</h1>
                            <p className="text-slate-400 mt-1 text-sm">{HU_MONTHS[month - 1]} {year} — az adatok automatikusan mentődnek</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <select className="vez-hero-select" value={month} onChange={e => goto(year, parseInt(e.target.value, 10))}>
                                {HU_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                            <input type="number" className="vez-hero-input" style={{ width: 84 }} value={year} onChange={e => goto(parseInt(e.target.value, 10) || year, month)} />
                            {canImport && (
                                <label className={`vez-hero-btn ${importing ? 'disabled' : ''}`}>
                                    {importing ? 'Import…' : 'Excel import'}
                                    <input ref={fileRef} type="file" accept=".xlsx" multiple disabled={importing} onChange={handleImportFile} />
                                </label>
                            )}
                        </div>
                    </div>
                    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.038, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
                </div>

                {/* Nézetváltó */}
                {canEdit && (
                    <div className="vez-viewtabs">
                        <button className={currentView === 'felvitel' ? 'active' : ''} onClick={() => setCurrentView('felvitel')}>Felvitel</button>
                        <button className={currentView === 'potlas' ? 'active' : ''} onClick={() => setCurrentView('potlas')}>Pótlás tervezés</button>
                    </div>
                )}

                {/* ── FELVITEL ── */}
                {(currentView === 'felvitel' || !canEdit) && (
                    <div className="layout">
                        <div className="col-main">
                            <div className="card">
                                <h2>Beosztás rögzítése <span className="n">({HU_MONTHS[month - 1]} {year})</span></h2>
                                <div className="legend">
                                    <span><i className="sw" style={{ background: 'rgba(239,68,68,.18)' }} /> hétvége</span>
                                    <span><i className="sw" style={{ background: 'var(--amber)' }} /> 24 órás szolgálat</span>
                                    <span><i className="sw" style={{ background: '#e2e8f0' }} /> egyéb óraszám</span>
                                    <span><i className="sw" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }} /> ?, X, + jelölés</span>
                                </div>
                                <div className="gridwrap">
                                    {!effectiveAreaId ? (
                                        <div className="none" style={{ padding: 8 }}>Válassz vagy hozz létre egy területet.</div>
                                    ) : (
                                        <table className="grid">
                                            <thead>
                                                <tr>
                                                    <th className="name">Név</th>
                                                    {days.map(d => <th key={d} className={isWeekend(year, month, d) ? 'weekend' : ''}>{d}</th>)}
                                                    <th>Össz.</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {felvitelEmps.map(emp => {
                                                    let total = 0;
                                                    return (
                                                        <tr key={emp.id}>
                                                            <td className="name">{emp.name}</td>
                                                            {days.map(d => {
                                                                const val = scheduleVal(emp.id, d);
                                                                const kind = cellKind(val);
                                                                const num = Number(val);
                                                                if (!isNaN(num) && val !== null && val !== '') total += num;
                                                                let cls = 'cell-empty';
                                                                if (kind === 'work24') cls = 'cell-work';
                                                                else if (kind === 'num') cls = 'cell-num';
                                                                else if (kind !== 'empty') cls = 'cell-sym ' + kind;
                                                                if (isWeekend(year, month, d)) cls += ' weekend-col';
                                                                return <td key={d} className={cls} onClick={canEdit ? () => editCell(emp.id, d) : undefined}>{val ?? ''}</td>;
                                                            })}
                                                            <td className="cell-total">{total}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                <div className="hint">Kattints egy cellára az érték megadásához: óraszám (pl. 24, 12, 10), vagy jelölés: <b>X</b> (nem jó neki), <b>?</b> (bizonytalan), <b>+</b> (túlóra igény). Üresen hagyva törli.</div>
                            </div>
                        </div>
                        <div className="col-side">
                            <div className="card">
                                <h2>Területek</h2>
                                <div className="row">
                                    <select style={{ flex: 1 }} value={effectiveAreaId ?? ''} onChange={e => setSelectedAreaId(parseInt(e.target.value, 10))}>
                                        {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                    {canEdit && <button className="btn small danger" onClick={delArea}>Törlés</button>}
                                </div>

                                {canEdit && assignableLocations && effectiveAreaId && (
                                    <div className="row" style={{ marginTop: 8 }}>
                                        <span style={{ fontSize: 11.5, color: 'var(--ink-dim)' }}>Irodaház:</span>
                                        <select
                                            style={{ flex: 1 }}
                                            value={areaById.get(effectiveAreaId)?.location_id ?? ''}
                                            onChange={e => setAreaLocation(effectiveAreaId, e.target.value)}
                                        >
                                            <option value="">— nincs hozzárendelve —</option>
                                            {assignableLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {canEdit && assignableLocations && (
                                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                                        <div className="row">
                                            <input type="text" placeholder="Új terület neve" style={{ flex: 1 }} value={newAreaName}
                                                onChange={e => setNewAreaName(e.target.value)} />
                                        </div>
                                        <div className="row" style={{ marginTop: 6 }}>
                                            <select style={{ flex: 1 }} value={newAreaLocationId} onChange={e => setNewAreaLocationId(e.target.value)}>
                                                <option value="">— irodaház —</option>
                                                {assignableLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                            </select>
                                            <button className="btn small primary" onClick={addArea}>+ Új terület</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="card">
                                <h2>Dolgozók <span className="n">({felvitelEmps.length})</span></h2>
                                {canEdit && (
                                    <>
                                        <div className="row">
                                            <input type="text" placeholder="Új dolgozó neve" style={{ flex: 1 }} value={newEmpName}
                                                onChange={e => setNewEmpName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addEmployee(); }} />
                                        </div>
                                        <div className="row" style={{ marginTop: 8 }}>
                                            <select style={{ flex: 1 }} value={newEmpUserId} onChange={e => setNewEmpUserId(e.target.value)}>
                                                <option value="">— nincs fiók-kötés —</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                            <button className="btn small primary" onClick={addEmployee}>Hozzáad</button>
                                        </div>
                                    </>
                                )}
                                <div className="emplist">
                                    {felvitelEmps.length === 0 && <div className="none">Még nincs dolgozó ezen a területen.</div>}
                                    {felvitelEmps.map(emp => (
                                        <div key={emp.id} className="emprow">
                                            <span>{emp.name}{emp.user_id ? <span className="tag">fiók</span> : null}</span>
                                            {canEdit && <button title="Törlés" onClick={() => delEmployee(emp)}>✕</button>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── PÓTLÁS ── */}
                {canEdit && currentView === 'potlas' && (
                    <div className="layout">
                        <div className="col-main">
                            <div className="card">
                                <h2>Beosztás <span className="n">({HU_MONTHS[month - 1]} {year})</span></h2>
                                <div className="legend">
                                    <span><i className="sw" style={{ background: 'rgba(239,68,68,.18)' }} /> hétvége</span>
                                    <span><i className="sw" style={{ background: 'var(--amber)' }} /> 24 órás szolgálat</span>
                                    <span><i className="sw" style={{ background: 'rgba(59,130,246,.35)' }} /> éjszakai 12h túlóra</span>
                                    <span><i className="sw" style={{ background: 'rgba(239,68,68,.30)' }} /> nappali 12h túlóra</span>
                                    <span><i className="sw" style={{ background: 'rgba(16,185,129,.40)' }} /> teljesen pótolva</span>
                                    <span><i className="sw cell-covered-partial" style={{ width: 12, height: 12 }} /> részben pótolva</span>
                                </div>
                                <div className="tabs">
                                    {areas.map((a, idx) => (
                                        <button key={a.id} className={`tab2 ${idx === currentAreaTab ? 'active' : ''}`}
                                            onClick={() => { setCurrentAreaTab(idx); setSelection(null); }}>{a.name}</button>
                                    ))}
                                </div>
                                <div className="gridwrap">
                                    {!potlasArea ? (
                                        <div className="none" style={{ padding: 8 }}>Nincs terület.</div>
                                    ) : (
                                        <table className="grid">
                                            <thead>
                                                <tr>
                                                    <th className="name">Név</th>
                                                    {days.map(d => <th key={d} className={isWeekend(year, month, d) ? 'weekend' : ''}>{d}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {potlasEmps.map(emp => (
                                                    <tr key={emp.id}>
                                                        <td className="name">{emp.name}</td>
                                                        {days.map(d => {
                                                            const val = scheduleVal(emp.id, d);
                                                            const ov = overridesForAbsence(potlasArea.id, emp.id, d);
                                                            const fully = ov.night && ov.day;
                                                            const partial = (ov.night || ov.day) && !fully;
                                                            const isSel = !!selection && selection.areaId === potlasArea.id && selection.employeeId === emp.id && selection.day === d;
                                                            let cls = 'cell-empty'; let label = '';
                                                            let clickable = false;
                                                            if (fully) { cls = 'cell-covered' + (isSel ? ' selected' : ''); label = 'PÓT'; clickable = true; }
                                                            else if (partial) { cls = 'cell-covered-partial' + (isSel ? ' selected' : ''); label = 'PÓT'; clickable = true; }
                                                            else if (val === '24') { cls = 'cell-work' + (isSel ? ' removed' : ''); label = '24'; clickable = true; }
                                                            else if (val !== null && !isNaN(Number(val))) {
                                                                const ot = classifyOT(emp.id, d);
                                                                cls = ot === 'night' ? 'cell-ot-night' : (ot === 'day' ? 'cell-ot-day' : 'cell-num');
                                                                label = val;
                                                            } else if (val) { cls = 'cell-sym ' + cellKind(val); label = val; }
                                                            if (isWeekend(year, month, d)) cls += ' weekend-col';
                                                            return <td key={d} className={cls}
                                                                onClick={clickable ? () => {
                                                                    setSelection(cur => (cur && cur.areaId === potlasArea.id && cur.employeeId === emp.id && cur.day === d)
                                                                        ? null : { areaId: potlasArea.id, employeeId: emp.id, day: d });
                                                                } : undefined}>{label}</td>;
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                <div className="hint">Kattints egy sárga (24 órás) cellára, ha az adott ember aznap KIESIK. Egy szolgálat akkor <b>teljesen</b> pótolt, ha az éjszakai <b>és</b> a nappali 12 órás túlórát is kiosztottad.</div>
                            </div>
                        </div>
                        <div className="col-side">
                            <div className="card">
                                <h2>Kiesés kezelése</h2>
                                <div>
                                    {!candidates ? (
                                        <div className="none">Válassz ki egy 24 órás szolgálatot a bal oldali táblázatból.</div>
                                    ) : (
                                        <>
                                            <div className="absence-info">Kiesés: <b>{candidates.absentEmp.name}</b> ({candidates.absentArea.name}) — {HU_MONTHS[month - 1]} {candidates.day}.</div>
                                            <div className="slot-status">
                                                <div className={`slot-pill ${candidates.ov.night ? 'done' : ''}`}>
                                                    Éjszaka: {candidates.ov.night ? '✓ ' + (empById.get(candidates.ov.night.cover_employee_id)?.name ?? '?') : 'nincs pótolva'}
                                                    {candidates.ov.night && <><br /><button className="rv" onClick={() => removeCover(candidates.absentArea.id, candidates.absentEmp.id, candidates.day, 'night')}>visszavonás</button></>}
                                                </div>
                                                <div className={`slot-pill ${candidates.ov.day ? 'done' : ''}`}>
                                                    Nappal: {candidates.ov.day ? '✓ ' + (empById.get(candidates.ov.day.cover_employee_id)?.name ?? '?') : 'nincs pótolva'}
                                                    {candidates.ov.day && <><br /><button className="rv" onClick={() => removeCover(candidates.absentArea.id, candidates.absentEmp.id, candidates.day, 'day')}>visszavonás</button></>}
                                                </div>
                                            </div>
                                            {candidates.needed.includes('night') && (
                                                <div className="cand-group night">
                                                    <h3>Éjszakai 12h lehetőség</h3>
                                                    {candidates.night.length === 0 && <div className="none">Nincs elérhető jelölt.</div>}
                                                    {candidates.night.map(c => (
                                                        <div key={`n${c.areaId}:${c.empId}`} className="cand">
                                                            <div className="who">
                                                                <span className="cn">{c.name}</span>
                                                                <span className="ar">{c.area}</span>
                                                                <div className="cbadges">
                                                                    <span className={`cbadge ${c.source}`}>{c.source === 'natural' ? '24h utáni' : 'szabad'}</span>
                                                                    {c.flag === 'plus' && <span className="cbadge plus">túlórát vállal</span>}
                                                                    {c.flag === 'uncertain' && <span className="cbadge uncertain">egyeztetés kell</span>}
                                                                </div>
                                                            </div>
                                                            <button className="btn small primary" onClick={() => assignCover(c, 'night')}>Kijelöl</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {candidates.needed.includes('day') && (
                                                <div className="cand-group day">
                                                    <h3>Nappali 12h lehetőség</h3>
                                                    {candidates.day_.length === 0 && <div className="none">Nincs elérhető jelölt.</div>}
                                                    {candidates.day_.map(c => (
                                                        <div key={`d${c.areaId}:${c.empId}`} className="cand">
                                                            <div className="who">
                                                                <span className="cn">{c.name}</span>
                                                                <span className="ar">{c.area}</span>
                                                                <div className="cbadges">
                                                                    <span className={`cbadge ${c.source}`}>{c.source === 'natural' ? '24h utáni' : 'szabad'}</span>
                                                                    {c.flag === 'plus' && <span className="cbadge plus">túlórát vállal</span>}
                                                                    {c.flag === 'uncertain' && <span className="cbadge uncertain">egyeztetés kell</span>}
                                                                </div>
                                                            </div>
                                                            <button className="btn small primary" onClick={() => assignCover(c, 'day')}>Kijelöl</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {candidates.needed.length === 0 && <div className="none">Ez a nap már teljesen pótolva van (éjszaka + nappal).</div>}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="card">
                                <h2>Változásnapló <span className="n">({changelog.length})</span></h2>
                                <div className="log">
                                    {changelog.length === 0 && <div className="none">Még nincs rögzített pótlás.</div>}
                                    {changelog.map(l => (
                                        <div key={l.id} className="logrow">
                                            <span className="d">{HU_MONTHS[l.month - 1]} {l.day}.</span> {l.action === 'undo' ? 'Visszavonva' : 'Pótolva'}: <b>{l.absent_employee}</b> ({l.absent_area}) ← {l.cover_employee}{l.cover_area ? ` (${l.cover_area})` : ''} — {l.slot === 'night' ? 'éjszakai' : 'nappali'} 12h
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

const CSS = `
.vez-app{ --line:#e2e8f0; --ink:#1e293b; --ink-dim:#64748b; --amber:#f59e0b; --night:#2563eb; --day:#dc2626; --ok:#059669; }
.vez-app *{ box-sizing:border-box; }
.vez-hero-select, .vez-hero-input{ background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); color:#e2e8f0; padding:8px 10px; border-radius:10px; font-size:12.5px; outline:none; }
.vez-hero-select:focus, .vez-hero-input:focus{ border-color:rgba(255,255,255,.3); }
.vez-hero-btn{ background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); color:#cbd5e1; padding:8px 13px; border-radius:10px; cursor:pointer; font-size:12.5px; font-weight:600; display:inline-flex; align-items:center; transition:all .15s; }
.vez-hero-btn:hover{ background:rgba(255,255,255,.1); color:#fff; }
.vez-hero-btn.disabled{ opacity:.5; cursor:not-allowed; pointer-events:none; }
.vez-app .row{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.vez-app .btn{ background:#fff; border:1px solid var(--line); color:#334155; padding:8px 13px; border-radius:10px; cursor:pointer; font-size:12.5px; font-weight:600; display:inline-flex; align-items:center; text-decoration:none; transition:all .15s; }
.vez-app .btn:hover{ border-color:#93c5fd; color:#2563eb; }
.vez-app .btn.primary{ background:#2563eb; color:#fff; border-color:#2563eb; }
.vez-app .btn.primary:hover{ background:#1d4ed8; color:#fff; }
.vez-app .btn.danger:hover{ border-color:#fca5a5; color:var(--day); }
.vez-app .btn.small{ padding:6px 10px; font-size:11.5px; border-radius:8px; }
.vez-app .btn.disabled{ opacity:.55; cursor:not-allowed; pointer-events:none; }
.vez-app input[type=file]{ display:none; }
.vez-app select, .vez-app input[type=number], .vez-app input[type=text]{ background:#fff; border:1px solid var(--line); color:#334155; padding:8px 10px; border-radius:10px; font-size:12.5px; outline:none; }
.vez-app select:focus, .vez-app input:focus{ border-color:#93c5fd; box-shadow:0 0 0 3px rgba(59,130,246,.12); }
.vez-viewtabs{ display:inline-flex; gap:4px; padding:4px; background:#f1f5f9; border:1px solid var(--line); border-radius:12px; margin-bottom:16px; }
.vez-viewtabs button{ border:none; background:transparent; color:var(--ink-dim); font-size:13px; font-weight:600; padding:8px 18px; border-radius:9px; cursor:pointer; transition:all .15s; }
.vez-viewtabs button.active{ background:#fff; color:#2563eb; box-shadow:0 1px 3px rgba(0,0,0,.08); }
.vez-app .layout{ display:grid; grid-template-columns:minmax(0,1fr) 340px; gap:16px; align-items:start; }
.vez-app .layout > *{ min-width:0; }
@media (max-width:1024px){ .vez-app .layout{ grid-template-columns:minmax(0,1fr); } }
.vez-app .card{ background:#fff; border:1px solid var(--line); border-radius:16px; padding:18px; box-shadow:0 1px 2px rgba(15,23,42,.04); }
.vez-app .card + .card{ margin-top:16px; }
.vez-app .card h2{ font-size:14px; margin:0 0 12px; font-weight:700; color:#0f172a; }
.vez-app .card h2 .n{ color:var(--ink-dim); font-weight:400; }
.vez-app .hint{ font-size:11.5px; color:var(--ink-dim); margin-top:10px; line-height:1.5; }
.vez-app .none{ color:var(--ink-dim); font-size:12.5px; font-style:italic; }
.vez-app table.grid{ border-collapse:collapse; width:100%; font-size:11.5px; }
.vez-app table.grid th, .vez-app table.grid td{ border:1px solid var(--line); padding:0; text-align:center; min-width:26px; height:26px; }
.vez-app table.grid th{ color:var(--ink-dim); font-weight:600; background:#f8fafc; position:sticky; top:0; z-index:1; }
.vez-app table.grid th.weekend{ color:var(--day); background:#fef2f2; }
.vez-app table.grid td.weekend-col{ background:#fef4f4; }
.vez-app table.grid td.name, .vez-app table.grid th.name{ text-align:left; padding-left:10px; min-width:150px; position:sticky; left:0; background:#fff; z-index:2; white-space:nowrap; font-weight:600; color:#334155; }
.vez-app table.grid th.name{ background:#f8fafc; z-index:3; }
.vez-app .gridwrap{ overflow:auto; max-height:560px; border:1px solid var(--line); border-radius:12px; }
.vez-app .cell-empty{ cursor:pointer; background:#fff; }
.vez-app .cell-empty:hover{ outline:2px dashed #94a3b8; outline-offset:-2px; }
.vez-app .cell-work{ background:var(--amber); color:#451a03; font-weight:800; cursor:pointer; }
.vez-app .cell-work:hover{ outline:2px solid #b45309; outline-offset:-2px; }
.vez-app .cell-work.removed{ background:#fff; color:var(--day); text-decoration:line-through; border:1px dashed var(--day); }
.vez-app td.selected{ outline:2px solid #0f172a; outline-offset:-2px; }
.vez-app .cell-ot-night{ background:rgba(37,99,235,.14); color:#1d4ed8; font-weight:700; }
.vez-app .cell-ot-day{ background:rgba(220,38,38,.12); color:#b91c1c; font-weight:700; }
.vez-app .cell-covered{ background:rgba(16,185,129,.22); color:#047857; font-weight:800; cursor:pointer; }
.vez-app .cell-covered-partial{ background:linear-gradient(135deg,rgba(16,185,129,.28) 50%,rgba(245,158,11,.28) 50%); color:#334155; font-weight:800; cursor:pointer; }
.vez-app .cell-num{ background:#f1f5f9; color:#475569; font-weight:600; cursor:pointer; }
.vez-app .cell-total{ background:#e0e7ff; color:#3730a3; font-weight:800; }
.vez-app .cell-sym{ background:#f8fafc; font-weight:800; cursor:pointer; }
.vez-app .cell-sym.x{ color:var(--day); }
.vez-app .cell-sym.q{ color:#d97706; }
.vez-app .cell-sym.plus{ color:var(--night); }
.vez-app .legend{ display:flex; gap:14px; flex-wrap:wrap; font-size:11.5px; color:var(--ink-dim); margin-bottom:12px; }
.vez-app .legend span{ display:inline-flex; align-items:center; gap:5px; }
.vez-app .sw{ width:12px; height:12px; border-radius:3px; display:inline-block; }
.vez-app .tabs{ display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; }
.vez-app .tab2{ padding:7px 13px; border-radius:9px; border:1px solid var(--line); cursor:pointer; font-size:12.5px; color:var(--ink-dim); background:#fff; font-weight:600; }
.vez-app .tab2.active{ color:#2563eb; background:#eff6ff; border-color:#bfdbfe; }
.vez-app .cand-group{ margin-bottom:14px; }
.vez-app .cand-group h3{ font-size:11px; margin:0 0 8px; text-transform:uppercase; letter-spacing:.5px; font-weight:700; }
.vez-app .cand-group.night h3{ color:var(--night); }
.vez-app .cand-group.day h3{ color:var(--day); }
.vez-app .cand{ display:flex; align-items:center; justify-content:space-between; gap:8px; background:#f8fafc; border:1px solid var(--line); border-radius:10px; padding:8px 10px; margin-bottom:6px; font-size:12.5px; }
.vez-app .cand{ align-items:flex-start; }
.vez-app .cand .who{ display:flex; flex-direction:column; gap:2px; min-width:0; }
.vez-app .cand .who .cn{ font-weight:600; color:#334155; }
.vez-app .cand .who .ar{ color:var(--ink-dim); font-size:11px; }
.vez-app .cbadges{ display:flex; flex-wrap:wrap; gap:4px; margin-top:3px; }
.vez-app .cbadge{ font-size:9.5px; font-weight:700; padding:1px 6px; border-radius:6px; line-height:1.5; border:1px solid transparent; }
.vez-app .cbadge.natural{ background:#eef2ff; color:#4338ca; border-color:#e0e7ff; }
.vez-app .cbadge.free{ background:#f0fdf4; color:#15803d; border-color:#dcfce7; }
.vez-app .cbadge.plus{ background:#eff6ff; color:#1d4ed8; border-color:#dbeafe; }
.vez-app .cbadge.uncertain{ background:#fffbeb; color:#b45309; border-color:#fde68a; }
.vez-app .cand > .btn{ flex-shrink:0; }
.vez-app .absence-info{ background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:10px 12px; margin-bottom:12px; font-size:13px; color:#334155; }
.vez-app .absence-info b{ color:#b45309; }
.vez-app .slot-status{ display:flex; gap:8px; margin-bottom:12px; }
.vez-app .slot-pill{ flex:1; border-radius:10px; padding:9px 11px; font-size:12px; border:1px solid var(--line); background:#f8fafc; color:#334155; }
.vez-app .slot-pill.done{ border-color:#a7f3d0; background:#ecfdf5; color:#047857; }
.vez-app .slot-pill .rv{ background:none; border:none; color:var(--ink-dim); cursor:pointer; font-size:11px; text-decoration:underline; padding:0; margin-top:4px; }
.vez-app .log{ display:flex; flex-direction:column; gap:6px; max-height:340px; overflow:auto; }
.vez-app .logrow{ font-size:12px; background:#f8fafc; border:1px solid var(--line); border-radius:9px; padding:7px 10px; color:#334155; }
.vez-app .logrow .d{ color:var(--ink-dim); }
.vez-app .emplist{ display:flex; flex-direction:column; gap:6px; margin-top:12px; }
.vez-app .emprow{ display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1px solid var(--line); border-radius:10px; padding:8px 11px; font-size:12.5px; color:#334155; }
.vez-app .emprow .tag{ margin-left:6px; font-size:10px; color:#2563eb; background:#eff6ff; border:1px solid #dbeafe; padding:1px 6px; border-radius:6px; }
.vez-app .emprow button{ background:none; border:none; color:#94a3b8; cursor:pointer; font-size:13px; }
.vez-app .emprow button:hover{ color:var(--day); }
`;
