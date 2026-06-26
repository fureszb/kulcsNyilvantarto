import { useState, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import PmLayout from '../../Layouts/PmLayout';
import type { Check, CheckItem, PageProps } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    check: Check;
    groupedCheckItems: Record<string, CheckItem[]>;
    ungroupedCheckItems: CheckItem[];
}

function slug(str: string): string {
    return str
        .toLowerCase()
        .replace(/[áàâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i')
        .replace(/[óöőòôõ]/g, 'o').replace(/[úüűùûũ]/g, 'u')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('hu-HU', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function CheckItemRow({ ci }: { ci: CheckItem }) {
    const isCard = ci.item?.type === 'card';
    return (
        <li className={`flex items-center gap-4 px-5 py-3.5 ${ci.is_checked ? 'bg-emerald-50/40' : 'bg-rose-50/30'}`}>
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                ci.is_checked ? 'bg-emerald-500 border-emerald-500' : 'border-rose-300 bg-white'
            }`}>
                {ci.is_checked && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                )}
            </div>
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
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${ci.is_checked ? 'text-slate-800' : 'text-rose-700'}`}>{ci.item?.name}</p>
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    isCard ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                }`}>
                    {isCard ? 'Kártya' : 'Kulcs'}
                </span>
            </div>
            <span className={`text-xs font-semibold shrink-0 ${ci.is_checked ? 'text-emerald-600' : 'text-rose-500'}`}>
                {ci.is_checked ? 'Megvan' : 'Hiányzik'}
            </span>
        </li>
    );
}

interface SectionProps {
    groupName: string;
    items: CheckItem[];
    groupId: string;
    open: boolean;
    onToggle: () => void;
    sectionRef: (el: HTMLDivElement | null) => void;
    isUngrouped?: boolean;
}

function GroupSection({ groupName, items, groupId, open, onToggle, sectionRef, isUngrouped }: SectionProps) {
    const gChecked = items.filter(ci => ci.is_checked).length;
    const gTotal   = items.length;
    const allOk    = gChecked === gTotal;

    return (
        <div id={groupId} ref={sectionRef} className={`bg-white border ${allOk ? 'border-slate-200' : 'border-rose-200'} rounded-2xl shadow-sm overflow-hidden`}>
            <button type="button" onClick={onToggle}
                className={`w-full px-5 py-3.5 border-b ${allOk ? 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/60' : 'border-rose-100 bg-rose-50/40 hover:bg-rose-50/70'} flex items-center gap-2.5 transition-colors cursor-pointer`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isUngrouped
                        ? (allOk ? 'bg-slate-100 border border-slate-200' : 'bg-rose-50 border border-rose-200')
                        : (allOk ? 'bg-blue-50 border border-blue-100' : 'bg-rose-50 border border-rose-200')
                }`}>
                    {isUngrouped ? (
                        <svg className={`w-3.5 h-3.5 ${allOk ? 'text-slate-500' : 'text-rose-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                        </svg>
                    ) : (
                        <svg className={`w-3.5 h-3.5 ${allOk ? 'text-blue-600' : 'text-rose-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                    )}
                </div>
                <h3 className={`font-bold ${allOk ? 'text-slate-800' : 'text-rose-800'} text-sm`}>{groupName}</h3>
                <span className={`ml-auto text-xs ${allOk ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-bold'}`}>
                    {gChecked}/{gTotal} kész
                </span>
                <svg className={`w-4 h-4 ${allOk ? 'text-slate-400' : 'text-rose-400'} transition-transform duration-200 shrink-0 ml-1 ${open ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            {open && (
                <ul className="divide-y divide-slate-50">
                    {items.map(ci => <CheckItemRow key={ci.id} ci={ci}/>)}
                </ul>
            )}
        </div>
    );
}

export default function CheckResult({ check, groupedCheckItems, ungroupedCheckItems }: Props) {
    const { auth, flash } = usePage<PageProps>().props;
    const isPm    = auth.user?.is_property_manager ?? false;
    const isAdmin = auth.user?.is_admin ?? false;
    const canEdit = isAdmin || (!isPm && auth.user?.id === check.user_id);
    const Layout  = isPm ? PmLayout : AppLayout;
    const locationId = check.location?.id ?? check.location_id;

    const allItems     = [...Object.values(groupedCheckItems).flat(), ...ungroupedCheckItems];
    const totalItems   = allItems.length;
    const checkedItems = allItems.filter(ci => ci.is_checked).length;
    const pct          = totalItems > 0 ? Math.round(checkedItems / totalItems * 100) : 0;
    const missingItems = allItems.filter(ci => !ci.is_checked);

    const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
        const s = new Set<string>();
        Object.entries(groupedCheckItems).forEach(([name, items]) => {
            if (items.some(ci => !ci.is_checked)) s.add('group-' + slug(name));
        });
        if (ungroupedCheckItems.some(ci => !ci.is_checked)) s.add('group-egyeb-tetelek');
        return s;
    });

    const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

    function openAndScroll(groupId: string) {
        setOpenGroups(prev => new Set([...prev, groupId]));
        setTimeout(() => {
            groupRefs.current[groupId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 160);
    }

    function toggleGroup(groupId: string) {
        setOpenGroups(prev => {
            const next = new Set(prev);
            next.has(groupId) ? next.delete(groupId) : next.add(groupId);
            return next;
        });
    }

    function getMissingGroupId(ci: CheckItem): string {
        return ci.item?.group ? 'group-' + slug(ci.item.group.name) : 'group-egyeb-tetelek';
    }

    const hasGroups = Object.keys(groupedCheckItems).length > 0 || ungroupedCheckItems.length > 0;

    return (
        <Layout title={`Ellenőrzés – ${check.location?.name ?? ''}`}>
            <div className="max-w-5xl mx-auto">

                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"/>
                    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-800/10 rounded-full blur-3xl pointer-events-none"/>
                    <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
                        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                    <div className="relative px-4 py-6 sm:px-8 sm:py-8 flex items-start justify-between gap-6 flex-wrap">
                        <div>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Kulcs &amp; Kártya Ellenőrzés</p>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">{check.location?.name ?? 'Helyszín'}</h1>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    {formatDate(check.created_at)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                    Ellenőrizte: <strong className="text-slate-300 ml-0.5">{check.checked_by}</strong>
                                </span>
                                <span className={`flex items-center gap-1.5 ${pct === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <strong>{checkedItems}/{totalItems}</strong>&nbsp;tétel ({pct}%)
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                            <Link href={isPm ? route('pm.checks') : route('keys.show', locationId)}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                                </svg>
                                Vissza
                            </Link>
                            {canEdit && (
                                <Link href={route('checks.edit', check.id)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-sm font-medium transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                    Szerkesztés
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">
                        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {flash.success}
                    </div>
                )}

                <div className="space-y-4">

                    {/* Megjegyzés */}
                    {(check.notes || check.extra_email) && (
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                                    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                                    </svg>
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm">Megjegyzés</h3>
                            </div>
                            <div className="px-5 py-4 space-y-3">
                                {check.notes && (
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{check.notes}</p>
                                )}
                                {check.extra_email && (
                                    <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100">
                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                        </svg>
                                        Extra értesítés: <strong className="text-slate-600">{check.extra_email}</strong>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Hiányzó tételek */}
                    {missingItems.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                                    <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm">Hiányzó tételek</h3>
                                <span className="ml-auto text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                                    {missingItems.length} db
                                </span>
                            </div>
                            <ul className="divide-y divide-slate-50">
                                {missingItems.map(ci => {
                                    const groupId = getMissingGroupId(ci);
                                    const isCard  = ci.item?.type === 'card';
                                    const grpName = ci.item?.group?.name;
                                    return (
                                        <li key={ci.id}
                                            className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors group/row"
                                            onClick={() => openAndScroll(groupId)}>
                                            <div className="w-6 h-6 rounded-lg border-2 border-slate-200 bg-slate-50 shrink-0"/>
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isCard ? 'bg-purple-50 border border-purple-100' : 'bg-blue-50 border border-blue-100'}`}>
                                                {isCard ? (
                                                    <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 flex-1">{ci.item?.name}</span>
                                            {grpName && (
                                                <span className="text-[11px] text-slate-400 font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">{grpName}</span>
                                            )}
                                            <svg className="w-3.5 h-3.5 text-slate-300 group-hover/row:text-slate-500 transition-colors shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {/* Csoportos + csoportosítatlan tételek */}
                    {hasGroups ? (
                        <>
                            {Object.entries(groupedCheckItems).map(([groupName, items]) => {
                                const groupId = 'group-' + slug(groupName);
                                return (
                                    <GroupSection
                                        key={groupId}
                                        groupName={groupName}
                                        items={items}
                                        groupId={groupId}
                                        open={openGroups.has(groupId)}
                                        onToggle={() => toggleGroup(groupId)}
                                        sectionRef={el => { groupRefs.current[groupId] = el; }}
                                    />
                                );
                            })}
                            {ungroupedCheckItems.length > 0 && (
                                <GroupSection
                                    groupName="Egyéb tételek"
                                    items={ungroupedCheckItems}
                                    groupId="group-egyeb-tetelek"
                                    open={openGroups.has('group-egyeb-tetelek')}
                                    onToggle={() => toggleGroup('group-egyeb-tetelek')}
                                    sectionRef={el => { groupRefs.current['group-egyeb-tetelek'] = el; }}
                                    isUngrouped
                                />
                            )}
                        </>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-10 text-center">
                            <p className="text-sm text-slate-400">Ehhez az ellenőrzéshez nem tartoznak tételek.</p>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
}
