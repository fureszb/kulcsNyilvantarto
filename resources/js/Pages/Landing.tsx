import { useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import type { TenantRecord } from '../types';

interface Props {
    tenants: TenantRecord[];
}

type Theme = 'dark' | 'light';

function CortexSplash({ onDone, theme }: { onDone: () => void; theme: Theme }) {
    const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), 900);
        const t2 = setTimeout(() => setPhase('out'), 1800);
        const t3 = setTimeout(() => onDone(), 2700);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onDone]);

    const bg = theme === 'dark' ? '#07091a' : '#f8fafc';

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                opacity: phase === 'out' ? 0 : 1,
                transition: 'opacity 0.9s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
            }}>
                <span style={{
                    fontSize: 'clamp(64px, 12vw, 120px)',
                    fontWeight: 900,
                    letterSpacing: '0.18em',
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 55%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    lineHeight: 1,
                }}>
                    CORTEX
                </span>
                <div style={{
                    width: '48px', height: '2px',
                    background: 'linear-gradient(90deg, #1d4ed8, #0ea5e9)',
                    borderRadius: '2px', opacity: 0.7,
                }} />
            </div>
        </div>
    );
}

/* ─── Theme toggle button ─── */
function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
    const [hovered, setHovered] = useState(false);
    const isDark = theme === 'dark';

    return (
        <button
            onClick={onToggle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={isDark ? 'Váltás világos témára' : 'Váltás sötét témára'}
            style={{
                position: 'fixed', top: '18px', right: '20px', zIndex: 100,
                width: '40px', height: '40px', borderRadius: '12px', border: 'none',
                background: isDark
                    ? (hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)')
                    : (hovered ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.06)'),
                color: isDark ? '#94a3b8' : '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s ease',
                outline: 'none',
                boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.08)' : '0 0 0 1px rgba(0,0,0,0.08)',
            }}
        >
            {isDark ? (
                /* Sun icon */
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
                </svg>
            ) : (
                /* Moon icon */
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
            )}
        </button>
    );
}

