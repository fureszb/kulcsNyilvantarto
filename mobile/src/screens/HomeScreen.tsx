import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHomeDashboard } from '../api/home';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../components/Card';
import type { HomeDashboard } from '../types';

// Ugyanaz a zaj-textúra data-URI, mint a webes Portal.tsx NOISE_BG-je —
// a sötét hero-kártya felületén ez adja a "nem sima gradiens" organikus
// érzetet a webes verzióval megegyezően.
const NOISE_BG =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

function CountUp({ target, duration = 700 }: { target: number; duration?: number }) {
    const [val, setVal] = useState(0);
    const started = useRef(false);
    useEffect(() => {
        if (started.current || target === 0) { setVal(target); return; }
        started.current = true;
        let start: number | null = null;
        function step(ts: number) {
            if (start === null) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            setVal(Math.round(p * target));
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }, [target, duration]);
    return <>{val}</>;
}

function StatChip({ icon, label, value, tone = 'default' }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone?: 'default' | 'emerald' | 'rose' }) {
    const toneClasses = tone === 'emerald'
        ? 'bg-emerald-500/15 border-emerald-400/35'
        : tone === 'rose'
        ? 'bg-white/[0.13] border-rose-400/35'
        : 'bg-white/[0.13] border-white/25';
    const iconToneClasses = tone === 'emerald'
        ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-400'
        : tone === 'rose'
        ? 'bg-rose-500/20 border-rose-400/30 text-rose-400'
        : 'bg-blue-500/20 border-blue-400/30 text-blue-400';
    const valueToneClasses = tone === 'emerald' ? 'text-emerald-400' : tone === 'rose' ? 'text-rose-400' : 'text-white';

    return (
        <div className={`flex items-center gap-3 backdrop-blur-sm rounded-xl px-4 py-3 border ${toneClasses}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${iconToneClasses}`}>{icon}</div>
            <div>
                <p className="text-[10px] text-slate-400 leading-none mb-1">{label}</p>
                <p className={`text-lg font-extrabold leading-none ${valueToneClasses}`}>{value}</p>
            </div>
        </div>
    );
}

export function HomeScreen() {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState<HomeDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        // Hiba esetén csendben marad üres dashboard-dal — ez kiegészítő infó,
        // nem blokkoló (ugyanaz a döntés, mint a testvér Kotlin app HomeViewModel-jében).
        getHomeDashboard()
            .then((data) => { if (!cancelled) setDashboard(data); })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="px-4 py-5 space-y-5">
            {/* ── Aurora hero — a webes Portal.tsx sötét gradiens-kártyájának
                mobil-változata: ugyanaz a szín/zaj/glassmorphism nyelvezet,
                de a csak-hover mikrointerakciók (parallax blob, tilt) nélkül,
                mert azok érintőképernyőn nem értelmezhetők. */}
            <div
                className="relative overflow-hidden rounded-2xl shadow-xl"
                style={{ background: 'linear-gradient(135deg,#0d1829 0%,#0f1f3d 40%,#0d1829 100%)' }}
            >
                <div className="absolute top-[-60%] left-[-20%] w-[80%] h-[220%] bg-blue-600/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-50%] right-[-15%] w-[70%] h-[180%] bg-teal-900/40 rounded-full blur-3xl pointer-events-none" />
                <div
                    className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.06, backgroundImage: NOISE_BG, backgroundSize: '160px 160px', mixBlendMode: 'screen' }} />

                <div className="relative z-10 px-5 py-6">
                    <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-2">
                        <span className="relative inline-flex">
                            <span className="absolute -inset-1.5 rounded-full bg-emerald-400/50 animate-ping" />
                            <span className="relative inline-block w-2 h-2 rounded-full bg-emerald-400" />
                        </span>
                        Üdvözlöm
                    </p>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight">{user?.name}</h1>
                    <p className="text-slate-400 mt-1 text-xs">
                        {new Date().toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    {dashboard && (
                        <div className="flex flex-wrap gap-2.5 mt-5">
                            {dashboard.presence.has_location && (
                                <StatChip
                                    tone={dashboard.presence.on_duty ? 'emerald' : 'default'}
                                    label="Mai állapotod"
                                    value={dashboard.presence.on_duty ? `Szolgálatban — ${dashboard.presence.schedule_label}` : 'Nincs beosztva'}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                            )}
                            <StatChip
                                label="Ma ellenőrzött"
                                value={<CountUp target={dashboard.checks_today} />}
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                }
                            />
                            <StatChip
                                label="Elvégzett oktatás"
                                value={<CountUp target={dashboard.trainings_completed} />}
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                }
                            />
                            {dashboard.unread_messages_count > 0 && (
                                <StatChip
                                    tone="rose"
                                    label="Olvasatlan"
                                    value={<CountUp target={dashboard.unread_messages_count} />}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    }
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="skeleton h-32 w-full" />
            ) : dashboard ? (
                <>
                    {/* ── Modulok — a webes Portal.tsx színes accent-kártyáinak
                        mobil-megfelelője: csak koppintható front-face, hover/
                        tilt/flip/drag-rendezés nélkül (érintőn nincs hover-állapot). */}
                    <div>
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Modulok</h2>
                        <Link
                            to="/nfc"
                            className="group relative flex flex-col overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm active:scale-[0.98] transition-transform duration-150 p-5"
                        >
                            <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center border bg-blue-50 border-blue-100 text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.5 8.5a5 5 0 017 7M6 6a9 9 0 0112 12M12 12a1 1 0 100 2 1 1 0 000-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">NFC ellenőrzés</h3>
                            <p className="text-slate-500 text-sm mt-1">Checkpoint-matricák beolvasása helyszíni bejáráskor.</p>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-sm font-semibold text-blue-600">Ellenőrzés indítása</span>
                                <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {dashboard.venues.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2.5">
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {dashboard.venue_mode === 'buildings' ? 'Helyszínek a házban' : 'Bérlők az irodaházban'}
                                </h2>
                                <span className="text-xs text-slate-400 tabular-nums">{dashboard.venues.length} db</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {dashboard.venues.map((venue) => (
                                    <div key={venue.id} className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
                                        <div className="flex items-start justify-between gap-2 mb-2.5">
                                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                {venue.logo_path ? (
                                                    <img src={`/storage/${venue.logo_path}`} className="w-full h-full object-contain p-1" alt="" />
                                                ) : venue.icon ? (
                                                    <span className="text-lg leading-none">{venue.icon}</span>
                                                ) : (
                                                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold leading-none">
                                                {venue.items_count}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{venue.name}</p>
                                        {venue.responsible_person && (
                                            <p className="text-[11px] text-slate-400 mt-1 truncate">{venue.responsible_person}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {dashboard.recent_activity.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Legutóbbi aktivitás</h2>
                            <Card className="divide-y divide-slate-100">
                                {dashboard.recent_activity.map((item, i) => (
                                    <div key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                                        <span className="text-sm text-slate-700">{item.description}</span>
                                        <span className="text-xs text-slate-400 shrink-0">{item.time_label}</span>
                                    </div>
                                ))}
                            </Card>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-sm text-slate-500">A kezdőlap adatai jelenleg nem tölthetők be.</p>
            )}
        </div>
    );
}
