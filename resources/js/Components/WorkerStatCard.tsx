import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import type { TenantUser } from '../types';

declare function route(name: string, params?: unknown): string;

export interface WorkerStat {
    worker: TenantUser;
    training_pct: number;
    location_pct: number;
    prof_pct: number | null;
}

export function pctColor(pct: number, threshHigh = 80, threshMid = 50) {
    if (pct >= threshHigh) return { text: 'text-green-600', gradient: 'linear-gradient(90deg,#16a34a,#22c55e,#4ade80)', pulse: false };
    if (pct >= threshMid)  return { text: 'text-amber-600', gradient: 'linear-gradient(90deg,#d97706,#f59e0b,#fcd34d)', pulse: false };
    return                        { text: 'text-red-500',   gradient: 'linear-gradient(90deg,#dc2626,#ef4444,#f87171)', pulse: true  };
}

export function StatBar({ label, pct, threshHigh, threshMid, delayMs }: {
    label: string; pct: number | null; threshHigh?: number; threshMid?: number; delayMs?: number;
}) {
    const barRef = useRef<HTMLDivElement>(null);
    const colors = pct !== null ? pctColor(pct, threshHigh, threshMid) : null;

    useEffect(() => {
        if (barRef.current && pct !== null) {
            const el = barRef.current;
            el.style.width = '0%';
            const timer = setTimeout(() => {
                el.style.transition = 'width 1.1s cubic-bezier(.16,1,.3,1)';
                el.style.width = `${pct}%`;
            }, delayMs ?? 0);
            return () => clearTimeout(timer);
        }
    }, [pct, delayMs]);

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-500">{label}</span>
                {pct !== null && colors ? (
                    <span className={`text-xs font-bold ${colors.text}`}>{pct}%</span>
                ) : (
                    <span className="text-xs text-slate-300">Nincs vizsga</span>
                )}
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                {pct !== null && colors && (
                    <div
                        ref={barRef}
                        className={`h-full rounded-full${colors.pulse ? ' progress-pulse' : ''}`}
                        style={{ width: '0%', background: colors.gradient }}
                    />
                )}
            </div>
        </div>
    );
}

const ACCENT = {
    amber: { avatarBg: 'bg-amber-50 border-amber-100 text-amber-600', hoverText: 'group-hover:text-amber-700', hoverBorder: '#fde68a', hoverChevron: 'group-hover:text-amber-500', tag: 'text-amber-500' },
    blue:  { avatarBg: 'bg-blue-50 border-blue-100 text-blue-600',   hoverText: 'group-hover:text-blue-700',  hoverBorder: '#bfdbfe', hoverChevron: 'group-hover:text-blue-500',  tag: 'text-blue-500' },
};

/** Dolgozó-kártya oktatás/helyismeret/vizsga-mutatókkal. A PM és a biztonsági
 *  vezető portál is ugyanezt használja, csak a cél-route és a szín tér el. */
export function WorkerCard({ stat, workerRouteName, delayMs = 0, accent = 'amber' }: {
    stat: WorkerStat; workerRouteName: string; delayMs?: number; accent?: 'amber' | 'blue';
}) {
    const { worker, training_pct, location_pct, prof_pct } = stat;
    const a = ACCENT[accent];
    const initial = worker.name ? worker.name.charAt(0) : '?';
    const employedSince = worker.employed_since ? new Date(worker.employed_since) : null;
    const daysWorking = employedSince
        ? Math.floor((Date.now() - employedSince.getTime()) / 86400000)
        : null;

    const wrapRef = useRef<HTMLDivElement>(null);
    const [tilt,  setTilt]  = useState({ rx: 0, ry: 0 });
    const [shine, setShine] = useState({ x: 50, y: 50 });
    const [hot,   setHot]   = useState(false);

    function onMove(e: React.MouseEvent) {
        if (!wrapRef.current) return;
        const r = wrapRef.current.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        setTilt({ rx: -dy * 7, ry: dx * 7 });
        setShine({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
    }

    return (
        <div
            ref={wrapRef}
            onMouseMove={onMove}
            onMouseEnter={() => setHot(true)}
            onMouseLeave={() => { setHot(false); setTilt({ rx: 0, ry: 0 }); }}
            className="rounded-2xl"
            style={{
                transform: `perspective(700px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${hot ? 1.03 : 1})`,
                transition: hot ? 'transform 0.08s ease-out' : 'transform 0.5s cubic-bezier(.16,1,.3,1)',
                willChange: 'transform',
            }}
        >
            <Link
                href={route(workerRouteName, worker.id)}
                className="group relative bg-white border rounded-2xl shadow-sm p-6 flex flex-col gap-4 cursor-pointer overflow-hidden"
                style={{
                    borderColor: hot ? a.hoverBorder : '#e2e8f0',
                    boxShadow: hot
                        ? '0 20px 40px -12px rgba(0,0,0,0.14), 0 8px 20px -8px rgba(0,0,0,0.08)'
                        : '0 1px 3px 0 rgba(0,0,0,0.08)',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
            >
                <div
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                    style={{
                        background: hot
                            ? `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.22) 0%, transparent 58%)`
                            : 'none',
                    }}
                />

                <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 text-lg font-bold ${a.avatarBg}`}>
                        {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`font-bold text-slate-800 transition-colors truncate ${a.hoverText}`}>{worker.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{worker.email}</p>
                        {employedSince && (
                            <>
                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    {employedSince.toISOString().slice(0, 10).replace(/-/g, '.')} óta
                                </p>
                                {daysWorking !== null && (
                                    <p className={`text-xs mt-0.5 flex items-center gap-1 font-medium ${a.tag}`}>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        {daysWorking} napja dolgozik
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                    <svg className={`w-4 h-4 text-slate-300 transition-colors shrink-0 mt-1 ${a.hoverChevron}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-4">
                    <StatBar label="Oktatási anyagok" pct={training_pct} threshHigh={80} threshMid={50} delayMs={delayMs + 350} />
                    <StatBar label="Helyismeret" pct={location_pct} threshHigh={80} threshMid={50} delayMs={delayMs + 480} />
                    <StatBar label="Szakmai tudás (vizsga)" pct={prof_pct} threshHigh={70} threshMid={50} delayMs={delayMs + 610} />
                </div>
            </Link>
        </div>
    );
}