/* ─── Tenant card ─── */
function TenantCard({ tenant, theme }: { tenant: TenantRecord; theme: Theme }) {
    const [hovered, setHovered] = useState(false);
    const isDark = theme === 'dark';

    return (
        <a
            href={`/${tenant.slug}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'block', textDecoration: 'none',
                background: isDark
                    ? (hovered ? 'rgba(14,165,233,0.06)' : 'rgba(255,255,255,0.03)')
                    : (hovered ? 'rgba(14,165,233,0.05)' : '#ffffff'),
                border: isDark
                    ? `1px solid ${hovered ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.07)'}`
                    : `1px solid ${hovered ? 'rgba(14,165,233,0.35)' : '#e2e8f0'}`,
                borderRadius: '18px', padding: '22px',
                transition: 'all 0.22s ease',
                transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                boxShadow: hovered
                    ? isDark
                        ? '0 16px 36px rgba(0,0,0,0.35), 0 0 0 1px rgba(14,165,233,0.12)'
                        : '0 12px 28px rgba(14,165,233,0.12), 0 0 0 1px rgba(14,165,233,0.12)'
                    : isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
            }}
        >
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, #1d4ed8, #0ea5e9)',
                opacity: hovered ? 1 : 0, transition: 'opacity 0.22s',
                borderRadius: '18px 18px 0 0',
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                    width: '44px', height: '44px', borderRadius: '13px',
                    background: hovered
                        ? 'rgba(14,165,233,0.1)'
                        : isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                    border: `1px solid ${hovered ? 'rgba(14,165,233,0.22)' : isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.22s', flexShrink: 0,
                }}>
                    <svg width="21" height="21" fill="none"
                        stroke={hovered ? '#0ea5e9' : isDark ? '#475569' : '#94a3b8'}
                        viewBox="0 0 24 24" style={{ transition: 'stroke 0.22s' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                </div>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981',
                }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                    Aktív
                </span>
            </div>

            <h2 style={{
                fontSize: '14px', fontWeight: 700, lineHeight: 1.3, marginBottom: '3px',
                color: hovered ? (isDark ? '#e2e8f0' : '#0f172a') : (isDark ? '#94a3b8' : '#334155'),
                transition: 'color 0.22s',
            }}>{tenant.name}</h2>
            <p style={{ fontSize: '11px', color: isDark ? '#334155' : '#94a3b8', fontFamily: 'monospace' }}>{tenant.slug}</p>

            <div style={{
                marginTop: '18px', paddingTop: '14px',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <span style={{
                    fontSize: '13px', fontWeight: 600, transition: 'color 0.22s',
                    color: hovered ? '#0ea5e9' : isDark ? '#475569' : '#94a3b8',
                }}>Belépés</span>
                <div style={{
                    width: '27px', height: '27px', borderRadius: '50%', transition: 'all 0.22s',
                    background: hovered ? 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' : isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                    border: `1px solid ${hovered ? 'transparent' : isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <svg width="12" height="12" fill="none"
                        stroke={hovered ? '#fff' : isDark ? '#475569' : '#94a3b8'}
                        viewBox="0 0 24 24" style={{ transition: 'stroke 0.22s' }}>
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
            style={{
                display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none',
                background: isDark
                    ? (hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)')
                    : (hovered ? '#f8fafc' : '#ffffff'),
                border: isDark
                    ? `1px solid ${hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`
                    : `1px solid ${hovered ? '#cbd5e1' : '#e2e8f0'}`,
                borderRadius: '16px', padding: '16px 18px',
                transition: 'all 0.22s ease',
                transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hovered
                    ? isDark ? '0 10px 28px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)'
                    : isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                cursor: 'pointer',
            }}
        >
            <div style={{
                width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                background: isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.22s',
            }}>
                <svg width="20" height="20" fill="none" stroke={isDark ? '#64748b' : '#94a3b8'} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '2px', color: isDark ? '#e2e8f0' : '#1e293b' }}>Super Admin</p>
                <p style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8' }}>Szervezetek és rendszerbeállítások</p>
            </div>
            <div style={{
                width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                background: hovered ? (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0') : 'transparent',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.22s',
            }}>
                <svg width="12" height="12" fill="none"
                    stroke={hovered ? (isDark ? '#e2e8f0' : '#475569') : (isDark ? '#475569' : '#94a3b8')}
                    viewBox="0 0 24 24" style={{ transition: 'stroke 0.22s' }}>
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
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('landing-theme') as Theme) ?? 'light';
        }
        return 'dark';
    });

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('landing-theme', next);
            return next;
        });
    }, []);

    const isDark = theme === 'dark';

    const pageBg = isDark
        ? 'linear-gradient(135deg, #07091a 0%, #0d1230 50%, #07091a 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)';

    const heroTitle = isDark
        ? 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)'
        : 'linear-gradient(135deg, #0f172a 0%, #334155 100%)';

    const subtitleColor = isDark ? '#64748b' : '#64748b';
    const labelColor = isDark ? '#475569' : '#94a3b8';
    const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0';
    const footerBorder = isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0';
    const footerText = isDark ? '#e2e8f0' : '#1e293b';
    const footerSub = isDark ? '#334155' : '#94a3b8';

    return (
        <>
            {!splashDone && <CortexSplash onDone={() => setSplashDone(true)} theme={theme} />}

            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            <div style={{
                opacity: splashDone ? 1 : 0,
                transition: 'opacity 0.5s ease',
                minHeight: '100vh',
                background: pageBg,
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
                {/* Ambient blobs – only dark */}
                {isDark && (
                    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
                        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)' }} />
                        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.06) 0%, transparent 70%)' }} />
                    </div>
                )}

                {/* Grid */}
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
                    backgroundImage: isDark
                        ? 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)'
                        : 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Hero */}
                    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '72px 24px 48px', textAlign: 'center' }}>
                        <div style={{
                            width: '68px', height: '68px', borderRadius: '20px', margin: '0 auto 24px',
                            background: isDark
                                ? 'linear-gradient(135deg, rgba(29,78,216,0.15), rgba(14,165,233,0.15))'
                                : 'linear-gradient(135deg, rgba(29,78,216,0.08), rgba(14,165,233,0.08))',
                            border: `1px solid ${isDark ? 'rgba(14,165,233,0.2)' : 'rgba(14,165,233,0.25)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="34" height="34" fill="none" viewBox="0 0 24 24">
                                <defs>
                                    <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#1d4ed8"/>
                                        <stop offset="100%" stopColor="#0ea5e9"/>
                                    </linearGradient>
                                </defs>
                                <path stroke="url(#hg)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                            </svg>
                        </div>

                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            background: isDark ? 'rgba(14,165,233,0.08)' : 'rgba(14,165,233,0.06)',
                            border: `1px solid ${isDark ? 'rgba(14,165,233,0.18)' : 'rgba(14,165,233,0.2)'}`,
                            borderRadius: '999px', padding: '4px 14px', marginBottom: '18px',
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 7px #10b981', flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#7dd3fc' : '#0369a1', letterSpacing: '0.08em' }}>CORTEX OPS SYSTEMS</span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(34px, 5vw, 54px)', fontWeight: 900, lineHeight: 1.1,
                            background: heroTitle,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            margin: '0 0 14px', letterSpacing: '-0.02em',
                        }}>KK Nyilvántartó</h1>

                        <p style={{ color: subtitleColor, fontSize: '16px', maxWidth: '380px', margin: '0 auto' }}>
                            Válassza ki szervezetét a belépéshez
                        </p>
                    </div>

                    {/* Cards */}
                    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 48px' }}>
                        {tenants.length > 0 ? (
                            <>
                                <p style={{
                                    fontSize: '11px', fontWeight: 700, color: labelColor,
                                    letterSpacing: '0.1em', textTransform: 'uppercase',
                                    display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '18px',
                                }}>
                                    <svg width="13" height="13" fill="none" stroke="#0ea5e9" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                    </svg>
                                    Szervezetek
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(258px, 1fr))', gap: '14px' }}>
                                    {tenants.map(t => <TenantCard key={t.id} tenant={t} theme={theme} />)}
                                </div>
                            </>
                        ) : (
                            <div style={{
                                background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
                                borderRadius: '18px', padding: '52px 24px', textAlign: 'center', marginBottom: '36px',
                                boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
                            }}>
                                <p style={{ color: isDark ? '#64748b' : '#64748b', fontWeight: 600, marginBottom: '5px' }}>Még nincs felvett szervezet</p>
                                <p style={{ color: isDark ? '#475569' : '#94a3b8', fontSize: '14px' }}>A Super Admin felületen adjon hozzá szervezeteket.</p>
                            </div>
                        )}

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '36px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: dividerColor }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: labelColor, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                Rendszerszintű hozzáférés
                            </span>
                            <div style={{ flex: 1, height: '1px', background: dividerColor }} />
                        </div>

                        <div style={{ maxWidth: '340px' }}>
                            <SuperAdminCard theme={theme} />
                        </div>
                    </div>

                    {/* Footer */}
                    <footer style={{ borderTop: `1px solid ${footerBorder}`, padding: '18px 24px' }}>
                        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '9px',
                                    background: isDark
                                        ? 'linear-gradient(135deg, rgba(29,78,216,0.15), rgba(14,165,233,0.15))'
                                        : 'linear-gradient(135deg, rgba(29,78,216,0.08), rgba(14,165,233,0.08))',
                                    border: `1px solid ${isDark ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.2)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg width="14" height="14" fill="none" stroke="#0ea5e9" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                                    </svg>
                                </div>
                                <div>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: footerText, display: 'block', lineHeight: 1.3 }}>KK Nyilvántartó</span>
                                    <span style={{ fontSize: '11px', color: footerSub }}>&copy; {currentYear} Cortex Ops Systems</span>
                                </div>
                            </div>
                            <a
                                href="mailto:supportitsecurity@gmail.com"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: labelColor, textDecoration: 'none', transition: 'color 0.2s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = isDark ? '#94a3b8' : '#334155')}
                                onMouseLeave={e => (e.currentTarget.style.color = labelColor)}
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
            </div>
        </>
    );
}
