import { useEffect, useState } from 'react';
import PmLayout from '../../Layouts/PmLayout';
import { WorkerCard, type WorkerStat } from '../../Components/WorkerStatCard';

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

interface AssignedLocation {
    id: number;
    name: string;
    security_lead_name?: string | null;
}

interface Props {
    workerStats: WorkerStat[];
    welcomeName?: string | null;
    assignedLocation?: AssignedLocation | null;
}

export default function PmDashboard({ workerStats, welcomeName, assignedLocation }: Props) {
    const [showWelcome, setShowWelcome] = useState(!!welcomeName);
    const [welcomeVisible, setWelcomeVisible] = useState(false);
    const [welcomeFading, setWelcomeFading] = useState(false);
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        if (!welcomeName) return;
        // PM loader fades at ~480ms — start welcome crossfade just before that
        const t0 = setTimeout(() => setWelcomeVisible(true), 400);
        const t1 = setTimeout(() => setEntered(true), 550);
        const t2 = setTimeout(() => setWelcomeFading(true), 2800);
        const t3 = setTimeout(() => setShowWelcome(false), 3500);
        return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [welcomeName]);

    return (
        <PmLayout title="Dolgozók áttekintése">
            {/* Welcome overlay */}
            {showWelcome && welcomeName && (
                <div
                    className={`fixed inset-0 z-[10000] flex items-center justify-center transition-opacity duration-500 ease-in-out pointer-events-none ${welcomeFading ? 'opacity-0' : welcomeVisible ? 'opacity-100' : 'opacity-0'}`}
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
            <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
                {/* Dot grid */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                {/* Content */}
                <div className="relative z-10 px-8 py-8 flex items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
                            Property Manager Portál{assignedLocation ? ` — ${assignedLocation.name}` : ''}
                        </p>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ animation: 'pmHeartbeat 4s ease-in-out infinite' }}>Dolgozók áttekintése</h1>
                        <p className="text-slate-400 mt-1 text-sm">
                            {workerStats.length} aktív dolgozó – oktatási és vizsgaeredmények
                            {assignedLocation?.security_lead_name && ` · Biztonsági vezető: ${assignedLocation.security_lead_name}`}
                        </p>
                    </div>
                    <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                        <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                </div>
                {/* Noise */}
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.038, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
            </div>

            {!assignedLocation && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
                    Jelenleg nincs irodaházhoz rendelve — kérje meg az adminisztrátort, hogy rendelje hozzá egy irodaházhoz, hogy lássa az ott dolgozókat.
                </div>
            )}

            {/* Worker grid */}
            {workerStats.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                    <p className="text-slate-400">Még nincs aktív dolgozó a rendszerben.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {workerStats.map((stat, index) => (
                        <div key={stat.worker.id} className="pm-card-enter" style={{ animationDelay: `${100 + index * 130}ms` }}>
                            <WorkerCard stat={stat} workerRouteName="pm.worker" delayMs={100 + index * 130} accent="amber" />
                        </div>
                    ))}
                </div>
            )}
        </PmLayout>
    );
}
