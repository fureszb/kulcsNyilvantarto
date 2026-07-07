import { useState } from 'react';
import { router } from '@inertiajs/react';
import SecurityLeadLayout from '../../Layouts/SecurityLeadLayout';

declare function route(name: string, params?: unknown): string;

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

interface TeamUser {
    id: number;
    name: string;
    role: string;
}

interface NamedOption {
    id: number;
    name: string;
}

interface Props {
    workerUsers: TeamUser[];
    pmUsers: TeamUser[];
    leadLocations: NamedOption[];
    availableWorkers: NamedOption[];
    availablePms: NamedOption[];
}

function AddPicker({
    options,
    locations,
    placeholder,
    onAdd,
    onCancel,
}: {
    options: NamedOption[];
    locations: NamedOption[];
    placeholder: string;
    onAdd: (userId: number, locationId: number) => void;
    onCancel: () => void;
}) {
    const [search, setSearch] = useState('');
    const [locationId, setLocationId] = useState<number>(locations[0]?.id ?? 0);

    const filtered = search.trim()
        ? options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
        : options;

    return (
        <div className="mt-2 border border-slate-200 rounded-xl bg-slate-50/60 p-3 space-y-2.5">
            {locations.length > 1 && (
                <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Irodaház</label>
                    <select
                        value={locationId}
                        onChange={e => setLocationId(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
                    >
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                </div>
            )}
            <input
                type="text"
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:outline-none"
            />
            <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                {filtered.length === 0 ? (
                    <p className="px-3 py-2.5 text-xs text-slate-400">Nincs találat.</p>
                ) : filtered.map(o => (
                    <button
                        key={o.id}
                        type="button"
                        onClick={() => onAdd(o.id, locationId)}
                        disabled={!locationId}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-slate-50 last:border-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {o.name}
                    </button>
                ))}
            </div>
            <button type="button" onClick={onCancel} className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
                Mégse
            </button>
        </div>
    );
}

export default function SecurityLeadTeam({ workerUsers, pmUsers, leadLocations, availableWorkers, availablePms }: Props) {
    const [addingWorker, setAddingWorker] = useState(false);
    const [addingPm, setAddingPm] = useState(false);

    const assignedWorkerIds = new Set(workerUsers.map(u => u.id));
    const assignedPmIds = new Set(pmUsers.map(u => u.id));
    const addableWorkers = availableWorkers.filter(o => !assignedWorkerIds.has(o.id));
    const addablePms = availablePms.filter(o => !assignedPmIds.has(o.id));

    function addWorker(userId: number, locationId: number) {
        router.post(route('security-lead.team.workers.store'), { user_id: userId, location_id: locationId }, {
            preserveScroll: true,
            onSuccess: () => setAddingWorker(false),
        });
    }

    function removeWorker(userId: number) {
        router.delete(route('security-lead.team.workers.destroy', userId), { preserveScroll: true });
    }

    function addPm(userId: number, locationId: number) {
        router.post(route('security-lead.team.pm.store'), { user_id: userId, location_id: locationId }, {
            preserveScroll: true,
            onSuccess: () => setAddingPm(false),
        });
    }

    function removePm(userId: number) {
        router.delete(route('security-lead.team.pm.destroy', userId), { preserveScroll: true });
    }

    return (
        <SecurityLeadLayout title="Csapat">
            {/* Hero */}
            <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                <div className="relative z-10 px-8 py-8 flex items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Biztonsági Vezető Portál</p>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Csapat</h1>
                        <p className="text-slate-400 mt-1 text-sm">Kapcsolattartás a saját dolgozóiddal és a PM-mel</p>
                    </div>
                    <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                        <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                </div>
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.038, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
            </div>

            {leadLocations.length === 0 ? (
                <div className="max-w-2xl bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                    Nincs hozzád rendelt irodaház, ezért egyelőre nem tudsz dolgozót vagy Property Managert hozzáadni a csapatodhoz. Kérd az adminisztrátort, hogy rendeljen hozzád irodaházat.
                </div>
            ) : (
                <div className="max-w-2xl space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Property Manager</p>
                            {!addingPm && addablePms.length > 0 && (
                                <button type="button" onClick={() => setAddingPm(true)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                                    + Hozzáadás
                                </button>
                            )}
                        </div>
                        {pmUsers.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Nincs Property Manager rendelve az irodaházaidhoz.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {pmUsers.map(u => (
                                    <span key={u.id} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-xs font-medium text-amber-700">
                                        {u.name}
                                        <button type="button" onClick={() => removePm(u.id)} title="Eltávolítás" className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-amber-200/60 transition-colors cursor-pointer">
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        {addingPm && (
                            <AddPicker
                                options={addablePms}
                                locations={leadLocations}
                                placeholder="Keresés Property Manager nevére…"
                                onAdd={addPm}
                                onCancel={() => setAddingPm(false)}
                            />
                        )}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Saját dolgozók ({workerUsers.length})</p>
                            {!addingWorker && addableWorkers.length > 0 && (
                                <button type="button" onClick={() => setAddingWorker(true)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                                    + Hozzáadás
                                </button>
                            )}
                        </div>
                        {workerUsers.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Nincs hozzád rendelt dolgozó.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {workerUsers.map(u => (
                                    <span key={u.id} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
                                        {u.name}
                                        <button type="button" onClick={() => removeWorker(u.id)} title="Eltávolítás" className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        {addingWorker && (
                            <AddPicker
                                options={addableWorkers}
                                locations={leadLocations}
                                placeholder="Keresés dolgozó nevére…"
                                onAdd={addWorker}
                                onCancel={() => setAddingWorker(false)}
                            />
                        )}
                    </div>
                </div>
            )}
        </SecurityLeadLayout>
    );
}
