import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import DirectorLayout from '../../Layouts/DirectorLayout';
import ModuleCardGrid, { type ModuleCardDef } from '../../Components/ModuleCardGrid';
import { DashboardHero } from '../../Components/ui/DashboardHero';
import { Card } from '../../Components/ui/Card';

declare function route(name: string, params?: unknown): string;

function buildModules(): ModuleCardDef[] {
    return [
        {
            href: route('vezenyles.index'),
            title: 'Vezénylés',
            description: 'Havi beosztás rögzítése és a 24 órás szolgálatok pótlásának tervezése.',
            iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            accent: 'indigo',
            features: ['Havi beosztás-tábla', 'Túlóra-pótlás tervezés', 'Változásnapló'],
            actionLabel: 'Vezénylés megnyitása',
        },
        {
            href: route('director.monthly-report'),
            title: 'Havi riport',
            description: 'A vezetők és irodaházak havi teljesítmény-trendjének áttekintése.',
            iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            accent: 'blue',
            features: ['Havi trend elemzés', 'Vezetőnkénti bontás', 'Historikus adatok'],
            actionLabel: 'Riport megtekintése',
        },
        {
            href: route('pm.messages'),
            title: 'Üzenetek',
            description: 'Üzenetküldés a biztonsági vezetőknek, és a beérkezett válaszok.',
            iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
            accent: 'orange',
            features: ['Üzenet küldése a vezetőknek', 'Beérkezett válaszok', 'Szűrés dátum/címzett szerint'],
            actionLabel: 'Üzenetek megnyitása',
        },
        {
            href: route('documents.index'),
            title: 'Dokumentumok',
            description: 'Jegyzőkönyvek és nyilvántartások digitálisan kitöltve, aláírással és PDF-generálással.',
            iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            accent: 'orange',
            features: ['10 jegyzőkönyv-típus', 'Digitális aláírás', 'Letölthető PDF'],
            actionLabel: 'Dokumentumok megnyitása',
        },
        {
            href: route('security.index'),
            title: 'Napi Jelentések',
            description: 'A biztonsági szolgálat digitálisan kitöltött napi jelentéseinek áttekintése.',
            iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            accent: 'rose',
            features: ['Napi biztonsági jelentések', 'Jelentés-előzmények', 'Szűrés dátum szerint'],
            actionLabel: 'Jelentések megnyitása',
        },
        {
            href: route('director.inventory'),
            title: 'Kulcsleltár',
            description: 'Az irodaházak kulcs- és belépőkártya-leltárának megtekintése.',
            iconPath: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
            accent: 'teal',
            features: ['Irodaházankénti bontás', 'Csoportosított tételek', 'Csak megtekintés'],
            actionLabel: 'Leltár megtekintése',
        },
        {
            href: route('presence.index'),
            title: 'Ki van bent',
            description: 'Élő lista arról, hogy jelenleg kik tartózkodnak a felügyelt irodaházakban.',
            iconPath: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6-4a3 3 0 11-6 0 3 3 0 016 0z',
            accent: 'blue',
            features: ['Valós idejű frissítés', 'NFC-alapú azonosítás', 'Telephelyenkénti bontás'],
            actionLabel: 'Megtekintés',
        },
        {
            href: route('nfc-log.index'),
            title: 'NFC napló',
            description: 'Be-/kilépések és elutasított próbálkozások szűrhető naplója.',
            iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-4 8h4m-4 4h4m-6-4h.01M9 16h.01',
            accent: 'amber',
            features: ['Szűrés felhasználó szerint', 'Szűrés telephely szerint', 'Dátum-tartomány'],
            actionLabel: 'Napló megnyitása',
        },
    ];
}

interface Goal {
    target_completion_pct: number;
    target_turnover_pct: number;
}

interface LocationStat {
    location_id: number;
    location_name: string;
    completion_pct: number;
    turnover_pct: number;
    score: number;
    active_workers: number;
    left_this_month: number;
    expected_per_worker: number;
    goal: Goal | null;
}

interface Overall {
    completion_pct: number;
    turnover_pct: number;
    score: number;
    active_workers: number;
    left_this_month: number;
    location_count: number;
}

interface Lead {
    lead_id: number;
    lead_name: string;
    lead_email: string;
    locations: LocationStat[];
    overall: Overall;
    goal: Goal | null;
}

interface Props {
    welcomeName: string;
    leads: Lead[];
    currentPeriod: { year: number; month: number };
}

