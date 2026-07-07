import { useMemo, useState, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import type { PageProps } from '../../types';

declare function route(name: string, params?: unknown): string;

const HU_MONTHS = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];

interface Area { id: number; name: string; }
interface Employee { id: number; area_id: number; name: string; user_id: number | null; }
interface ScheduleRow { employee_id: number; day: number; value: string | null; }
interface OverrideRow { area_id: number; employee_id: number; day: number; slot: 'night' | 'day'; cover_employee_id: number; cover_area_id: number; }
interface ChangelogRow { id: number; year: number; month: number; day: number; absent_employee: string | null; absent_area: string | null; cover_employee: string | null; cover_area: string | null; slot: string | null; action: string | null; }
interface UserRow { id: number; name: string; }

interface Props {
    year: number;
    month: number;
    areas: Area[];
    employees: Employee[];
    schedule: ScheduleRow[];
    overrides: OverrideRow[];
    changelog: ChangelogRow[];
    users: UserRow[];
}

interface Candidate { empId: number; name: string; areaId: number; area: string; }

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

export default function VezenylesIndex({ year, month, areas, employees, schedule, overrides, changelog, users }: Props) {
    const page = usePage<PageProps>();
    const flash = page.props.flash;

    const [currentView, setCurrentView] = useState<'felvitel' | 'potlas'>('felvitel');
    const [selectedAreaId, setSelectedAreaId] = useState<number | null>(areas[0]?.id ?? null);
    const [currentAreaTab, setCurrentAreaTab] = useState(0);
    const [selection, setSelection] = useState<{ areaId: number; employeeId: number; day: number } | null>(null);
    const [newEmpName, setNewEmpName] = useState('');
    const [newEmpUserId, setNewEmpUserId] = useState('');
    const [importing, setImporting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // Ha az adatok frissülnek és a kiválasztott terület eltűnt, essünk vissza az elsőre.
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
        const name = window.prompt('Új terület neve:');
        if (!name || !name.trim()) return;
        router.post(route('vezenyles.areas.store'), { year, month, name: name.trim() }, visitOpts);
    }
    function delArea() {
        if (!effectiveAreaId) return;
        if (!window.confirm('Biztosan törlöd ezt a területet, a dolgozóival és beosztásukkal együtt?')) return;
        router.delete(route('vezenyles.areas.destroy', effectiveAreaId), { data: { year, month }, ...visitOpts });
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

                    // Hónap + terület kitalálása a munkalap nevéből
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

    // ── Jelöltek számítása (kliens oldali, mint az eredeti) ──────────────────
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
                if (scheduleVal(emp.id, day) === '24') return;
                const prev1 = scheduleVal(emp.id, day - 1);
                const prev2 = scheduleVal(emp.id, day - 2);
                if (prev1 === '24' && needed.includes('night')) night.push({ empId: emp.id, name: emp.name, areaId: a.id, area: a.name });
                else if (prev2 === '24' && prev1 !== '24' && needed.includes('day')) day_.push({ empId: emp.id, name: emp.name, areaId: a.id, area: a.name });
            });
        });
        return { absentEmp, absentArea, day, ov, needed, night, day_ };
    }, [selection, overrides, areas, empsByArea, scheduleMap, overrideMap]);

    const felvitelEmps = effectiveAreaId ? (empsByArea.get(effectiveAreaId) ?? []) : [];
    const potlasArea = areas[Math.min(currentAreaTab, Math.max(0, areas.length - 1))];
    const potlasEmps = potlasArea ? (empsByArea.get(potlasArea.id) ?? []) : [];

    const days = Array.from({ length: nd }, (_, i) => i + 1);

    return (
        <div className="vez-app">
            <style>{CSS}</style>

            {(flash?.success || flash?.error) && (
                <div className={`vez-toast ${flash?.error ? 'err' : 'ok'}`}>{flash?.error || flash?.success}</div>
            )}

            <div className="topbar">
                <div>
                    <h1>Vezénylés <span>/ Beosztás</span></h1>
                    <div className="status">{HU_MONTHS[month - 1]} {year} — az adatok automatikusan mentődnek.</div>
                </div>
                <div className="row">
                    <select value={month} onChange={e => goto(year, parseInt(e.target.value, 10))}>
                        {HU_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <input type="number" style={{ width: 84 }} value={year} onChange={e => goto(parseInt(e.target.value, 10) || year, month)} />
                    <label className={`btn ${importing ? 'disabled' : ''}`}>
                        {importing ? 'Import…' : 'Régi Excel import'}
                        <input ref={fileRef} type="file" accept=".xlsx" multiple disabled={importing} onChange={handleImportFile} />
                    </label>
                    <Link href={route('home')} className="btn">Vissza</Link>
                </div>
            </div>

            <div className="menu">
                <div className={`tab ${currentView === 'felvitel' ? 'active' : ''}`} onClick={() => setCurrentView('felvitel')}>Felvitel</div>
                <div className={`tab ${currentView === 'potlas' ? 'active' : ''}`} onClick={() => setCurrentView('potlas')}>Pótlás tervezés</div>
            </div>

            {/* ── FELVITEL ── */}
            {currentView === 'felvitel' && (
                <div className="view active">
                    <div className="layout">
                        <div className="col-main">
                            <div className="card">
                                <h2>Beosztás rögzítése <span className="n">({HU_MONTHS[month - 1]} {year})</span></h2>
                                <div className="legend">
                                    <span><i className="sw" style={{ background: 'rgba(217,82,74,.4)' }} /> hétvége</span>
                                    <span><i className="sw" style={{ background: 'var(--amber)' }} /> 24 órás szolgálat</span>
                                    <span><i className="sw" style={{ background: 'rgba(255,255,255,.1)' }} /> egyéb óraszám</span>
                                    <span><i className="sw" style={{ background: 'rgba(255,255,255,.06)' }} /> ?, X, + jelölés</span>
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
                                                                return <td key={d} className={cls} onClick={() => editCell(emp.id, d)}>{val ?? ''}</td>;
                                                            })}
                                                            <td className="cell-num">{total}</td>
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
                                    <button className="btn small" onClick={addArea}>+ Új</button>
                                    <button className="btn small danger" onClick={delArea}>Törlés</button>
                                </div>
                            </div>
                            <div className="card">
                                <h2>Dolgozók <span className="n">({felvitelEmps.length})</span></h2>
                                <div className="row">
                                    <input type="text" placeholder="Új dolgozó neve" style={{ flex: 1 }} value={newEmpName}
                                        onChange={e => setNewEmpName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addEmployee(); }} />
                                </div>
                                <div className="row" style={{ marginTop: 6 }}>
                                    <select style={{ flex: 1 }} value={newEmpUserId} onChange={e => setNewEmpUserId(e.target.value)}>
                                        <option value="">— nincs fiók-kötés —</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    <button className="btn small primary" onClick={addEmployee}>Hozzáad</button>
                                </div>
                                <div className="emplist">
                                    {felvitelEmps.length === 0 && <div className="none">Még nincs dolgozó ezen a területen.</div>}
                                    {felvitelEmps.map(emp => (
                                        <div key={emp.id} className="emprow">
                                            <span>{emp.name}{emp.user_id ? <span style={{ color: 'var(--ink-dim)', fontSize: 11 }}> · fiók</span> : null}</span>
                                            <button title="Törlés" onClick={() => delEmployee(emp)}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PÓTLÁS ── */}
            {currentView === 'potlas' && (
                <div className="view active">
                    <div className="layout">
                        <div className="col-main">
                            <div className="card">
                                <h2>Beosztás <span className="n">({HU_MONTHS[month - 1]} {year})</span></h2>
                                <div className="legend">
                                    <span><i className="sw" style={{ background: 'rgba(217,82,74,.4)' }} /> hétvége</span>
                                    <span><i className="sw" style={{ background: 'var(--amber)' }} /> 24 órás szolgálat</span>
                                    <span><i className="sw" style={{ background: 'rgba(79,142,247,.5)' }} /> éjszakai 12h túlóra</span>
                                    <span><i className="sw" style={{ background: 'rgba(224,90,78,.5)' }} /> nappali 12h túlóra</span>
                                    <span><i className="sw" style={{ background: 'rgba(76,175,125,.5)' }} /> teljesen pótolva</span>
                                    <span><i className="sw cell-covered-partial" style={{ width: 12, height: 12 }} /> részben pótolva</span>
                                </div>
                                <div className="tabs">
                                    {areas.map((a, idx) => (
                                        <div key={a.id} className={`tab2 ${idx === currentAreaTab ? 'active' : ''}`}
                                            onClick={() => { setCurrentAreaTab(idx); setSelection(null); }}>{a.name}</div>
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
                            <div className="card side">
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
                                                            <div className="who"><span>{c.name}</span><span className="ar">{c.area}</span></div>
                                                            <button className="btn small" onClick={() => assignCover(c, 'night')}>Kijelöl</button>
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
                                                            <div className="who"><span>{c.name}</span><span className="ar">{c.area}</span></div>
                                                            <button className="btn small" onClick={() => assignCover(c, 'day')}>Kijelöl</button>
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
                </div>
            )}
        </div>
    );
}

const CSS = `
.vez-app{ --bg:#14181f; --panel:#1c222c; --panel2:#232a36; --line:#2e3646; --ink:#e8ecf1; --ink-dim:#8b95a7; --amber:#d99a3f; --night:#4f8ef7; --day:#e05a4e; --ok:#4caf7d; --weekend:#d9524a;
  font-family:"IBM Plex Sans","Segoe UI",Arial,sans-serif; min-height:100vh; background:var(--bg); color:var(--ink); }
.vez-app *{ box-sizing:border-box; }
.vez-app .topbar{ padding:14px 22px; border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; background:linear-gradient(180deg,#171c24,#14181f); }
.vez-app .topbar h1{ font-size:19px; margin:0; font-weight:700; }
.vez-app .topbar h1 span{ color:var(--amber); }
.vez-app .row{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.vez-app .btn{ background:var(--panel2); border:1px solid var(--line); color:var(--ink); padding:8px 13px; border-radius:7px; cursor:pointer; font-size:12.5px; display:inline-flex; align-items:center; text-decoration:none; }
.vez-app .btn:hover{ border-color:var(--amber); }
.vez-app .btn.primary{ background:var(--amber); color:#1b1305; border-color:var(--amber); font-weight:600; }
.vez-app .btn.danger:hover{ border-color:var(--weekend); color:var(--weekend); }
.vez-app .btn.small{ padding:4px 9px; font-size:11.5px; }
.vez-app .btn.disabled{ opacity:.5; cursor:not-allowed; pointer-events:none; }
.vez-app input[type=file]{ display:none; }
.vez-app select, .vez-app input[type=number], .vez-app input[type=text]{ background:var(--panel2); border:1px solid var(--line); color:var(--ink); padding:7px 9px; border-radius:7px; font-size:12.5px; }
.vez-app .menu{ display:flex; gap:6px; padding:12px 22px 0; }
.vez-app .menu .tab{ padding:9px 16px; border-radius:8px 8px 0 0; border:1px solid var(--line); border-bottom:none; cursor:pointer; font-size:13px; color:var(--ink-dim); background:var(--panel2); }
.vez-app .menu .tab.active{ color:#141a24; background:var(--amber); border-color:var(--amber); font-weight:700; }
.vez-app .view{ padding:16px 22px 40px; }
.vez-app .layout{ display:grid; grid-template-columns:1fr 340px; gap:16px; align-items:start; }
@media (max-width:980px){ .vez-app .layout{ grid-template-columns:1fr; } }
.vez-app .card{ background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:16px; }
.vez-app .card + .card{ margin-top:16px; }
.vez-app .card h2{ font-size:14px; margin:0 0 10px; }
.vez-app .card h2 .n{ color:var(--ink-dim); font-weight:400; }
.vez-app .hint{ font-size:11.5px; color:var(--ink-dim); margin-top:8px; line-height:1.5; }
.vez-app .none{ color:var(--ink-dim); font-size:12.5px; font-style:italic; }
.vez-app .status{ font-size:11.5px; color:var(--ink-dim); margin-top:4px; }
.vez-app table.grid{ border-collapse:collapse; width:100%; font-size:11.5px; }
.vez-app table.grid th, .vez-app table.grid td{ border:1px solid var(--line); padding:0; text-align:center; min-width:26px; height:26px; }
.vez-app table.grid th{ color:var(--ink-dim); font-weight:500; background:var(--panel2); position:sticky; top:0; }
.vez-app table.grid th.weekend, .vez-app table.grid td.weekend-col{ background:rgba(217,82,74,.18); }
.vez-app table.grid th.weekend{ color:var(--weekend); }
.vez-app table.grid td.name, .vez-app table.grid th.name{ text-align:left; padding-left:8px; min-width:150px; position:sticky; left:0; background:var(--panel); z-index:2; white-space:nowrap; }
.vez-app table.grid th.name{ background:var(--panel2); z-index:3; }
.vez-app .gridwrap{ overflow:auto; max-height:560px; border-radius:8px; }
.vez-app .cell-empty{ cursor:pointer; }
.vez-app .cell-empty:hover{ outline:2px dashed #ffffff33; outline-offset:-2px; }
.vez-app .cell-work{ background:var(--amber); color:#1b1305; font-weight:700; cursor:pointer; }
.vez-app .cell-work:hover{ outline:2px solid #fff5; outline-offset:-2px; }
.vez-app .cell-work.removed{ background:transparent; color:var(--day); text-decoration:line-through; border:1px dashed var(--day); }
.vez-app td.selected{ outline:2px solid #fff; outline-offset:-2px; }
.vez-app .cell-ot-night{ background:rgba(79,142,247,.25); color:var(--night); font-weight:600; }
.vez-app .cell-ot-day{ background:rgba(224,90,78,.25); color:var(--day); font-weight:600; }
.vez-app .cell-covered{ background:rgba(76,175,125,.35); color:var(--ok); font-weight:700; cursor:pointer; }
.vez-app .cell-covered-partial{ background:linear-gradient(135deg,rgba(76,175,125,.35) 50%,rgba(217,154,63,.25) 50%); color:var(--ink); font-weight:700; cursor:pointer; }
.vez-app .cell-num{ background:rgba(255,255,255,.06); color:var(--ink-dim); font-weight:600; cursor:pointer; }
.vez-app .cell-sym{ background:rgba(255,255,255,.04); font-weight:700; cursor:pointer; }
.vez-app .cell-sym.x{ color:var(--weekend); }
.vez-app .cell-sym.q{ color:var(--amber); }
.vez-app .cell-sym.plus{ color:var(--night); }
.vez-app .legend{ display:flex; gap:14px; flex-wrap:wrap; font-size:11.5px; color:var(--ink-dim); margin-bottom:10px; }
.vez-app .legend span{ display:inline-flex; align-items:center; gap:5px; }
.vez-app .sw{ width:12px; height:12px; border-radius:3px; display:inline-block; }
.vez-app .tabs{ display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; }
.vez-app .tab2{ padding:7px 12px; border-radius:7px; border:1px solid var(--line); cursor:pointer; font-size:12.5px; color:var(--ink-dim); background:var(--panel2); }
.vez-app .tab2.active{ color:#141a24; background:var(--amber); border-color:var(--amber); font-weight:600; }
.vez-app .cand-group{ margin-bottom:14px; }
.vez-app .cand-group h3{ font-size:12px; margin:0 0 6px; text-transform:uppercase; letter-spacing:.5px; }
.vez-app .cand-group.night h3{ color:var(--night); }
.vez-app .cand-group.day h3{ color:var(--day); }
.vez-app .cand{ display:flex; align-items:center; justify-content:space-between; gap:8px; background:var(--panel2); border:1px solid var(--line); border-radius:7px; padding:7px 9px; margin-bottom:6px; font-size:12.5px; }
.vez-app .cand .who{ display:flex; flex-direction:column; }
.vez-app .cand .who .ar{ color:var(--ink-dim); font-size:11px; }
.vez-app .absence-info{ background:var(--panel2); border:1px solid var(--line); border-radius:8px; padding:10px 12px; margin-bottom:12px; font-size:13px; }
.vez-app .absence-info b{ color:var(--amber); }
.vez-app .slot-status{ display:flex; gap:8px; margin-bottom:12px; }
.vez-app .slot-pill{ flex:1; border-radius:7px; padding:8px 10px; font-size:12px; border:1px solid var(--line); background:var(--panel2); }
.vez-app .slot-pill.done{ border-color:var(--ok); color:var(--ok); }
.vez-app .slot-pill .rv{ background:none; border:none; color:var(--ink-dim); cursor:pointer; font-size:11px; text-decoration:underline; padding:0; margin-top:4px; }
.vez-app .log{ display:flex; flex-direction:column; gap:6px; max-height:320px; overflow:auto; }
.vez-app .logrow{ font-size:12px; background:var(--panel2); border:1px solid var(--line); border-radius:6px; padding:6px 9px; }
.vez-app .logrow .d{ color:var(--ink-dim); }
.vez-app .emplist{ display:flex; flex-direction:column; gap:6px; margin-top:8px; }
.vez-app .emprow{ display:flex; align-items:center; justify-content:space-between; background:var(--panel2); border:1px solid var(--line); border-radius:7px; padding:6px 9px; font-size:12.5px; }
.vez-app .emprow button{ background:none; border:none; color:var(--ink-dim); cursor:pointer; }
.vez-app .emprow button:hover{ color:var(--weekend); }
.vez-app .vez-toast{ position:fixed; top:16px; right:16px; z-index:999; padding:10px 16px; border-radius:10px; font-size:13px; font-weight:600; box-shadow:0 8px 24px rgba(0,0,0,.4); }
.vez-app .vez-toast.ok{ background:#153b2b; color:#7ee0a8; border:1px solid #2f6b4c; }
.vez-app .vez-toast.err{ background:#3b1717; color:#f0a0a0; border:1px solid #6b2f2f; }
`;
