import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import SecurityLeadLayout from '../../Layouts/SecurityLeadLayout';

declare function route(name: string, params?: unknown): string;

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

const visitOpts = { preserveScroll: true, preserveState: true } as const;

function ItemRow({ locationId, item }: { locationId: number; item: Item }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(item.name);
    const [type, setType] = useState(item.type);

    function save() {
        router.put(route('security-lead.inventory.items.update', [locationId, item.id]), {
            name, type, sort_order: item.sort_order, group_id: item.group_id, is_active: true,
        }, { ...visitOpts, onSuccess: () => setEditing(false) });
    }

    function destroy() {
        if (!window.confirm(`Törlöd "${item.name}" tételt?`)) return;
        router.delete(route('security-lead.inventory.items.destroy', [locationId, item.id]), visitOpts);
    }

    if (editing) {
        return (
            <div className="flex items-center gap-2 py-1.5">
                <input value={name} onChange={e => setName(e.target.value)} className="flex-1 text-sm rounded-lg border border-slate-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                <select value={type} onChange={e => setType(e.target.value)} className="text-sm rounded-lg border border-slate-200 px-2 py-1">
                    <option value="key">Kulcs</option>
                    <option value="card">Kártya</option>
                </select>
                <button onClick={save} className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 cursor-pointer">Mentés</button>
                <button onClick={() => { setEditing(false); setName(item.name); setType(item.type); }} className="text-xs text-slate-400 hover:text-slate-600 px-1 cursor-pointer">Mégse</button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between gap-2 py-1.5 group">
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">{item.type === 'card' ? '💳' : '🔑'}</span>
                <span className="text-sm text-slate-700 truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => setEditing(true)} className="text-xs text-slate-400 hover:text-blue-600 px-1.5 py-0.5 cursor-pointer">Szerkeszt</button>
                <button onClick={destroy} className="text-xs text-slate-400 hover:text-red-600 px-1.5 py-0.5 cursor-pointer">Törlés</button>
            </div>
        </div>
    );
}

function AddItemForm({ locationId, groupId }: { locationId: number; groupId: number | null }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('key');

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        router.post(route('security-lead.inventory.items.store', locationId), {
            name: name.trim(), type, group_id: groupId, sort_order: 0,
        }, { ...visitOpts, onSuccess: () => { setName(''); setOpen(false); } });
    }

    if (!open) {
        return (
            <button onClick={() => setOpen(true)} className="text-xs font-medium text-blue-600 hover:text-blue-700 mt-1 cursor-pointer">+ Tétel hozzáadása</button>
        );
    }

    return (
        <form onSubmit={submit} className="flex items-center gap-2 mt-1.5">
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Kulcs / kártya neve" className="flex-1 text-sm rounded-lg border border-slate-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <select value={type} onChange={e => setType(e.target.value)} className="text-sm rounded-lg border border-slate-200 px-2 py-1">
                <option value="key">Kulcs</option>
                <option value="card">Kártya</option>
            </select>
            <button type="submit" className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 cursor-pointer">Hozzáad</button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 px-1 cursor-pointer">Mégse</button>
        </form>
    );
}

function AddGroupForm({ locationId }: { locationId: number }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        router.post(route('security-lead.inventory.groups.store', locationId), {
            name: name.trim(), sort_order: 0,
        }, { ...visitOpts, onSuccess: () => { setName(''); setOpen(false); } });
    }

    if (!open) {
        return (
            <button onClick={() => setOpen(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">+ Új csoport</button>
        );
    }

    return (
        <form onSubmit={submit} className="flex items-center gap-2">
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Csoport neve (pl. Földszint)" className="flex-1 text-sm rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <button type="submit" className="text-sm font-semibold text-blue-600 hover:text-blue-700 px-2 cursor-pointer">Hozzáad</button>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-400 hover:text-slate-600 px-1 cursor-pointer">Mégse</button>
        </form>
    );
}

function GroupCard({ locationId, group }: { locationId: number; group: ItemGroup }) {
    function destroy() {
        if (!window.confirm(`Törlöd a(z) "${group.name}" csoportot? A benne lévő tételek csoporton kívülre kerülnek.`)) return;
        router.delete(route('security-lead.inventory.groups.destroy', [locationId, group.id]), visitOpts);
    }

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-700">{group.name}</h3>
                <button onClick={destroy} className="text-xs text-slate-400 hover:text-red-600 cursor-pointer">Csoport törlése</button>
            </div>
            <div className="divide-y divide-slate-100">
                {group.items.length === 0 && <p className="text-xs text-slate-400 italic py-1">Nincs tétel ebben a csoportban.</p>}
                {group.items.map(item => <ItemRow key={item.id} locationId={locationId} item={item} />)}
            </div>
            <AddItemForm locationId={locationId} groupId={group.id} />
        </div>
    );
}

export default function SecurityLeadInventory({ locations }: Props) {
    const [activeIdx, setActiveIdx] = useState(0);
    const loc = locations[Math.min(activeIdx, Math.max(0, locations.length - 1))];

    const ungroupedItems = useMemo(() => loc ? loc.items.filter(i => !i.group_id) : [], [loc]);

    return (
        <SecurityLeadLayout title="Leltár">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-800">Leltár</h1>
                <p className="text-sm text-slate-500 mt-1">Kulcsok és belépőkártyák a saját irodaházaidban.</p>
            </div>

            {locations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                    <p className="text-slate-400">Nincs hozzád rendelt irodaház.</p>
                </div>
            ) : (
                <>
                    <div className="flex gap-2 flex-wrap mb-5">
                        {locations.map((l, idx) => (
                            <button
                                key={l.id}
                                onClick={() => setActiveIdx(idx)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${idx === activeIdx ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {l.name}
                            </button>
                        ))}
                    </div>

                    {loc && (
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-bold text-slate-800">{loc.name}</h2>
                                <AddGroupForm locationId={loc.id} />
                            </div>

                            <div className="space-y-4">
                                {loc.groups.map(group => (
                                    <GroupCard key={group.id} locationId={loc.id} group={group} />
                                ))}

                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                    <h3 className="text-sm font-bold text-slate-700 mb-2">Csoport nélküli tételek</h3>
                                    <div className="divide-y divide-slate-100">
                                        {ungroupedItems.length === 0 && <p className="text-xs text-slate-400 italic py-1">Nincs csoport nélküli tétel.</p>}
                                        {ungroupedItems.map(item => <ItemRow key={item.id} locationId={loc.id} item={item} />)}
                                    </div>
                                    <AddItemForm locationId={loc.id} groupId={null} />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </SecurityLeadLayout>
    );
}
