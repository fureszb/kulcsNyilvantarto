import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import PmLayout from '../../Layouts/PmLayout';
import type { TenantUser, PageProps } from '../../types';

interface WorkerStat {
    worker: TenantUser;
    training_pct: number;
    location_pct: number;
    prof_pct: number | null;
}

interface Props {
    workerStats: WorkerStat[];
    welcomeName?: string | null;
}

function pctColor(pct: number, threshHigh = 80, threshMid = 50) {
    if (pct >= threshHigh) return { text: 'text-green-600', bar: 'bg-green-500' };
    if (pct >= threshMid)  return { text: 'text-amber-600',  bar: 'bg-amber-400' };
    return { text: 'text-red-500', bar: 'bg-red-400' };
}

function StatBar({ label, pct, threshHigh, threshMid, delayMs }: {
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
                    <div ref={barRef} className={`h-full rounded-full ${colors.bar}`} style={{ width: '0%' }} />
                )}
            </div>
        </div>
    );
}

function WorkerCard({ stat, index }: { stat: WorkerStat; index: number }) {
    const { worker, training_pct, location_pct, prof_pct } = stat;
    const baseDelay = 100 + index * 130;
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
        <div className="pm-card-enter" style={{ animationDelay: `${baseDelay}ms` }}>
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
                href={route('pm.worker', worker.id)}
                className="group relative bg-white border rounded-2xl shadow-sm p-6 flex flex-col gap-4 cursor-pointer overflow-hidden"
                style={{
                    borderColor: hot ? '#fde68a' : '#e2e8f0',
                    boxShadow: hot
                        ? '0 20px 40px -12px rgba(0,0,0,0.14), 0 8px 20px -8px rgba(0,0,0,0.08)'
                        : '0 1px 3px 0 rgba(0,0,0,0.08)',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
            >
                {/* Shine highlight */}
                <div
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                    style={{
                        background: hot
                            ? `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.22) 0%, transparent 58%)`
                            : 'none',
                    }}
                />

                {/* Worker header */}
                <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-lg font-bold text-amber-600">
                        {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors truncate">{worker.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{worker.email}</p>
                        {employedSince && (
                            <>
                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    {employedSince.toISOString().slice(0, 10).replace(/-/g, '.')} óta
                                </p>
                                {daysWorking !== null && (
                                    <p className="text-xs text-amber-500 mt-0.5 flex items-center gap-1 font-medium">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        {daysWorking} napja dolgozik
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>

                {/* Stats */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                    <StatBar label="Oktatási anyagok" pct={training_pct} threshHigh={80} threshMid={50} delayMs={baseDelay + 350} />
                    <StatBar label="Helyismeret" pct={location_pct} threshHigh={80} threshMid={50} delayMs={baseDelay + 480} />
                    <StatBar label="Szakmai tudás (vizsga)" pct={prof_pct} threshHigh={70} threshMid={50} delayMs={baseDelay + 610} />
                </div>
            </Link>
        </div>
        </div>
    );
}

export default function PmDashboard({ workerStats, welcomeName }: Props) {
    const { tenant } = usePage<PageProps>().props;
    const tenantName = tenant?.name ?? 'KK Nyilvántartó';
    const [showWelcome, setShowWelcome] = useState(!!welcomeName);
    const [welcomeFading, setWelcomeFading] = useState(false);
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        if (!welcomeName) return;
        requestAnimationFrame(() => setTimeout(() => setEntered(true), 50));
        const t1 = setTimeout(() => setWelcomeFading(true), 2600);
        const t2 = setTimeout(() => setShowWelcome(false), 3300);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [welcomeName]);

    return (
        <PmLayout title="Dolgozók áttekintése">
            {/* Welcome overlay */}
            {showWelcome && welcomeName && (
                <div
                    className={`fixed inset-0 z-[999] flex items-center justify-center transition-opacity duration-700 ease-in-out pointer-events-none ${welcomeFading ? 'opacity-0' : 'opacity-100'}`}
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1c1917 50%, #0f172a 100%)' }}
                >
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-600/[0.08] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                    <div
                        className={`relative text-center px-8 transition-all duration-700 ease-out ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    >
                        <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">Property Manager Portál</p>
                        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-3">Üdvözöljük,</h1>
                        <h2
                            className="text-4xl sm:text-6xl font-extrabold tracking-tight"
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                        >
                            {welcomeName}!
                        </h2>
                        <div className="mt-8 w-16 h-0.5 bg-amber-500/40 mx-auto rounded-full" />
                    </div>
                </div>
            )}

            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="relative px-8 py-8 flex items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Property Manager Portál</p>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ animation: 'pmHeartbeat 4s ease-in-out infinite' }}>Dolgozók áttekintése</h1>
                        <p className="text-slate-400 mt-1 text-sm">{workerStats.length} aktív dolgozó – oktatási és vizsgaeredmények</p>
                    </div>
                    <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                        <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Worker grid */}
            {workerStats.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                    <p className="text-slate-400">Még nincs aktív dolgozó a rendszerben.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {workerStats.map((stat, index) => (
                        <WorkerCard key={stat.worker.id} stat={stat} index={index} />
                    ))}
                </div>
            )}
        </PmLayout>
    );
}
