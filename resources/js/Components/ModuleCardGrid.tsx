import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor,
    useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates,
    useSortable, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PageProps } from '../types';

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

export interface ModuleCardDef {
    href: string;
    title: string;
    description: string;
    iconPath: string;
    accent: 'blue' | 'indigo' | 'amber' | 'teal' | 'orange' | 'rose';
    features: string[];
    actionLabel: string;
}

interface AccentConfig {
    iconBg: string;
    iconHover: string;
    iconAnim: string;
    titleHover: string;
    gradient: string;
    shadow: string;
    border: string;
    footerText: string;
    arrowBg: string;
    arrowHover: string;
    arrowIcon: string;
    check: string;
    spotColor: string;
}

const ACCENT: Record<string, AccentConfig> = {
    blue: {
        iconBg: 'bg-blue-50 border-blue-100 text-blue-600',
        iconHover: 'group-hover:bg-blue-100 group-hover:border-blue-200',
        iconAnim: 'motion-safe:group-hover:rotate-[20deg]',
        titleHover: 'group-hover:text-blue-700',
        gradient: 'from-blue-600 to-blue-400',
        shadow: 'hover:shadow-blue-100/80',
        border: 'hover:border-blue-200',
        footerText: 'text-blue-600 group-hover:text-blue-700',
        arrowBg: 'bg-blue-50 border-blue-100',
        arrowHover: 'group-hover:bg-blue-600 group-hover:border-blue-600',
        arrowIcon: 'text-blue-500 group-hover:text-white',
        check: 'text-blue-400',
        spotColor: 'rgba(59,130,246,0.30)',
    },
    indigo: {
        iconBg: 'bg-indigo-50 border-indigo-100 text-indigo-600',
        iconHover: 'group-hover:bg-indigo-100 group-hover:border-indigo-200',
        iconAnim: 'motion-safe:group-hover:scale-110',
        titleHover: 'group-hover:text-indigo-700',
        gradient: 'from-indigo-600 to-violet-400',
        shadow: 'hover:shadow-indigo-100/80',
        border: 'hover:border-indigo-200',
        footerText: 'text-indigo-600 group-hover:text-indigo-700',
        arrowBg: 'bg-indigo-50 border-indigo-100',
        arrowHover: 'group-hover:bg-indigo-600 group-hover:border-indigo-600',
        arrowIcon: 'text-indigo-500 group-hover:text-white',
        check: 'text-indigo-400',
        spotColor: 'rgba(99,102,241,0.30)',
    },
    amber: {
        iconBg: 'bg-amber-50 border-amber-100 text-amber-600',
        iconHover: 'group-hover:bg-amber-100 group-hover:border-amber-200',
        iconAnim: 'motion-safe:group-hover:scale-110',
        titleHover: 'group-hover:text-amber-700',
        gradient: 'from-amber-500 to-amber-400',
        shadow: 'hover:shadow-amber-100/80',
        border: 'hover:border-amber-200',
        footerText: 'text-amber-600 group-hover:text-amber-700',
        arrowBg: 'bg-amber-50 border-amber-100',
        arrowHover: 'group-hover:bg-amber-500 group-hover:border-amber-500',
        arrowIcon: 'text-amber-500 group-hover:text-white',
        check: 'text-amber-400',
        spotColor: 'rgba(245,158,11,0.30)',
    },
    teal: {
        iconBg: 'bg-teal-50 border-teal-100 text-teal-600',
        iconHover: 'group-hover:bg-teal-100 group-hover:border-teal-200',
        iconAnim: 'motion-safe:group-hover:scale-110',
        titleHover: 'group-hover:text-teal-700',
        gradient: 'from-teal-600 to-teal-400',
        shadow: 'hover:shadow-teal-100/80',
        border: 'hover:border-teal-200',
        footerText: 'text-teal-600 group-hover:text-teal-700',
        arrowBg: 'bg-teal-50 border-teal-100',
        arrowHover: 'group-hover:bg-teal-600 group-hover:border-teal-600',
        arrowIcon: 'text-teal-500 group-hover:text-white',
        check: 'text-teal-400',
        spotColor: 'rgba(20,184,166,0.30)',
    },
    orange: {
        iconBg: 'bg-orange-50 border-orange-100 text-orange-600',
        iconHover: 'group-hover:bg-orange-100 group-hover:border-orange-200',
        iconAnim: 'motion-safe:group-hover:scale-110',
        titleHover: 'group-hover:text-orange-700',
        gradient: 'from-orange-500 to-orange-400',
        shadow: 'hover:shadow-orange-100/80',
        border: 'hover:border-orange-200',
        footerText: 'text-orange-600 group-hover:text-orange-700',
        arrowBg: 'bg-orange-50 border-orange-100',
        arrowHover: 'group-hover:bg-orange-500 group-hover:border-orange-500',
        arrowIcon: 'text-orange-500 group-hover:text-white',
        check: 'text-orange-400',
        spotColor: 'rgba(249,115,22,0.30)',
    },
    rose: {
        iconBg: 'bg-rose-50 border-rose-100 text-rose-600',
        iconHover: 'group-hover:bg-rose-100 group-hover:border-rose-200',
        iconAnim: 'motion-safe:group-hover:scale-110',
        titleHover: 'group-hover:text-rose-700',
        gradient: 'from-rose-600 to-rose-400',
        shadow: 'hover:shadow-rose-100/80',
        border: 'hover:border-rose-200',
        footerText: 'text-rose-600 group-hover:text-rose-700',
        arrowBg: 'bg-rose-50 border-rose-100',
        arrowHover: 'group-hover:bg-rose-500 group-hover:border-rose-500',
        arrowIcon: 'text-rose-500 group-hover:text-white',
        check: 'text-rose-400',
        spotColor: 'rgba(244,63,94,0.30)',
    },
};

