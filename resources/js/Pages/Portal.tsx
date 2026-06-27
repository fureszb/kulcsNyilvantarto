import { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
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

// ── SVG noise data URI ────────────────────────────────────
const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

interface LocationInfo {
    id: number;
    name: string;
    itemsCount: number;
}

interface Props {
    welcomeName?: string | null;
    checksToday: number;
    trainingsCompleted: number;
    locations: LocationInfo[];
    securityModuleVisible: boolean;
}

interface ModuleDef {
    id: string;
    routeName: string;
    title: string;
    description: string;
    iconPath: string;
    accentColor: string;
    features: string[];
    actionLabel: string;
    badgeKey?: 'newNotes' | 'newMessages';
    onlyNonPm?: boolean;
    featured?: boolean;
}

const ALL_MODULES: ModuleDef[] = [
    {
        id: 'keys',
        routeName: 'keys.index',
        title: 'Kulcsnyilvántartó',
        description: 'Kulcsok és belépőkártyák jelenlétének ellenőrzése helyszínenként.',
        iconPath: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
        accentColor: 'blue',
        features: ['Helyszínenkénti áttekintés', 'Gyors státusz ellenőrzés', 'Ellenőrzési előzmények'],
        actionLabel: 'Ellenőrzés indítása',
    },
    {
        id: 'trainings',
        routeName: 'training.index',
        title: 'Oktatások',
        description: 'Interaktív képzési anyagok és oktatások elvégzése.',
        iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        accentColor: 'indigo',
        features: ['Interaktív tananyagok', 'Tudásellenőrző tesztek', 'Haladási nyomkövetés'],
        actionLabel: 'Oktatások megtekintése',
    },
    {
        id: 'exams',
        routeName: 'exam.index',
        title: 'Vizsgák',
        description: 'Tudáspróba vizsgák elvégzése eredményértékeléssel.',
        iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        accentColor: 'amber',
        features: ['Tudáspróba vizsgák', 'Eredményértékelés', 'Vizsgaelőzmények'],
        actionLabel: 'Vizsgák megtekintése',
    },
    {
        id: 'notes',
        routeName: 'notes.index',
        title: 'Váltóüzenetek',
        description: 'Privát üzenetek kollégák között műszakváltáskor.',
        iconPath: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
        accentColor: 'teal',
        features: ['Privát üzenetváltás', 'Műszakváltási jegyzetek', 'Olvasatlan jelzők'],
        actionLabel: 'Üzenetek megtekintése',
        badgeKey: 'newNotes',
        onlyNonPm: true,
    },
    {
        id: 'messages',
        routeName: 'messages.index',
        title: 'PM üzenetek',
        description: 'A Property Manager kérései és értesítései neked.',
        iconPath: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        accentColor: 'orange',
        features: ['PM értesítések', 'Feladatkövetés', 'Válaszlehetőség'],
        actionLabel: 'Üzenetek megnyitása',
        badgeKey: 'newMessages',
        onlyNonPm: true,
    },
    {
        id: 'security',
        routeName: 'security.index',
        title: 'Napi Jelentés',
        description: 'Biztonsági szolgálat napi jelentésének digitális kitöltése.',
        iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        accentColor: 'rose',
        features: ['Napi biztonsági jelentés', 'Digitális aláírás', 'Jelentési előzmények'],
        actionLabel: 'Jelentés kitöltése',
    },
];

interface AccentConfig {
    iconBg: string;
    iconHover: string;
    iconAnim: string;
    titleHover: string;
    gradient: string;
    shimmer: string;
    shadow: string;
    border: string;
    footerText: string;
    arrowBg: string;
    arrowHover: string;
    arrowIcon: string;
    check: string;
    badge: string;
    beamColor: string;
    spotColor: string;
}

const ACCENT: Record<string, AccentConfig> = {
    blue: {
        iconBg: 'bg-blue-50 border-blue-100 text-blue-600',
        iconHover: 'group-hover:bg-blue-100 group-hover:border-blue-200',
        iconAnim: 'motion-safe:group-hover:rotate-[20deg]',
        titleHover: 'group-hover:text-blue-700',
        gradient: 'from-blue-600 to-blue-400',
        shimmer: 'via-blue-50/60',
        shadow: 'hover:shadow-blue-100/80',
        border: 'hover:border-blue-200',
        footerText: 'text-blue-600 group-hover:text-blue-700',
        arrowBg: 'bg-blue-50 border-blue-100',
        arrowHover: 'group-hover:bg-blue-600 group-hover:border-blue-600',
        arrowIcon: 'text-blue-500 group-hover:text-white',
        check: 'text-blue-400',
        badge: 'bg-blue-500',
        beamColor: '#3b82f6',
        spotColor: 'rgba(59,130,246,0.30)',
    },
    indigo: {
        iconBg: 'bg-indigo-50 border-indigo-100 text-indigo-600',
        iconHover: 'group-hover:bg-indigo-100 group-hover:border-indigo-200',
        iconAnim: 'motion-safe:group-hover:scale-110',
        titleHover: 'group-hover:text-indigo-700',
        gradient: 'from-indigo-600 to-violet-400',
        shimmer: 'via-indigo-50/60',
        shadow: 'hover:shadow-indigo-100/80',
        border: 'hover:border-indigo-200',
        footerText: 'text-indigo-600 group-hover:text-indigo-700',
        arrowBg: 'bg-indigo-50 border-indigo-100',
        arrowHover: 'group-hover:bg-indigo-600 group-hover:border-indigo-600',
        arrowIcon: 'text-indigo-500 group-hover:text-white',
        check: 'text-indigo-400',
        badge: 'bg-indigo-500',
        beamColor: '#6366f1',
        spotColor: 'rgba(99,102,241,0.30)',
    },
    amber: {
        iconBg: 'bg-amber-50 border-amber-100 text-amber-600',
        iconHover: 'group-hover:bg-amber-100 group-hover:border-amber-200',
        iconAnim: 'motion-safe:group-hover:scale-110',
        titleHover: 'group-hover:text-amber-700',
        gradient: 'from-amber-500 to-amber-400',
        shimmer: 'via-amber-50/60',
        shadow: 'hover:shadow-amber-100/80',
        border: 'hover:border-amber-200',
        footerText: 'text-amber-600 group-hover:text-amber-700',
        arrowBg: 'bg-amber-50 border-amber-100',
        arrowHover: 'group-hover:bg-amber-500 group-hover:border-amber-500',
        arrowIcon: 'text-amber-500 group-hover:text-white',
        check: 'text-amber-400',
        badge: 'bg-amber-500',
        beamColor: '#f59e0b',
        spotColor: 'rgba(245,158,11,0.30)',
    },
    teal: {
        iconBg: 'bg-teal-50 border-teal-100 text-teal-600',
        iconHover: 'group-hover:bg-teal-100 group-hover:border-teal-200',
        iconAnim: 'motion-safe:group-hover:scale-110',
        titleHover: 'group-hover:text-teal-700',
        gradient: 'from-teal-600 to-teal-400',
        shimmer: 'via-teal-50/60',
        shadow: 'hover:shadow-teal-100/80',
        border: 'hover:border-teal-200',
        footerText: 'text-teal-600 group-hover:text-teal-700',
        arrowBg: 'bg-teal-50 border-teal-100',
        arrowHover: 'group-hover:bg-teal-600 group-hover:border-teal-600',
        arrowIcon: 'text-teal-500 group-hover:text-white',
        check: 'text-teal-400',
        badge: 'bg-teal-500',
        beamColor: '#14b8a6',
        spotColor: 'rgba(20,184,166,0.30)',
    },
    orange: {
        iconBg: 'bg-orange-50 border-orange-100 text-orange-600',
        iconHover: 'group-hover:bg-orange-100 group-hover:border-orange-200',
        iconAnim: 'motion-safe:group-hover:scale-110',
        titleHover: 'group-hover:text-orange-700',
        gradient: 'from-orange-500 to-orange-400',
        shimmer: 'via-orange-50/60',
        shadow: 'hover:shadow-orange-100/80',
        border: 'hover:border-orange-200',
        footerText: 'text-orange-600 group-hover:text-orange-700',
        arrowBg: 'bg-orange-50 border-orange-100',
        arrowHover: 'group-hover:bg-orange-500 group-hover:border-orange-500',
        arrowIcon: 'text-orange-500 group-hover:text-white',
        check: 'text-orange-400',
        badge: 'bg-orange-500',
        beamColor: '#f97316',
        spotColor: 'rgba(249,115,22,0.30)',
    },
    rose: {
        iconBg: 'bg-rose-50 border-rose-100 text-rose-600',
        iconHover: 'group-hover:bg-rose-100 group-hover:border-rose-200',
        iconAnim: 'motion-safe:group-hover:scale-110',
        titleHover: 'group-hover:text-rose-700',
        gradient: 'from-rose-600 to-rose-400',
        shimmer: 'via-rose-50/60',
        shadow: 'hover:shadow-rose-100/80',
        border: 'hover:border-rose-200',
        footerText: 'text-rose-600 group-hover:text-rose-700',
        arrowBg: 'bg-rose-50 border-rose-100',
        arrowHover: 'group-hover:bg-rose-500 group-hover:border-rose-500',
        arrowIcon: 'text-rose-500 group-hover:text-white',
        check: 'text-rose-400',
        badge: 'bg-rose-500',
        beamColor: '#f43f5e',
        spotColor: 'rgba(244,63,94,0.30)',
    },
};

// ── Split words for animated h1 ───────────────────────────
function SplitWords({ text, className = '' }: { text: string; className?: string }) {
    const words = text.split(' ');
    return (
        <>
            {words.map((word, i) => (
                <span
                    key={i}
                    className={`split-word ${className}`}
                    style={{ animationDelay: `${150 + i * 85}ms` }}
                >
                    {word}{i < words.length - 1 ? ' ' : ''}
                </span>
            ))}
        </>
    );
}

// ── Sortable card with tilt, spotlight, flip, beam ────────
function SortableCard({ def, badge, index }: { def: ModuleDef; badge?: number; index: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: def.id });
    const ac = ACCENT[def.accentColor];

    const tiltRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ hot: false, sx: 50, sy: 50 });

    // Spotlight
    const [spot, setSpot] = useState({ x: 50, y: 50, on: false });

    // Flip
    const [flipped, setFlipped] = useState(false);
    const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cardBodyRef = useRef<HTMLDivElement>(null);

    // Magnetic arrow — re-run when flipped changes because the arrow div
    // is conditionally rendered and gets a new DOM node after each flip
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
                animationDelay: `${360 + index * 110}ms`,
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
                {/* Card shell */}
                <div className={`group relative overflow-hidden border rounded-2xl shadow-sm hover:shadow-xl ${ac.shadow} ${ac.border} transition-shadow duration-300 flex flex-col h-full ${isDragging ? 'shadow-2xl ring-2 ring-blue-200/50' : ''} ${flipped ? `bg-gradient-to-br ${ac.gradient}` : 'bg-white border-slate-200'}`}>
                    {/* Spotlight overlay */}
                    <div style={{
                        background: spot.on && !flipped ? `radial-gradient(circle at ${spot.x}% ${spot.y}%, ${ac.spotColor} 0%, transparent 60%)` : 'transparent',
                        position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
                        transition: 'background 0.12s ease', zIndex: 5,
                    }}/>
                    {/* Shine */}
                    <div style={{
                        background: tilt.hot && !flipped ? `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(255,255,255,0.14) 0%, transparent 55%)` : 'none',
                        position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit', zIndex: 10,
                    }}/>
                    {/* Border beam */}
                    {badge != null && badge > 0 && !flipped && (
                        <div className="beam-light" style={{ background: `linear-gradient(90deg, transparent, ${ac.beamColor}, transparent)` }}/>
                    )}
                    {/* Top gradient bar */}
                    {!flipped && (
                        <div className={`h-1 bg-gradient-to-r ${ac.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}/>
                    )}
                    {/* Drag handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        className={`flex items-center justify-center py-2 cursor-grab active:cursor-grabbing select-none border-b transition-colors relative z-20 ${flipped ? 'border-white/20 hover:bg-white/10' : 'border-slate-100 hover:bg-slate-50'}`}
                    >
                        <div className="flex gap-1">
                            {[0,1,2,3,4,5].map(i => (
                                <div key={i} className={`w-1 h-1 rounded-full ${flipped ? 'bg-white/40' : 'bg-slate-300'}`}/>
                            ))}
                        </div>
                    </div>
                    {/* Badge */}
                    {badge != null && badge > 0 && (
                        <span className={`absolute top-[52px] right-3 min-w-[18px] h-[18px] flex items-center justify-center rounded-full ${ac.badge} text-white text-[9px] font-bold leading-none px-1 z-30`}>
                            {badge > 9 ? '9+' : badge}
                        </span>
                    )}

                    {/* Flippable body */}
                    <div ref={cardBodyRef} className="flex flex-col flex-1">
                        {!flipped ? (
                            /* ── Front face ─────── */
                            <Link
                                href={route(def.routeName)}
                                onClick={e => { if (isDragging) e.preventDefault(); }}
                                className="p-8 flex flex-col flex-1 relative z-10"
                            >
                                <div className={`relative w-14 h-14 rounded-2xl mb-6 flex items-center justify-center border ${ac.iconBg} ${ac.iconHover} transition-all duration-300`}>
                                    <svg className={`w-7 h-7 transition-transform duration-300 ${ac.iconAnim}`}
                                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={def.iconPath}/>
                                    </svg>
                                </div>
                                <h2 className={`text-xl font-bold text-slate-900 ${ac.titleHover} transition-colors duration-200`}>
                                    {def.title}
                                </h2>
                                <p className="text-slate-500 text-sm mt-2 flex-1 leading-relaxed">{def.description}</p>
                                <ul className="mt-5 space-y-1.5">
                                    {def.features.map(feat => (
                                        <li key={feat} className="flex items-center gap-2 text-xs text-slate-400">
                                            <svg className={`w-3.5 h-3.5 ${ac.check} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                                            </svg>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                                    <span className={`text-sm font-semibold ${ac.footerText} transition-colors`}>{def.actionLabel}</span>
                                    <div ref={arrowRef} className={`w-8 h-8 rounded-full border flex items-center justify-center ${ac.arrowBg} ${ac.arrowHover} transition-all duration-300`}>
                                        <svg className={`w-4 h-4 ${ac.arrowIcon} transition-all duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            /* ── Back face ──────── */
                            <Link
                                href={route(def.routeName)}
                                onClick={e => { if (isDragging) e.preventDefault(); }}
                                className="p-8 flex flex-col flex-1 relative z-10"
                            >
                                {/* Noise on back */}
                                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.042, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
                                <h3 className="text-2xl font-extrabold text-white mb-6 tracking-tight relative z-10">{def.title}</h3>
                                <ul className="flex-1 space-y-3 relative z-10">
                                    {def.features.map(feat => (
                                        <li key={feat} className="flex items-center gap-3 text-white/90">
                                            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
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

function LocationCarousel({ locations }: { locations: LocationInfo[] }) {
    const [current, setCurrent] = useState(0);
    const [fading, setFading] = useState(false);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    function goTo(i: number) {
        if (i === current || fading) return;
        setFading(true);
        setTimeout(() => { setCurrent(i); setFading(false); }, 250);
    }
    function next() { goTo((current + 1) % locations.length); }
    function prev() { goTo((current - 1 + locations.length) % locations.length); }

    useEffect(() => {
        if (locations.length <= 1 || paused) return;
        timerRef.current = setInterval(next, 5000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [current, locations.length, paused]);

    if (!locations.length) return null;
    const loc = locations[current];

    return (
        <div
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Helyszínek a házban</span>
                </div>
                <span className="text-xs text-slate-400 tabular-nums">{current + 1} / {locations.length}</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
                {locations.length > 1 && (
                    <button onClick={prev} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                )}
                <div className={`flex-1 flex items-center gap-4 transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-800 truncate">{loc.name}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                            <span className="font-semibold text-slate-700">{loc.itemsCount}</span> regisztrált kulcs / kártya
                        </p>
                    </div>
                </div>
                {locations.length > 1 && (
                    <button onClick={next} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                )}
            </div>
            {locations.length > 1 && (
                <div className="pb-3">
                    <div className="flex justify-center gap-1.5 mb-2.5">
                        {locations.map((_, i) => (
                            <button key={i} onClick={() => goTo(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-slate-800' : 'w-1.5 bg-slate-200 hover:bg-slate-400'}`}/>
                        ))}
                    </div>
                    <div className="h-0.5 bg-slate-100 mx-5 rounded-full overflow-hidden">
                        {!paused && (
                            <div key={`${current}-progress`} className="h-full bg-slate-400 rounded-full"
                                style={{ animation: 'pmBarFill 5s linear forwards', transformOrigin: 'left' }}/>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function LiveClock() {
    const [time, setTime] = useState('');
    useEffect(() => {
        function tick() { setTime(new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })); }
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-xs font-semibold text-slate-300 tabular-nums">{time}</span>
        </div>
    );
}

function CountUp({ target, duration = 800 }: { target: number; duration?: number }) {
    const [val, setVal] = useState(0);
    const started = useRef(false);
    useEffect(() => {
        if (started.current || target === 0) { setVal(target); return; }
        started.current = true;
        let start: number | null = null;
        function step(ts: number) {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            setVal(Math.round(p * target));
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }, [target, duration]);
    return <>{val}</>;
}

export default function Portal({ welcomeName, checksToday, trainingsCompleted, locations, securityModuleVisible }: Props) {
    const page = usePage<PageProps>();
    const { auth, tenant, nav } = page.props;
    const user       = auth.user;
    const tenantName = tenant?.name ?? 'KK Nyilvántartó';
    const isNotPm    = user && !user.is_property_manager;
    const currentYear = new Date().getFullYear();

    const [mobileOpen,    setMobileOpen]    = useState(false);
    const [showWelcome,   setShowWelcome]   = useState(!!welcomeName);
    const [welcomeFading, setWelcomeFading] = useState(false);
    const [welcomeEntered, setWelcomeEntered] = useState(false);
    const [animReady,     setAnimReady]     = useState(false);
    const [scrolled,      setScrolled]      = useState(false);
    const [scrollHintReady, setScrollHintReady] = useState(false);

    useEffect(() => {
        // Double rAF ensures initial opacity:0 paint before running animation
        let id1: number, id2: number;
        const run = () => {
            id1 = requestAnimationFrame(() => {
                id2 = requestAnimationFrame(() => setAnimReady(true));
            });
        };
        if (welcomeName) {
            const t = setTimeout(run, 3350);
            return () => { clearTimeout(t); cancelAnimationFrame(id1); cancelAnimationFrame(id2); };
        }
        run();
        return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2); };
    }, []);

    useEffect(() => {
        function onScroll() { setScrolled(window.scrollY > 60); }
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!animReady) return;
        const t = setTimeout(() => setScrollHintReady(true), 700);
        return () => clearTimeout(t);
    }, [animReady]);

    useEffect(() => {
        if (!welcomeName) return;
        const t0 = setTimeout(() => setWelcomeEntered(true), 100);
        const t1 = setTimeout(() => setWelcomeFading(true), 2600);
        const t2 = setTimeout(() => setShowWelcome(false), 3300);
        return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
    }, [welcomeName]);

    const visibleModules = ALL_MODULES.filter(m => {
        if (m.onlyNonPm && !isNotPm) return false;
        if (m.id === 'security' && !securityModuleVisible && isNotPm) return false;
        return true;
    });
    const storageKey = `portal-order-${user?.id ?? 'guest'}`;

    function getInitialOrder(): string[] {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved) as string[];
                const ids = visibleModules.map(m => m.id);
                if (parsed.length === ids.length && ids.every(id => parsed.includes(id))) return parsed;
            }
        } catch {}
        return visibleModules.map(m => m.id);
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
                try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
                return next;
            });
        }
    }

    function logout(e: React.FormEvent) {
        e.preventDefault();
        router.post(route('logout'));
    }

    const orderedModules = order.map(id => visibleModules.find(m => m.id === id)!).filter(Boolean);

    const navLinks = [
        { route: 'home', label: 'Kezdőlap', match: 'home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        ...(!isNotPm || securityModuleVisible ? [{ route: 'security.index', label: 'Napi Jelentés', match: 'security.*', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }] : []),
        ...(isNotPm ? [
            { route: 'notes.index', label: 'Váltóüzenetek', match: 'notes.*', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', badge: nav?.newNotes, badgeColor: 'bg-rose-500' },
            { route: 'messages.index', label: 'PM üzenetek', match: 'messages.*', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', badge: nav?.newMessages, badgeColor: 'bg-amber-500' },
        ] : []),
    ] as Array<{ route: string; label: string; match?: string; icon: string; badge?: number; badgeColor?: string }>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <title>Főoldal – {tenantName}</title>

            {/* Welcome overlay */}
            {showWelcome && welcomeName && (
                <div className={`fixed inset-0 z-[999] flex items-center justify-center transition-opacity duration-700 ease-in-out pointer-events-none ${welcomeFading ? 'opacity-0' : 'opacity-100'}`}
                    style={{ background: 'linear-gradient(135deg,#0f172a 0%,#0c1a2e 50%,#0f172a 100%)' }}>
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"/>
                        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/[0.08] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}/>
                    </div>
                    <div className={`relative text-center px-8 transition-all duration-700 ease-out ${welcomeEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">{tenantName}</p>
                        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-3">Üdvözöljük,</h1>
                        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight"
                            style={{ background: 'linear-gradient(135deg,#3b82f6,#60a5fa,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            {welcomeName}!
                        </h2>
                        <div className="mt-8 w-16 h-0.5 bg-blue-500/40 mx-auto rounded-full"/>
                    </div>
                </div>
            )}

            {/* Scroll hint */}
            <div className={`fixed bottom-6 left-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none transition-all duration-700 ease-out ${!scrollHintReady ? '-translate-x-1/2 translate-y-10 opacity-0' : scrolled ? '-translate-x-1/2 opacity-0' : '-translate-x-1/2 opacity-100'}`}>
                <span className="text-xs font-semibold text-white bg-slate-900 px-3 py-1 rounded-full shadow-md whitespace-nowrap">További modulok</span>
                <div className="animate-bounce w-8 h-8 rounded-full bg-slate-900 shadow-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/>
                    </svg>
                </div>
            </div>

            {/* ─── Sticky nav ─────────────────────────────── */}
            <div
                className="sticky top-0 z-30 relative transition-all duration-300"
                style={scrolled ? {
                    background: 'rgba(15,23,42,0.82)',
                    backdropFilter: 'blur(20px) saturate(1.4)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                } : { background: '#0f172a' }}
            >
                {/* Dot grid */}
                <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 border-b border-white/5">
                        <Link href={route('home')} className="flex items-center gap-2.5 group shrink-0">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg group-hover:bg-blue-500 transition-colors shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                                </svg>
                            </div>
                            <span className="text-white font-bold text-sm hidden sm:block">{tenantName}</span>
                        </Link>

                        <nav className="hidden sm:flex items-center gap-0.5">
                            {navLinks.map(nl => {
                                const active = route().current(nl.match ?? nl.route);
                                return (
                                    <Link key={nl.route} href={route(nl.route)}
                                        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={nl.icon}/>
                                        </svg>
                                        {nl.label}
                                        {'badge' in nl && nl.badge != null && nl.badge > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5">
                                                <span className={`absolute -inset-0.5 rounded-full ${nl.badgeColor} animate-ping opacity-40`}/>
                                                <span className={`relative min-w-[14px] h-[14px] flex items-center justify-center rounded-full ${nl.badgeColor} text-white text-[9px] font-bold leading-none px-0.5`}>
                                                    {nl.badge > 9 ? '9+' : nl.badge}
                                                </span>
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="flex items-center gap-1.5">
                            <LiveClock />
                            {user && (
                                <>
                                    <Link href={route('profile.edit')} className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 hover:bg-white/10 transition-colors">
                                        <div className="w-5 h-5 rounded-md bg-blue-500/30 border border-blue-500/40 flex items-center justify-center shrink-0">
                                            <span className="text-[9px] font-bold text-blue-300 leading-none">{user.name.charAt(0)}</span>
                                        </div>
                                        <span className="text-xs font-medium text-slate-300 max-w-[100px] truncate">{user.name}</span>
                                    </Link>
                                    <form onSubmit={logout} className="hidden sm:block">
                                        <button type="submit" className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                            </svg>
                                            Kilépés
                                        </button>
                                    </form>
                                    {user.is_admin && (
                                        <Link href={route('admin.settings.edit')}
                                            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${route().current('admin.*') ? 'bg-white/10 text-white' : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            </svg>
                                            Admin
                                        </Link>
                                    )}
                                </>
                            )}
                            <button onClick={() => setMobileOpen(!mobileOpen)}
                                className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                                {mobileOpen
                                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                                }
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile nav */}
                {mobileOpen && (
                    <div className="sm:hidden border-t border-white/5 px-4 py-3 space-y-1">
                        {user && (
                            <div className="flex items-center gap-2 px-3 py-2 mb-1 border-b border-white/5">
                                <div className="w-7 h-7 rounded-lg bg-blue-500/30 border border-blue-500/40 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-blue-300">{user.name.charAt(0)}</span>
                                </div>
                                <span className="text-sm font-medium text-slate-300">{user.name}</span>
                            </div>
                        )}
                        {navLinks.map(nl => (
                            <Link key={nl.route} href={route(nl.route)} onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${route().current(nl.match ?? nl.route) ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={nl.icon}/>
                                </svg>
                                {nl.label}
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-white/5">
                            <form onSubmit={logout}>
                                <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                    Kilépés
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Main ───────────────────────────────────── */}
            <main className={`${animReady ? 'app-loaded' : ''} flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6`}>

                {/* ── Aurora Hero card ─────────────────────── */}
                <div className="app-page-enter relative overflow-hidden rounded-2xl mb-6 shadow-2xl" style={{ animationDelay: '0ms', background: 'linear-gradient(135deg,#0d1829 0%,#0f1f3d 40%,#0d1829 100%)' }}>
                    {/* Aurora blobs */}
                    <div className="absolute top-[-50%] left-[-15%] w-[65%] h-[200%] bg-blue-600/55 rounded-full blur-3xl aurora-blob-1 pointer-events-none"/>
                    <div className="absolute bottom-[-40%] right-[-8%] w-[55%] h-[160%] bg-blue-900/55 rounded-full blur-3xl aurora-blob-2 pointer-events-none"/>
                    <div className="absolute top-[10%] right-[22%] w-[36%] h-[85%] bg-teal-900/60 rounded-full blur-3xl aurora-blob-3 pointer-events-none"/>
                    {/* Fluid color layer */}
                    <div className="fluid-hero-1"/>
                    <div className="fluid-hero-2"/>
                    <div className="fluid-hero-3"/>
                    <div className="fluid-hero-4"/>
                    {/* Dot grid */}
                    <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                    {/* Content */}
                    <div className="relative z-10 px-8 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div>
                            {user && (
                                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
                                    {/* Status pulse ring */}
                                    <span className="relative inline-flex">
                                        <span className="absolute -inset-1.5 rounded-full bg-emerald-400/50 animate-ping"/>
                                        <span className="relative inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"/>
                                    </span>
                                    Üdvözlöm, {user.name}
                                </p>
                            )}
                            {/* Split-text h1 */}
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                                <SplitWords text={tenantName} />
                            </h1>
                            <p className="text-slate-400 mt-2 text-sm">Válasszon modult a folytatáshoz</p>
                        </div>
                        {/* Glassmorphism stat chips */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-3 bg-white/[0.13] border border-white/25 backdrop-blur-sm rounded-xl px-4 py-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 leading-none mb-1">Ma ellenőrzött</p>
                                    <p className="text-xl font-extrabold text-white leading-none"><CountUp target={checksToday}/></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/[0.13] border border-white/25 backdrop-blur-sm rounded-xl px-4 py-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 leading-none mb-1">Elvégzett oktatás</p>
                                    <p className="text-xl font-extrabold text-white leading-none"><CountUp target={trainingsCompleted}/></p>
                                </div>
                            </div>
                            {nav?.newMessages != null && nav.newMessages + (nav?.newNotes ?? 0) > 0 && (
                                <div className="flex items-center gap-3 bg-white/[0.13] border border-rose-400/35 backdrop-blur-sm rounded-xl px-4 py-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/30 flex items-center justify-center shrink-0">
                                        <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 leading-none mb-1">Olvasatlan</p>
                                        <p className="text-xl font-extrabold text-rose-400 leading-none"><CountUp target={nav.newMessages + (nav.newNotes ?? 0)}/></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Noise texture */}
                    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.07, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
                </div>

                <div className="app-page-enter" style={{ animationDelay: '120ms' }}>
                    <LocationCarousel locations={locations} />
                </div>

                {/* ── Module grid header ──────────────────── */}
                <div className="app-page-enter flex items-center justify-between mb-4" style={{ animationDelay: '240ms' }}>
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Modulok</h2>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                        Húzással rendezhető
                    </span>
                </div>

                {/* ── Bento module grid ───────────────────── */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={order} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {orderedModules.map((mod, i) => (
                                <SortableCard
                                    key={mod.id}
                                    def={mod}
                                    badge={mod.badgeKey ? (nav?.[mod.badgeKey] ?? 0) : undefined}
                                    index={i}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 border-t border-white/5 px-4 sm:px-6 lg:px-8 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-white block">{tenantName}</span>
                            <span className="text-xs text-slate-500">&copy; {currentYear}</span>
                        </div>
                    </div>
                    <a href="mailto:supportitsecurity@gmail.com" className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        supportitsecurity@gmail.com
                    </a>
                </div>
            </footer>
        </div>
    );
}