function scoreClasses(score: number): string {
    if (score >= 75) return 'bg-emerald-100 text-emerald-700';
    if (score >= 50) return 'bg-teal-100 text-teal-700';
    if (score >= 25) return 'bg-amber-100 text-amber-700';
    if (score >= 0) return 'bg-orange-100 text-orange-700';
    return 'bg-rose-100 text-rose-700';
}

function Bar({ label, value, tone, target }: { label: string; value: number; tone: string; target?: number }) {
    const width = Math.max(0, Math.min(100, value));
    const targetPos = target !== undefined ? Math.max(0, Math.min(100, target)) : undefined;
    return (
        <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
                <span>{label}</span>
                <span className="font-semibold tabular-nums text-slate-700">
                    {value}%
                    {target !== undefined && <span className="text-slate-400 font-normal"> / cél: {target}%</span>}
                </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
                {targetPos !== undefined && (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-slate-500/60" style={{ left: `${targetPos}%` }} />
                )}
            </div>
        </div>
    );
}

function GoalSection({ lead, currentPeriod }: { lead: Lead; currentPeriod: { year: number; month: number } }) {
    const [editing, setEditing] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        target_completion_pct: lead.goal?.target_completion_pct ?? 80,
        target_turnover_pct:   lead.goal?.target_turnover_pct ?? 5,
        year:  currentPeriod.year,
        month: currentPeriod.month,
    });

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        post(route('director.set-goal', lead.lead_id), {
            onSuccess: () => setEditing(false),
        });
    }

    if (!editing) {
        return (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {lead.goal ? (
                    <p className="text-[11px] text-slate-500">
                        Cél: <span className="font-semibold text-slate-700">{lead.goal.target_completion_pct}%</span> kész /
                        <span className="font-semibold text-slate-700"> {lead.goal.target_turnover_pct}%</span> fluktuáció
                    </p>
                ) : (
                    <p className="text-[11px] text-slate-400 italic">Nincs célkitűzés beállítva</p>
                )}
                <button
                    onClick={() => setEditing(true)}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    {lead.goal ? 'Módosít' : 'Beállít'}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-medium text-slate-600">Havi célkitűzés ({currentPeriod.year}. {currentPeriod.month}. hó)</p>
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-0.5">Kész arány cél (%)</label>
                    <input
                        type="number" min="0" max="100" step="0.5"
                        value={data.target_completion_pct}
                        onChange={e => setData('target_completion_pct', parseFloat(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-0.5">Fluktuáció cél (%)</label>
                    <input
                        type="number" min="0" max="100" step="0.5"
                        value={data.target_turnover_pct}
                        onChange={e => setData('target_turnover_pct', parseFloat(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>
            <div className="flex gap-2 pt-0.5">
                <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                    Mentés
                </button>
                <button
                    type="button"
                    onClick={() => { reset(); setEditing(false); }}
                    className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                    Mégse
                </button>
            </div>
        </form>
    );
}

function LocationGoalSection({ leadId, loc, currentPeriod }: { leadId: number; loc: LocationStat; currentPeriod: { year: number; month: number } }) {
    const [editing, setEditing] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        target_completion_pct: loc.goal?.target_completion_pct ?? 80,
        target_turnover_pct:   loc.goal?.target_turnover_pct ?? 5,
        year:  currentPeriod.year,
        month: currentPeriod.month,
        location_id: loc.location_id,
    });

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        post(route('director.set-goal', leadId), {
            onSuccess: () => setEditing(false),
        });
    }

    if (!editing) {
        return (
            <div className="flex items-center justify-between gap-2 mt-1.5">
                {loc.goal ? (
                    <p className="text-[10px] text-slate-400">
                        Irodaházi cél: <span className="font-semibold text-slate-600">{loc.goal.target_completion_pct}%</span>
                    </p>
                ) : (
                    <p className="text-[10px] text-slate-300 italic">Nincs irodaházi célkitűzés</p>
                )}
                <button
                    onClick={() => setEditing(true)}
                    className="shrink-0 text-[10px] font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                    {loc.goal ? 'Módosít' : 'Cél beállítása'}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="mt-1.5 space-y-1.5" onClick={e => e.stopPropagation()}>
            <div className="flex gap-2">
                <input
                    type="number" min="0" max="100" step="0.5"
                    value={data.target_completion_pct}
                    onChange={e => setData('target_completion_pct', parseFloat(e.target.value))}
                    placeholder="Kész %"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                    type="number" min="0" max="100" step="0.5"
                    value={data.target_turnover_pct}
                    onChange={e => setData('target_turnover_pct', parseFloat(e.target.value))}
                    placeholder="Fluktuáció %"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={processing} className="flex-1 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer">Mentés</button>
                <button type="button" onClick={() => { reset(); setEditing(false); }} className="flex-1 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">Mégse</button>
            </div>
        </form>
    );
}

export default function DirectorDashboard({ leads, currentPeriod }: Props) {
    const [openId, setOpenId] = useState<number | null>(null);
    const modules = buildModules();

    return (
        <DirectorLayout title="Vezérlőpult">
                <DashboardHero
                    eyebrow="Területi Igazgató Portál"
                    eyebrowColor="text-indigo-400"
                    title="Vezetők teljesítménye"
                    subtitle={`${currentPeriod.year}. ${currentPeriod.month}. hó · ${leads.length} vezető · kattints egy kártyára az irodaházankénti bontáshoz`}
                    iconPath="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />

                {leads.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-sm text-slate-500">
                            Még nincs hozzád rendelve biztonsági vezető.
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {leads.map(lead => {
                            const open = openId === lead.lead_id;
                            const o = lead.overall;
                            return (
                                <Card key={lead.lead_id}>
                                    <button
                                        onClick={() => setOpenId(open ? null : lead.lead_id)}
                                        className="w-full text-left p-5 hover:bg-slate-50/60 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                                                <span className="text-base font-bold text-indigo-700">{lead.lead_name.charAt(0)}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{lead.lead_name}</p>
                                                <p className="text-xs text-slate-400 truncate">{lead.lead_email}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    {o.location_count} irodaház · {o.active_workers} aktív dolgozó
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className={`inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-lg text-lg font-bold tabular-nums ${scoreClasses(o.score)}`}>
                                                    {o.score}
                                                </span>
                                                <p className="text-[10px] text-slate-400 mt-0.5">összpontszám</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            <Bar
                                                label="Készültség"
                                                value={o.completion_pct}
                                                tone="bg-gradient-to-r from-emerald-500 to-teal-500"
                                                target={lead.goal?.target_completion_pct}
                                            />
                                            <Bar
                                                label="Fluktuáció"
                                                value={o.turnover_pct}
                                                tone="bg-gradient-to-r from-orange-400 to-rose-500"
                                                target={lead.goal?.target_turnover_pct}
                                            />
                                        </div>

                                        <div className="flex items-center justify-center gap-1 mt-3 text-[11px] font-medium text-indigo-600">
                                            {open ? 'Bezárás' : 'Irodaházankénti bontás'}
                                            <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </div>
                                    </button>

                                    <div className="px-5 pb-4" onClick={e => e.stopPropagation()}>
                                        <GoalSection lead={lead} currentPeriod={currentPeriod} />
                                    </div>

                                    {open && (
                                        <div className="border-t border-slate-100 divide-y divide-slate-50">
                                            {lead.locations.length === 0 ? (
                                                <p className="px-5 py-4 text-xs text-slate-400">Nincs hozzárendelt irodaház.</p>
                                            ) : lead.locations.map(loc => (
                                                <div key={loc.location_id} className="px-5 py-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-4h.01M11 17h.01"/>
                                                            </svg>
                                                            <span className="text-sm font-medium text-slate-700 truncate">{loc.location_name}</span>
                                                        </div>
                                                        <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-md text-sm font-bold tabular-nums ${scoreClasses(loc.score)}`}>
                                                            {loc.score}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <Bar label="Készültség" value={loc.completion_pct} tone="bg-emerald-400" target={loc.goal?.target_completion_pct} />
                                                        <Bar label="Fluktuáció" value={loc.turnover_pct} tone="bg-rose-400" target={loc.goal?.target_turnover_pct} />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-1.5">
                                                        {loc.active_workers} aktív dolgozó
                                                        {loc.left_this_month > 0 && ` · ${loc.left_this_month} kilépő ebben a hónapban`}
                                                    </p>
                                                    <LocationGoalSection leadId={lead.lead_id} loc={loc} currentPeriod={currentPeriod} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Modulok */}
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 mt-8">Modulok</h2>
                <ModuleCardGrid modules={modules} gridKey="director-modules" />
        </DirectorLayout>
    );
}
