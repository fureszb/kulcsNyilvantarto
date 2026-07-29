import { useMemo, useState } from 'react';
import DirectorLayout from '../../Layouts/DirectorLayout';

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

interface Item {
    id: number;
    name: string;
    type: string;
    group_id: number | null;
    sort_order: number;
    is_active: boolean;
}

interface ItemGroup {
    id: number;
    name: string;
    items: Item[];
}

interface LocationData {
    id: number;
    name: string;
    groups: ItemGroup[];
    items: Item[];
}

interface Props {
    locations: LocationData[];
}

function ItemRow({ item }: { item: Item }) {
    return (
        <div className="flex items-center gap-2 py-1.5">
            <span className="text-sm">{item.type === 'card' ? '💳' : '🔑'}</span>
            <span className="text-sm text-slate-700 truncate">{item.name}</span>
            {!item.is_active && <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">inaktív</span>}
        </div>
    );
}

function GroupCard({ group }: { group: ItemGroup }) {
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-slate-700 mb-2">{group.name}</h3>
            <div className="divide-y divide-slate-100">
                {group.items.length === 0 && <p className="text-xs text-slate-400 italic py-1">Nincs tétel ebben a csoportban.</p>}
                {group.items.map(item => <ItemRow key={item.id} item={item} />)}
            </div>
        </div>
    );
}

export default function DirectorInventory({ locations }: Props) {
    const [activeIdx, setActiveIdx] = useState(0);
    const loc = locations[Math.min(activeIdx, Math.max(0, locations.length - 1))];

    const ungroupedItems = useMemo(() => loc ? loc.items.filter(i => !i.group_id) : [], [loc]);

    return (
        <DirectorLayout title="Kulcsleltár">
            {/* Hero */}
            <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                <div className="relative z-10 px-8 py-8 flex items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Területi Igazgató Portál</p>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Kulcsleltár</h1>
                        <p className="text-slate-400 mt-1 text-sm">Kulcsok és belépőkártyák — {locations.length} irodaház (megtekintés)</p>
                    </div>
                    <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                        <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                    </div>
                </div>
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.038, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
            </div>

            {locations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                    <p className="text-slate-400">Nincs felvett irodaház.</p>
                </div>
            ) : (
                <>
                    <div className="flex gap-2 flex-wrap mb-5">
                        {locations.map((l, idx) => (
                            <button
                                key={l.id}
                                onClick={() => setActiveIdx(idx)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${idx === activeIdx ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {l.name}
                            </button>
                        ))}
                    </div>

                    {loc && (
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-4">{loc.name}</h2>

                            <div className="space-y-4">
                                {loc.groups.map(group => (
                                    <GroupCard key={group.id} group={group} />
                                ))}

                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                    <h3 className="text-sm font-bold text-slate-700 mb-2">Csoport nélküli tételek</h3>
                                    <div className="divide-y divide-slate-100">
                                        {ungroupedItems.length === 0 && <p className="text-xs text-slate-400 italic py-1">Nincs csoport nélküli tétel.</p>}
                                        {ungroupedItems.map(item => <ItemRow key={item.id} item={item} />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </DirectorLayout>
    );
}