function SortableCard({ def, index }: { def: ModuleCardDef & { id: string }; index: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: def.id });
    const ac = ACCENT[def.accent];

    const tiltRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ hot: false, sx: 50, sy: 50 });
    const [spot, setSpot] = useState({ x: 50, y: 50, on: false });
    const [flipped, setFlipped] = useState(false);
    const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cardBodyRef = useRef<HTMLDivElement>(null);
    const arrowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = arrowRef.current;
        if (!el) return;
        function move(e: MouseEvent) {
            if (!el) return;
            const r = el.getBoundingClientRect();
            el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.4}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
            el.style.transition = 'transform 0.1s ease-out';
        }
        function leave() {
            if (!el) return;
            el.style.transform = '';
            el.style.transition = 'transform 0.55s cubic-bezier(.16,1,.3,1)';
        }
        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', leave);
        return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
    }, [flipped]);

    function doFlip(toBack: boolean) {
        const el = cardBodyRef.current;
        if (!el) return;
        el.style.transition = 'transform 0.1s ease-in, opacity 0.1s ease-in';
        el.style.transform = 'scaleX(0.05)';
        el.style.opacity = '0';
        setTimeout(() => {
            setFlipped(toBack);
            requestAnimationFrame(() => {
                if (cardBodyRef.current) {
                    cardBodyRef.current.style.transition = 'transform 0.13s ease-out, opacity 0.13s ease-out';
                    cardBodyRef.current.style.transform = '';
                    cardBodyRef.current.style.opacity = '';
                }
            });
        }, 100);
    }

    function onEnter() {
        setTilt(p => ({ ...p, hot: true }));
        if (!isDragging) {
            flipTimer.current = setTimeout(() => doFlip(true), 200);
        }
    }
    function onLeave() {
        setTilt({ hot: false, sx: 50, sy: 50 });
        setSpot(p => ({ ...p, on: false }));
        if (flipTimer.current) clearTimeout(flipTimer.current);
        if (flipped) doFlip(false);
    }
    function onMove(e: React.MouseEvent) {
        if (!tiltRef.current || isDragging) return;
        const r = tiltRef.current.getBoundingClientRect();
        setTilt(p => ({ ...p, sx: ((e.clientX - r.left) / r.width) * 100, sy: ((e.clientY - r.top) / r.height) * 100 }));
        setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
    }

    const tiltStyle: React.CSSProperties = isDragging ? {} : {
        transform: `scale(${tilt.hot ? 1.025 : 1})`,
        transition: tilt.hot ? 'transform 0.08s ease-out' : 'transform 0.55s cubic-bezier(.16,1,.3,1)',
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                ...(isDragging ? { opacity: 0.45 } : {}),
                zIndex: isDragging ? 20 : 'auto',
                animationDelay: `${index * 90}ms`,
            }}
            className="app-page-enter"
        >
            <div
                ref={tiltRef}
                style={tiltStyle}
                onMouseMove={onMove}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                className="h-full"
            >
                <div className={`group relative overflow-hidden border rounded-2xl shadow-sm hover:shadow-xl ${ac.shadow} ${ac.border} transition-shadow duration-300 flex flex-col h-full ${isDragging ? 'shadow-2xl ring-2 ring-blue-200/50' : ''} ${flipped ? `bg-gradient-to-br ${ac.gradient}` : 'bg-white border-slate-200'}`}>
                    <div style={{
                        background: spot.on && !flipped ? `radial-gradient(circle at ${spot.x}% ${spot.y}%, ${ac.spotColor} 0%, transparent 60%)` : 'transparent',
                        position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
                        transition: 'background 0.12s ease', zIndex: 5,
                    }} />
                    <div style={{
                        background: tilt.hot && !flipped ? `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(255,255,255,0.14) 0%, transparent 55%)` : 'none',
                        position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit', zIndex: 10,
                    }} />
                    {!flipped && (
                        <div className={`h-1 bg-gradient-to-r ${ac.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    )}
                    {/* Drag handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        className={`flex items-center justify-center py-2 cursor-grab active:cursor-grabbing select-none border-b transition-colors relative z-20 ${flipped ? 'border-white/20 hover:bg-white/10' : 'border-slate-100 hover:bg-slate-50'}`}
                    >
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-1 h-1 rounded-full ${flipped ? 'bg-white/40' : 'bg-slate-300'}`} />
                            ))}
                        </div>
                    </div>

                    <div ref={cardBodyRef} className="flex flex-col flex-1">
                        {!flipped ? (
                            <Link
                                href={def.href}
                                onClick={e => { if (isDragging) e.preventDefault(); }}
                                className="p-8 flex flex-col flex-1 relative z-10"
                            >
                                <div className={`relative w-14 h-14 rounded-2xl mb-6 flex items-center justify-center border ${ac.iconBg} ${ac.iconHover} transition-all duration-300`}>
                                    <svg className={`w-7 h-7 transition-transform duration-300 ${ac.iconAnim}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={def.iconPath} />
                                    </svg>
                                </div>
                                <h2 className={`text-xl font-bold text-slate-900 ${ac.titleHover} transition-colors duration-200`}>{def.title}</h2>
                                <p className="text-slate-500 text-sm mt-2 flex-1 leading-relaxed">{def.description}</p>
                                <ul className="mt-5 space-y-1.5">
                                    {def.features.map(feat => (
                                        <li key={feat} className="flex items-center gap-2 text-xs text-slate-400">
                                            <svg className={`w-3.5 h-3.5 ${ac.check} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                                    <span className={`text-sm font-semibold ${ac.footerText} transition-colors`}>{def.actionLabel}</span>
                                    <div ref={arrowRef} className={`w-8 h-8 rounded-full border flex items-center justify-center ${ac.arrowBg} ${ac.arrowHover} transition-all duration-300`}>
                                        <svg className={`w-4 h-4 ${ac.arrowIcon} transition-all duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <Link
                                href={def.href}
                                onClick={e => { if (isDragging) e.preventDefault(); }}
                                className="p-8 flex flex-col flex-1 relative z-10"
                            >
                                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.042, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }} />
                                <h3 className="text-2xl font-extrabold text-white mb-6 tracking-tight relative z-10">{def.title}</h3>
                                <ul className="flex-1 space-y-3 relative z-10">
                                    {def.features.map(feat => (
                                        <li key={feat} className="flex items-center gap-3 text-white/90">
                                            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-medium">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 pt-5 border-t border-white/25 flex items-center justify-between relative z-10">
                                    <span className="text-white/90 font-semibold text-sm">{def.actionLabel}</span>
                                    <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ModuleCardGrid({ modules, gridKey }: { modules: ModuleCardDef[]; gridKey: string }) {
    const { props: { auth } } = usePage<PageProps>();
    const withIds = modules.map(m => ({ ...m, id: m.href }));
    const storageKey = `${gridKey}-order-${auth.user?.id ?? 'guest'}`;

    function getInitialOrder(): string[] {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved) as string[];
                const ids = withIds.map(m => m.id);
                if (parsed.length === ids.length && ids.every(id => parsed.includes(id))) return parsed;
            }
        } catch { /* ignore */ }
        return withIds.map(m => m.id);
    }

    const [order, setOrder] = useState<string[]>(() => getInitialOrder());

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setOrder(prev => {
                const next = arrayMove(prev, prev.indexOf(String(active.id)), prev.indexOf(String(over.id)));
                try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
                return next;
            });
        }
    }

    const orderedModules = order.map(id => withIds.find(m => m.id === id)).filter((m): m is ModuleCardDef & { id: string } => !!m);

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={order} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {orderedModules.map((mod, i) => (
                        <SortableCard key={mod.id} def={mod} index={i} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
