import type { ReactNode } from 'react';

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

interface DashboardHeroProps {
    eyebrow: string;
    eyebrowColor?: string;
    title: string;
    subtitle: ReactNode;
    iconPath: string;
    pulseTitle?: boolean;
}

// A Director/PM/SecurityLead dashboardokon szó szerint azonos sötét
// gradient hero (dot-grid + noise textúra) egy helyen — Admin/Dashboard
// eddig nélküle volt, ez hozza egységes vizuális szintre a 4 dashboardot.
export function DashboardHero({ eyebrow, eyebrowColor = 'text-blue-400', title, subtitle, iconPath, pulseTitle = true }: DashboardHeroProps) {
    return (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
            <div className="relative z-10 px-8 py-8 flex items-center justify-between gap-6">
                <div>
                    <p className={`text-xs font-bold ${eyebrowColor} uppercase tracking-widest mb-1`}>{eyebrow}</p>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight" style={pulseTitle ? { animation: 'pmHeartbeat 4s ease-in-out infinite' } : undefined}>{title}</h1>
                    <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>
                </div>
                <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={iconPath}/>
                    </svg>
                </div>
            </div>
            <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.038, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
        </div>
    );
}
