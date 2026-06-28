import { useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import type { TenantRecord } from '../types';

interface Props { tenants: TenantRecord[]; }
type Theme = 'dark' | 'light';

/* ─── Keyframe CSS ─── */
const STYLES = `
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}
@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
}
@keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
    70%  { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
    100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}
@keyframes shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
}
@keyframes scanLine {
    0%   { top: -2px; opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { top: calc(100% + 2px); opacity: 0; }
}
@keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
.landing-card-enter {
    animation: fadeInUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
}
.hero-icon-float {
    animation: float 4s ease-in-out infinite;
}
.badge-pulse span:first-child {
    animation: pulseRing 2s ease-out infinite;
}
`;

/* ─── Splash ─── */
function CortexSplash({ onDone }: { onDone: () => void }) {
    const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), 900);
        const t2 = setTimeout(() => setPhase('out'), 1800);
        const t3 = setTimeout(() => onDone(), 2700);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onDone]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 99999, background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        }}>
            <div style={{
                opacity: phase === 'out' ? 0 : 1,
                transition: 'opacity 0.9s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
            }}>
                <span style={{
                    fontSize: 'clamp(64px, 12vw, 120px)', fontWeight: 900, letterSpacing: '0.18em',
                    background: 'linear-gradient(135deg, #0f2460 0%, #0c4a6e 55%, #78350f 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 3s ease infinite',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1,
                }}>
                    CORTEX
                </span>
                <div style={{
                    width: '40px', height: '1.5px', borderRadius: '2px', opacity: 0.5,
                    background: 'linear-gradient(90deg, #0c4a6e, #0f2460)',
                }} />
            </div>
        </div>
    );
}

/* ─── Theme toggle ─── */
function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
    const isDark = theme === 'dark';
    return (
        <button
            onClick={onToggle}
            title={isDark ? 'Váltás világos témára' : 'Váltás sötét témára'}
            style={{
                position: 'fixed', top: '16px', right: '18px', zIndex: 200,
                width: '38px', height: '38px', borderRadius: '11px', border: 'none',
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                color: isDark ? '#94a3b8' : '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.1)' : '0 0 0 1px rgba(0,0,0,0.09)',
            }}
        >
            {isDark ? (
                <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
                </svg>
            ) : (
                <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
            )}
        </button>
    );
}

/* ─── Tenant card ─── */
function TenantCard({ tenant, theme, index }: { tenant: TenantRecord; theme: Theme; index: number }) {
    const [hovered, setHovered] = useState(false);
    const isDark = theme === 'dark';

    const cardBg = isDark
        ? hovered
            ? 'linear-gradient(135deg, #0d1f3c, #0a1929)'
            : 'linear-gradient(135deg, #0b1628, #080f1e)'
        : hovered
            ? 'linear-gradient(135deg, #f0f7ff, #e8f4fd)'
            : 'linear-gradient(135deg, #ffffff, #f8faff)';

    return (
        <a
            href={`/${tenant.slug}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="landing-card-enter"
            style={{
                display: 'block', textDecoration: 'none',
                background: cardBg,
                border: isDark
                    ? `1px solid ${hovered ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.09)'}`
                    : `1px solid ${hovered ? 'rgba(14,165,233,0.4)' : '#dde6f0'}`,
                borderRadius: '20px', padding: '22px',
                transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                transform: hovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
                boxShadow: hovered
                    ? isDark
                        ? '0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(14,165,233,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
                        : '0 16px 40px rgba(14,165,233,0.15), 0 0 0 1px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.8)'
                    : isDark
                        ? '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)'
                        : '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                animationDelay: `${index * 80}ms`,
            }}
        >
            {/* Top gradient accent */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, #1d4ed8, #0ea5e9, #f59e0b)',
                opacity: hovered ? 1 : 0, transition: 'opacity 0.25s',
            }} />

            {/* Shimmer on hover */}
            {hovered && (
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    overflow: 'hidden', borderRadius: '20px',
                }}>
                    <div style={{
                        position: 'absolute', top: 0, left: '-60%', width: '40%', height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                        animation: 'shimmer 0.7s ease forwards',
                    }} />
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{
                    width: '46px', height: '46px', borderRadius: '14px',
                    background: hovered
                        ? isDark ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.1)'
                        : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(14,165,233,0.06)',
                    border: `1px solid ${hovered ? 'rgba(14,165,233,0.3)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(14,165,233,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.25s', flexShrink: 0,
                    boxShadow: hovered ? '0 0 16px rgba(14,165,233,0.15)' : 'none',
                }}>
                    <svg width="22" height="22" fill="none"
                        stroke={hovered ? '#0ea5e9' : isDark ? '#4b6080' : '#7ba7c8'}
                        viewBox="0 0 24 24" style={{ transition: 'stroke 0.25s' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                </div>

                <span className="badge-pulse" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981',
                }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0, display: 'inline-block' }} />
                    Aktív
                </span>
            </div>

            <h2 style={{
                fontSize: '15px', fontWeight: 700, lineHeight: 1.3, marginBottom: '4px',
                color: hovered ? (isDark ? '#e2e8f0' : '#0f172a') : (isDark ? '#8aa0b8' : '#2d4a66'),
                transition: 'color 0.25s',
            }}>{tenant.name}</h2>
            <p style={{ fontSize: '11px', color: isDark ? '#2a3a4a' : '#94afc4', fontFamily: 'monospace' }}>{tenant.slug}</p>

            <div style={{
                marginTop: '18px', paddingTop: '15px',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(14,165,233,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <span style={{
                    fontSize: '13px', fontWeight: 700, transition: 'color 0.25s',
                    color: hovered ? '#0ea5e9' : isDark ? '#3a5570' : '#7baac8',
                }}>Belépés →</span>
                <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', transition: 'all 0.25s',
                    background: hovered
                        ? 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'
                        : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(14,165,233,0.08)',
                    border: `1px solid ${hovered ? 'transparent' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(14,165,233,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: hovered ? '0 0 12px rgba(14,165,233,0.4)' : 'none',
                }}>
                    <svg width="13" height="13" fill="none"
                        stroke={hovered ? '#fff' : isDark ? '#3a5570' : '#7baac8'}
                        viewBox="0 0 24 24" style={{ transition: 'stroke 0.25s' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </a>
    );
}

