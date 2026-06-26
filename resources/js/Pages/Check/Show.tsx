import { useState, useMemo } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import type { Location, ItemGroup, Item } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    location: Location;
    groups: ItemGroup[];
    ungroupedItems: Item[];
}

interface CheckFormData {
    items: Record<number, boolean>;
    extra_email: string;
    notes: string;
    [key: string]: unknown;
}

export default function CheckShow({ location, groups, ungroupedItems }: Props) {
    const { data, setData, post, processing } = useForm<CheckFormData>({
        items: {},
        extra_email: '',
        notes: '',
    });

    const [groupOpen, setGroupOpen] = useState<Record<number, boolean>>({});

    const allItems = useMemo(
        () => [...groups.flatMap(g => g.items ?? []), ...ungroupedItems],
        [groups, ungroupedItems],
    );
    const total = allItems.length;
    const checkedCount = Object.values(data.items).filter(Boolean).length;
    const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
    const done = checkedCount === total && total > 0;

    const nowStr = useMemo(() => {
        const d = new Date();
        return (
            `${d.getFullYear()}.` +
            `${String(d.getMonth() + 1).padStart(2, '0')}.` +
            `${String(d.getDate()).padStart(2, '0')} ` +
            `${String(d.getHours()).padStart(2, '0')}:` +
            `${String(d.getMinutes()).padStart(2, '0')}`
        );
    }, []);

    function toggleItem(id: number) {
        setData('items', { ...data.items, [id]: !data.items[id] });
    }

    function toggleGroup(ids: number[]) {
        const allChecked = ids.every(id => data.items[id] === true);
        const next = { ...data.items };
        ids.forEach(id => { next[id] = !allChecked; });
        setData('items', next);
    }

    function groupAllChecked(ids: number[]) {
        return ids.length > 0 && ids.every(id => data.items[id] === true);
    }

    function groupSomeChecked(ids: number[]) {
        return ids.some(id => data.items[id] === true) && !ids.every(id => data.items[id] === true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('check.store', location.id));
    }

    const hasItems = groups.some(g => (g.items?.length ?? 0) > 0) || ungroupedItems.length > 0;

    return (
        <AppLayout title={`Ellenőrzés – ${location.name}`}>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                <Link href={route('keys.index')} className="hover:text-blue-700 transition-colors">
                    Helyszínek
                </Link>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
                <span className="text-slate-700 font-semibold">{location.name}</span>
            </nav>

            {/* Header */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{location.name}</h1>
                    {location.responsible_person && (
                        <p className="text-slate-500 mt-0.5 text-sm">
                            Felelős: <strong className="text-slate-700">{location.responsible_person}</strong>
                        </p>
                    )}
                </div>
                <span className="text-xs font-medium text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap">
                    {nowStr}
                </span>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: items */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Progress card */}
                        {hasItems && (
                            <div
                                className="bg-white rounded-2xl border-2 p-5 transition-colors duration-300"
                                style={{ borderColor: done ? '#86efac' : '#e2e8f0' }}
                            >
                                <div className="flex items-center justify-between mb-2.5">
                                    <span
                                        className="text-sm transition-colors duration-300"
                                        style={{
                                            color: done ? '#15803d' : '#475569',
                                            fontWeight: done ? '700' : '600',
                                        }}
                                    >
                                        {done ? 'Minden tétel ellenőrizve!' : 'Ellenőrzés folyamatban...'}
                                    </span>
                                    <span
                                        className="text-sm font-bold transition-colors duration-300"
                                        style={{ color: done ? '#15803d' : '#1d4ed8' }}
                                    >
                                        {pct}%
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{
                                            width: `${pct}%`,
                                            backgroundColor: done ? '#22c55e' : '#2563eb',
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    {checkedCount} / {total} tétel megvolt
                                </p>
                            </div>
                        )}

                        {/* Items card */}
                        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="font-bold text-slate-700">Kulcsok és kártyák</h2>
                                <span className="text-xs text-slate-400 font-medium">{total} tétel</span>
                            </div>

                            {!hasItems ? (
                                <div className="p-10 text-center text-slate-400 text-sm">
                                    Ehhez a helyszínhez még nincs tétel felvéve.
                                </div>
                            ) : (
                                <div>
                                    {/* Groups */}
                                    {groups.map(group => {
                                        const groupItems = group.items ?? [];
                                        const groupIds = groupItems.map(i => i.id);
                                        if (groupIds.length === 0) return null;

                                        const isOpen = groupOpen[group.id] ?? false;
                                        const allG = groupAllChecked(groupIds);
                                        const someG = groupSomeChecked(groupIds);

                                        return (
                                            <div key={group.id} className="border-b border-slate-100 last:border-0">
                                                {/* Group header */}
                                                <div
                                                    className="flex items-center gap-3 px-6 py-3 bg-slate-50 cursor-pointer select-none"
                                                    onClick={() => setGroupOpen(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                                                >
                                                    {/* Select-all checkbox */}
                                                    <div
                                                        className="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer"
                                                        style={{
                                                            backgroundColor: allG ? '#2563eb' : someG ? '#bfdbfe' : '#fff',
                                                            borderColor: allG ? '#2563eb' : someG ? '#60a5fa' : '#cbd5e1',
                                                        }}
                                                        onClick={e => { e.stopPropagation(); toggleGroup(groupIds); }}
                                                    >
                                                        {allG && (
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                                            </svg>
                                                        )}
                                                        {someG && !allG && (
                                                            <svg className="w-3 h-3" fill="none" stroke="#3b82f6" strokeWidth="3" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"/>
                                                            </svg>
                                                        )}
                                                    </div>

                                                    <span className="font-semibold text-slate-700 flex-1 text-sm">{group.name}</span>
                                                    <span className="text-xs text-slate-400 font-medium">{groupIds.length} tétel</span>
                                                    <svg
                                                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                                    </svg>
                                                </div>

                                                {/* Group items */}
                                                {isOpen && (
                                                    <div>
                                                        {groupItems.map(item => (
                                                            <CheckItemRow
                                                                key={item.id}
                                                                item={item}
                                                                checked={data.items[item.id] === true}
                                                                onToggle={() => toggleItem(item.id)}
                                                                indented
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Ungrouped items */}
                                    {ungroupedItems.map(item => (
                                        <CheckItemRow
                                            key={item.id}
                                            item={item}
                                            checked={data.items[item.id] === true}
                                            onToggle={() => toggleItem(item.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-4">

                        {/* Email */}
                        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                Extra értesítés
                            </h3>
                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block" htmlFor="extra_email">
                                Email <span className="text-slate-400 font-normal">(opcionális)</span>
                            </label>
                            <input
                                type="email"
                                id="extra_email"
                                value={data.extra_email}
                                onChange={e => setData('extra_email', e.target.value)}
                                className="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none transition"
                                placeholder="email@ceg.hu"
                            />
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">A felelős automatikusan kap értesítést.</p>
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                                </svg>
                                Megjegyzés
                            </h3>
                            <textarea
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none transition resize-none leading-relaxed"
                                placeholder="Opcionális megjegyzés..."
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-base text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300"
                            style={{
                                backgroundColor: done ? '#16a34a' : '#1e3a5f',
                                opacity: processing ? 0.65 : 1,
                                cursor: processing ? 'wait' : 'pointer',
                                focusRingColor: '#2563eb',
                            }}
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    Küldés...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    Befejezés &amp; Küldés
                                </span>
                            )}
                        </button>

                        <Link
                            href={route('keys.show', location.id)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
                        >
                            ← Vissza
                        </Link>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}

interface CheckItemRowProps {
    item: Item;
    checked: boolean;
    onToggle: () => void;
    indented?: boolean;
}

function CheckItemRow({ item, checked, onToggle, indented = false }: CheckItemRowProps) {
    const isCard = item.type === 'card';

    return (
        <div
            onClick={onToggle}
            className={`flex items-center gap-3 py-4 cursor-pointer border-b border-slate-50 last:border-0 transition-colors duration-150 ${
                indented ? 'px-3' : 'px-6'
            } ${checked ? 'bg-green-50' : 'hover:bg-slate-50'}`}
        >
            {/* Custom checkbox */}
            <div
                className="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                style={{
                    backgroundColor: checked ? '#2563eb' : '#fff',
                    borderColor: checked ? '#2563eb' : '#cbd5e1',
                }}
            >
                {checked && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                )}
            </div>

            <div className="flex-1 flex items-center gap-3">
                {/* Type icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isCard ? 'bg-purple-50 border border-purple-100' : 'bg-blue-50 border border-blue-100'
                }`}>
                    {isCard ? (
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                        </svg>
                    )}
                </div>
                <div>
                    <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
                    <span className={`inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                        isCard ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                        {isCard ? 'Kártya' : 'Kulcs'}
                    </span>
                </div>
            </div>

            {/* Status icon */}
            <div className="shrink-0">
                {checked ? (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                ) : (
                    <svg className="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" strokeWidth="1.5"/>
                    </svg>
                )}
            </div>
        </div>
    );
}
