import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import type { TenantRecord } from '../types';

interface Props {
    tenants: TenantRecord[];
}

function CortexSplash({ onDone }: { onDone: () => void }) {
    const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), 900);
        const t2 = setTimeout(() => setPhase('out'), 1800);
        const t3 = setTimeout(() => onDone(), 2700);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onDone]);

    const opacity = phase === 'out' ? 0 : 1;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: '#07091a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
        }}>
            <div style={{ opacity, transition: 'opacity 0.9s cubic-bezier(0.4,0,0.2,1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <span style={{
                    fontSize: 'clamp(64px, 12vw, 120px)',
                    fontWeight: 900,
                    letterSpacing: '0.18em',
                    background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
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
                    background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                    borderRadius: '2px',
                    opacity: 0.6,
                }} />
            </div>
        </div>
    );
}

function TenantCard({ tenant }: { tenant: TenantRecord }) {
    const [hovered, setHovered] = useState(false);

    return (
        <a
            href={`/${tenant.slug}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'block', textDecoration: 'none',
                background: hovered ? 'rgba(96,165,250,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${hovered ? 'rgba(96,165,250,0.25)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '20px',
                padding: '24px',
                transition: 'all 0.25s ease',
                transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(96,165,250,0.1)' : 'none',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                opacity: hovered ? 1 : 0, transition: 'opacity 0.25s',
                borderRadius: '20px 20px 0 0',
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{
                    width: '46px', height: '46px', borderRadius: '14px',
                    background: hovered ? 'rgba(96,165,250,0.12)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${hovered ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.25s',
                }}>
                    <svg width="22" height="22" fill="none" stroke={hovered ? '#60a5fa' : '#475569'} viewBox="0 0 24 24" style={{ transition: 'stroke 0.25s' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                </div>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                    background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399',
                }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
                    Aktív
                </span>
            </div>

            <h2 style={{
                fontSize: '15px', fontWeight: 700, lineHeight: 1.3,
                color: hovered ? '#e2e8f0' : '#94a3b8',
                transition: 'color 0.25s', marginBottom: '4px',
            }}>
                {tenant.name}
            </h2>
            <p style={{ fontSize: '11px', color: '#334155', fontFamily: 'monospace' }}>{tenant.slug}</p>

            <div style={{
                marginTop: '20px', paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: hovered ? '#60a5fa' : '#475569', transition: 'color 0.25s' }}>
                    Belépés
                </span>
                <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: hovered ? 'linear-gradient(135deg, #60a5fa, #a78bfa)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${hovered ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.25s',
                }}>
                    <svg width="13" height="13" fill="none" stroke={hovered ? '#fff' : '#475569'} viewBox="0 0 24 24" style={{ transition: 'stroke 0.25s' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </a>
    );
}

function SuperAdminCard() {
    const [hovered, setHovered] = useState(false);

    return (
        <Link
            href={route('super-admin.login')}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                textDecoration: 'none',
                background: hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '18px', padding: '18px 20px',
                transition: 'all 0.25s ease',
                transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.25)' : 'none',
                cursor: 'pointer',
            }}
        >
            <div style={{
                width: '44px', height: '44px', borderRadius: '13px', flexShrink: 0,
                background: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
            }}>
                <svg width="22" height="22" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '3px' }}>Super Admin</p>
                <p style={{ fontSize: '12px', color: '#475569' }}>Szervezetek és rendszerbeállítások</p>
            </div>
            <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: hovered ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
            }}>
                <svg width="13" height="13" fill="none" stroke={hovered ? '#e2e8f0' : '#475569'} viewBox="0 0 24 24" style={{ transition: 'stroke 0.25s' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
            </div>
        </Link>
    );
}

export default function Landing({ tenants }: Props) {
    const currentYear = new Date().getFullYear();
    const [splashDone, setSplashDone] = useState(false);

    return (
        <>
            {!splashDone && <CortexSplash onDone={() => setSplashDone(true)} />}

            <div style={{
                opacity: splashDone ? 1 : 0,
                transition: 'opacity 0.6s ease',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #07091a 0%, #0d1230 50%, #07091a 100%)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
                {/* Ambient blobs */}
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
                    <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)' }} />
                    <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)' }} />
                    <div style={{ position: 'absolute', top: '40%', left: '40%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.04) 0%, transparent 70%)' }} />
                </div>

                {/* Grid overlay */}
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Hero */}
                    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '72px 24px 56px', textAlign: 'center' }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '20px', margin: '0 auto 28px',
                            background: 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(167,139,250,0.15))',
                            border: '1px solid rgba(96,165,250,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                                <defs>
                                    <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#60a5fa"/>
                                        <stop offset="100%" stopColor="#a78bfa"/>
                                    </linearGradient>
                                </defs>
                                <path stroke="url(#heroGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                            </svg>
                        </div>

                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.18)',
                            borderRadius: '999px', padding: '4px 14px', marginBottom: '20px',
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }} />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em' }}>CORTEX OPS SYSTEMS</span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1,
                            background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            margin: '0 0 16px', letterSpacing: '-0.02em',
                        }}>
                            KK Nyilvántartó
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '17px', maxWidth: '420px', margin: '0 auto' }}>
                            Válassza ki szervezetét a belépéshez
                        </p>
                    </div>

                    {/* Tenant cards */}
                    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 48px' }}>
                        {tenants.length > 0 ? (
                            <>
                                <p style={{
                                    fontSize: '11px', fontWeight: 700, color: '#475569',
                                    letterSpacing: '0.1em', textTransform: 'uppercase',
                                    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
                                }}>
                                    <svg width="14" height="14" fill="none" stroke="#60a5fa" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                    </svg>
                                    Szervezetek
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                                    {tenants.map((t) => (
                                        <TenantCard key={t.id} tenant={t} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '20px', padding: '56px 24px', textAlign: 'center', marginBottom: '40px',
                            }}>
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 16px',
                                    background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg width="28" height="28" fill="none" stroke="rgba(255,255,255,0.2)" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                    </svg>
                                </div>
                                <p style={{ color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>Még nincs felvett szervezet</p>
                                <p style={{ color: '#475569', fontSize: '14px' }}>A Super Admin felületen adjon hozzá szervezeteket.</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '40px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                Rendszerszintű hozzáférés
                            </span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                        </div>

                        <div style={{ maxWidth: '360px' }}>
                            <SuperAdminCard />
                        </div>
                    </div>

                    {/* Footer */}
                    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px' }}>
                        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(167,139,250,0.15))',
                                    border: '1px solid rgba(96,165,250,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg width="16" height="16" fill="none" stroke="#60a5fa" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                                    </svg>
                                </div>
                                <div>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', display: 'block', lineHeight: 1.3 }}>KK Nyilvántartó</span>
                                    <span style={{ fontSize: '11px', color: '#334155' }}>&copy; {currentYear} Cortex Ops Systems</span>
                                </div>
                            </div>
                            <a
                                href="mailto:supportitsecurity@gmail.com"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: '#475569', textDecoration: 'none' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                            >
                                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
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