/* ─── Super admin card ─── */
function SuperAdminCard({ theme }: { theme: Theme }) {
    const [hovered, setHovered] = useState(false);
    const isDark = theme === 'dark';

    return (
        <Link
            href={route('super-admin.login')}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="landing-card-enter"
            style={{
                display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none',
                background: hovered ? 'linear-gradient(135deg, #111827, #0d1520)' : 'linear-gradient(135deg, #0b1120, #08101a)',
                border: `1px solid ${hovered ? 'rgba(148,163,184,0.2)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '18px', padding: '17px 20px',
                transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                boxShadow: hovered
                    ? '0 14px 36px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
                cursor: 'pointer',
                animationDelay: '200ms',
            }}
        >
            <div style={{
                width: '44px', height: '44px', borderRadius: '13px', flexShrink: 0,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.09)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s',
                boxShadow: hovered ? '0 0 14px rgba(148,163,184,0.1)' : 'none',
            }}>
                <svg width="21" height="21" fill="none" stroke="#5a7090" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '2px', color: '#c8d8e8' }}>Super Admin</p>
                <p style={{ fontSize: '12px', color: '#3a5060' }}>Szervezetek és rendszerbeállítások kezelése</p>
            </div>
            <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: hovered ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s',
            }}>
                <svg width="12" height="12" fill="none"
                    stroke={hovered ? '#c8d8e8' : '#3a5070'}
                    viewBox="0 0 24 24" style={{ transition: 'stroke 0.25s' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                </svg>
            </div>
        </Link>
    );
}

/* ─── Main ─── */
export default function Landing({ tenants }: Props) {
    const currentYear = new Date().getFullYear();
    const [splashDone, setSplashDone] = useState(false);
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const stored = localStorage.getItem('landing-theme') as Theme | null;
        if (stored === 'dark' || stored === 'light') setTheme(stored);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('landing-theme', next);
            return next;
        });
    }, []);

    const isDark = theme === 'dark';

    const pageBg = isDark
        ? '#06080f'
        : '#eef2f7';

    const labelColor = isDark ? '#3a5570' : '#8aa4bc';
    const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : '#cdd8e8';

    return (
        <>
            <style>{STYLES}</style>
            {!splashDone && <CortexSplash onDone={() => setSplashDone(true)} />}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            <div style={{
                opacity: splashDone ? 1 : 0,
                transition: 'opacity 0.6s ease',
                minHeight: '100vh',
                background: pageBg,
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>

                {/* ── Hero – always black ── */}
                <div style={{
                    background: '#000',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    {/* Ambient */}
                    <div style={{ position: 'absolute', top: '-30%', right: '-8%', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(12,74,110,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-30%', left: '-8%', width: '460px', height: '460px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,36,96,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    {/* Grid */}
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

                    <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>
                        {/* Floating icon */}
                        <div className="hero-icon-float" style={{
                            width: '72px', height: '72px', borderRadius: '22px', margin: '0 auto 28px',
                            background: 'linear-gradient(135deg, rgba(15,36,96,0.6), rgba(12,74,110,0.6))',
                            border: '1px solid rgba(12,74,110,0.6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 32px rgba(12,74,110,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                        }}>
                            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                                <defs>
                                    <linearGradient id="hg2" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#1d4ed8"/>
                                        <stop offset="100%" stopColor="#0ea5e9"/>
                                    </linearGradient>
                                </defs>
                                <path stroke="url(#hg2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                            </svg>
                        </div>

                        {/* Badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(12,74,110,0.2)', border: '1px solid rgba(14,165,233,0.15)',
                            borderRadius: '999px', padding: '5px 16px', marginBottom: '20px',
                            animation: 'fadeIn 0.8s ease 0.3s both',
                        }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#4a8aa8', letterSpacing: '0.1em' }}>CORTEX OPS SYSTEMS</span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(36px, 5.5vw, 58px)', fontWeight: 900, lineHeight: 1.08,
                            background: 'linear-gradient(135deg, #c8d8e8 0%, #5a7a90 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            margin: '0 0 16px', letterSpacing: '-0.025em',
                            animation: 'fadeInUp 0.7s ease 0.4s both',
                        }}>KK Nyilvántartó</h1>

                        <p style={{
                            color: '#3a5060', fontSize: '16px', maxWidth: '360px', margin: '0 auto',
                            animation: 'fadeInUp 0.7s ease 0.5s both',
                        }}>
                            Válassza ki szervezetét a belépéshez
                        </p>
                    </div>
                </div>

                {/* ── Cards area ── */}
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 52px' }}>

                    {tenants.length > 0 ? (
                        <>
                            <p style={{
                                fontSize: '11px', fontWeight: 700, color: labelColor,
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '18px',
                                animation: 'fadeIn 0.5s ease 0.1s both',
                            }}>
                                <svg width="13" height="13" fill="none" stroke="#0ea5e9" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Szervezetek
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(258px, 1fr))', gap: '14px' }}>
                                {tenants.map((t, i) => <TenantCard key={t.id} tenant={t} theme={theme} index={i} />)}
                            </div>
                        </>
                    ) : (
                        <div style={{
                            background: isDark ? 'linear-gradient(135deg, #0b1628, #080f1e)' : 'linear-gradient(135deg, #ffffff, #f4f8fc)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#dde5f0'}`,
                            borderRadius: '20px', padding: '56px 24px', textAlign: 'center', marginBottom: '40px',
                            boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.04)' : '0 2px 8px rgba(0,0,0,0.05)',
                        }}>
                            <p style={{ color: isDark ? '#5a7090' : '#7a90a8', fontWeight: 600, marginBottom: '6px' }}>Még nincs felvett szervezet</p>
                            <p style={{ color: isDark ? '#2a3a4a' : '#94a8bc', fontSize: '14px' }}>A Super Admin felületen adjon hozzá szervezeteket.</p>
                        </div>
                    )}

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '44px 0 32px' }}>
                        <div style={{ flex: 1, height: '1px', background: dividerColor }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: labelColor, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                            Rendszerszintű hozzáférés
                        </span>
                        <div style={{ flex: 1, height: '1px', background: dividerColor }} />
                    </div>

                    <div style={{ maxWidth: '360px' }}>
                        <SuperAdminCard theme={theme} />
                    </div>
                </div>

                {/* ── Footer – always black ── */}
                <footer style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '9px',
                                background: 'linear-gradient(135deg, rgba(15,36,96,0.5), rgba(12,74,110,0.5))',
                                border: '1px solid rgba(12,74,110,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="14" height="14" fill="none" stroke="#0ea5e9" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                                </svg>
                            </div>
                            <div>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#8aa0b8', display: 'block', lineHeight: 1.3 }}>KK Nyilvántartó</span>
                                <span style={{ fontSize: '11px', color: '#2a3a4a' }}>&copy; {currentYear} Cortex Ops Systems</span>
                            </div>
                        </div>
                        <a
                            href="mailto:supportitsecurity@gmail.com"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: '#2a3a4a', textDecoration: 'none', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#4a6a80')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#2a3a4a')}
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            supportitsecurity@gmail.com
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}
