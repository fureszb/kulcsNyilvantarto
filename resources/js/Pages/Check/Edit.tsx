import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import type { Check, CheckItem } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    check: Check;
    groupedCheckItems: Record<string, CheckItem[]>;
    ungroupedCheckItems: CheckItem[];
}

interface EditFormData {
    items: Record<number, boolean>;
    extra_email: string;
    notes: string;
    [key: string]: unknown;
}

function buildInitialItems(
    grouped: Record<string, CheckItem[]>,
    ungrouped: CheckItem[]
): Record<number, boolean> {
    const result: Record<number, boolean> = {};
    for (const items of Object.values(grouped)) {
        for (const ci of items) {
            result[ci.item_id] = ci.is_checked;
        }
    }
    for (const ci of ungrouped) {
        result[ci.item_id] = ci.is_checked;
    }
    return result;
}

export default function CheckEdit({ check, groupedCheckItems, ungroupedCheckItems }: Props) {
    const { data, setData, put, processing, errors } = useForm<EditFormData>({
        items: buildInitialItems(groupedCheckItems, ungroupedCheckItems),
        extra_email: check.extra_email ?? '',
        notes: check.notes ?? '',
    });

    function toggleItem(itemId: number, checked: boolean) {
        setData('items', { ...data.items, [itemId]: checked });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('checks.update', check.id));
    }

    return (
        <AppLayout title="Ellenőrzés szerkesztése">
            <div className="max-w-5xl mx-auto">

                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-orange-800/10 rounded-full blur-3xl pointer-events-none" />
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
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Ellenőrzés szerkesztése</p>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">{check.location?.name ?? 'Helyszín'}</h1>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {new Date(check.created_at).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} – {new Date(check.created_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Ellenőrizte: <strong className="text-slate-300 ml-0.5">{check.checked_by}</strong>
                                </span>
                            </div>
                        </div>
                        <a
                            href={route('checks.show', check.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Vissza
                        </a>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Bal: tételek */}
                        <div className="lg:col-span-2 space-y-4">

                            {/* Csoportos tételek */}
                            {Object.entries(groupedCheckItems).map(([groupName, items]) => {
                                if (items.length === 0) return null;
                                return (
                                    <div key={groupName} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-sm">{groupName}</h3>
                                            <span className="ml-auto text-xs text-slate-400">{items.length} tétel</span>
                                        </div>
                                        <ul className="divide-y divide-slate-50">
                                            {items.map((ci) => {
                                                const isChecked = data.items[ci.item_id] === true;
                                                return (
                                                    <li
                                                        key={ci.id}
                                                        onClick={() => toggleItem(ci.item_id, !isChecked)}
                                                        className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors ${isChecked ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
                                                    >
                                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                                                            {isChecked && (
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ci.item.type === 'card' ? 'bg-purple-50 border border-purple-100' : 'bg-blue-50 border border-blue-100'}`}>
                                                            {ci.item.type === 'card' ? (
                                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-semibold text-slate-800 truncate ${isChecked ? '' : 'opacity-50'}`}>{ci.item.name}</p>
                                                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${ci.item.type === 'card' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                                {ci.item.type === 'card' ? 'Kártya' : 'Kulcs'}
                                                            </span>
                                                        </div>
                                                        <span className={`text-xs font-semibold shrink-0 transition-colors ${isChecked ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                            {isChecked ? 'Megvan' : 'Hiányzik'}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                );
                            })}

                            {/* Csoport nélküli tételek */}
                            {ungroupedCheckItems.length > 0 && (
                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                            </svg>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-sm">Egyéb tételek</h3>
                                        <span className="ml-auto text-xs text-slate-400">{ungroupedCheckItems.length} tétel</span>
                                    </div>
                                    <ul className="divide-y divide-slate-50">
                                        {ungroupedCheckItems.map((ci) => {
                                            const isChecked = data.items[ci.item_id] === true;
                                            return (
                                                <li
                                                    key={ci.id}
                                                    onClick={() => toggleItem(ci.item_id, !isChecked)}
                                                    className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors ${isChecked ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
                                                >
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                                                        {isChecked && (
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ci.item.type === 'card' ? 'bg-purple-50 border border-purple-100' : 'bg-blue-50 border border-blue-100'}`}>
                                                        {ci.item.type === 'card' ? (
                                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-semibold text-slate-800 truncate ${isChecked ? '' : 'opacity-50'}`}>{ci.item.name}</p>
                                                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${ci.item.type === 'card' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                            {ci.item.type === 'card' ? 'Kártya' : 'Kulcs'}
                                                        </span>
                                                    </div>
                                                    <span className={`text-xs font-semibold shrink-0 transition-colors ${isChecked ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                        {isChecked ? 'Megvan' : 'Hiányzik'}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                        </div>

                        {/* Jobb: sidebar */}
                        <div className="space-y-4">

                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Extra értesítő email
                                </h3>
                                <input
                                    type="email"
                                    value={data.extra_email}
                                    onChange={(e) => setData('extra_email', e.target.value)}
                                    placeholder="email@ceg.hu"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none transition"
                                />
                                {errors.extra_email && <p className="text-xs text-rose-500 mt-1">{errors.extra_email}</p>}
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    Megjegyzés
                                </h3>
                                <textarea
                                    rows={4}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Opcionális megjegyzés..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none transition resize-none leading-relaxed"
                                />
                                {errors.notes && <p className="text-xs text-rose-500 mt-1">{errors.notes}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-65 disabled:cursor-wait"
                            >
                                {processing ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Mentés...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        Mentés
                                    </>
                                )}
                            </button>

                            <a
                                href={route('checks.show', check.id)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-sm transition-colors"
                            >
                                Mégse
                            </a>

                        </div>
                    </div>
                </form>

            </div>
        </AppLayout>
    );
}
