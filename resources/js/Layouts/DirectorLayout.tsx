import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import FeedbackWidget from '../Components/FeedbackWidget';
import type { PageProps } from '../types';

interface Props {
    children: ReactNode;
    title?: string;
}

export default function DirectorLayout({ children, title }: Props) {
    const page = usePage<PageProps>();
    const { auth, tenant, flash } = page.props;
    // A dashboard átadja; más oldalon nincs → nincs badge
    const unreadFeedback = (page.props as { unreadFeedback?: number }).unreadFeedback ?? 0;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [loaderFading, setLoaderFading] = useState(false);
    const mountTime = useRef(Date.now());
    const [successVisible, setSuccessVisible] = useState(!!flash?.success);
    const [errorVisible, setErrorVisible] = useState(!!flash?.error);
    const [successLeaving, setSuccessLeaving] = useState(false);
    const [errorLeaving, setErrorLeaving] = useState(false);
    const tenantName = tenant?.name ?? 'KK Nyilvántartó';
    const currentYear = new Date().getFullYear();
    const userName = auth.user?.name ?? '';
    const userInitial = userName ? userName.charAt(0) : '';

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => {
        const MIN = 480;
        const wait = Math.max(0, MIN - (Date.now() - mountTime.current));
        const t = setTimeout(() => {
            setLoaderFading(true);
            setTimeout(() => setLoaded(true), 260);
        }, wait);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (flash?.success) {
            setSuccessVisible(true);
            setSuccessLeaving(false);
            const t = setTimeout(() => {
                setSuccessLeaving(true);
                setTimeout(() => setSuccessVisible(false), 240);
            }, 4500);
            return () => clearTimeout(t);
        }
    }, [flash?.success]);

    useEffect(() => {
        if (flash?.error) {
            setErrorVisible(true);
            setErrorLeaving(false);
        }
    }, [flash?.error]);

    function dismissSuccess() { setSuccessLeaving(true); setTimeout(() => setSuccessVisible(false), 240); }
    function dismissError() { setErrorLeaving(true); setTimeout(() => setErrorVisible(false), 240); }

    function logout(e: React.FormEvent) {
        e.preventDefault();
        router.post(route('logout'));
    }

    const navLinks = [
        {
            route: 'director.dashboard',
            label: 'Vezérlőpult',
            icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
            matchRoute: 'director.dashboard',
        },
        {
            route: 'director.monthly-report',
            label: 'Havi riport',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            matchRoute: 'director.monthly-report',
        },
        {
            route: 'director.messages',
            label: 'Üzenetek',
            icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
            matchRoute: 'director.messages',
            badge: unreadFeedback,
        },
        {
            route: 'vezenyles.index',
            label: 'Vezénylés',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            matchRoute: 'vezenyles.index',
        },
    ];

    return (
        <div className={`pm-layout min-h-screen overflow-x-hidden bg-[#0f172a] flex flex-col${loaded ? ' pm-loaded app-loaded' : ''}`}>
            {title && <title>{title} – {tenantName}</title>}

            {/* Page loader */}
            {!loaded && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
                    style={{
                        background: '#0f172a',
                        opacity: loaderFading ? 0 : 1,
                        pointerEvents: loaderFading ? 'none' : 'auto',
                        transition: 'opacity 0.25s ease',
                    }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />
                    <div
                        className="absolute rounded-full"
                        style={{
                            top: '30%', left: '50%',
                            transform: 'translate(-50%,-50%)',
                            width: 280, height: 280,
                            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                        }}
                    />
                    <div className="relative flex flex-col items-center gap-5">
                        <div className="relative w-16 h-16">
                            <div
                                className="absolute rounded-full border-2"
                                style={{
                                    inset: -6,
                                    borderColor: 'transparent',
                                    borderTopColor: '#6366f1',
                                    borderRightColor: 'rgba(99,102,241,0.3)',
                                    animation: 'pmSpinRing 0.9s linear infinite',
                                }}
                            />
                            <div
                                className="absolute flex items-center justify-center rounded-xl"
                                style={{
                                    inset: 6,
                                    background: 'rgba(99,102,241,0.15)',
                                    border: '1px solid rgba(99,102,241,0.3)',
                                }}
                            >
                                <svg width="22" height="22" fill="none" stroke="#a5b4fc" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1"/>
                                </svg>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-sm" style={{ width: 120, height: 2, background: 'rgba(255,255,255,0.07)' }}>
                            <div
                                style={{
                                    height: '100%', width: '100%',
                                    background: 'linear-gradient(90deg, #6366f1, #a5b4fc)',
                                    borderRadius: 2,
                                    transformOrigin: 'left',
                                    animation: 'pmBarFill 0.5s cubic-bezier(.16,1,.3,1) forwards',
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Toast notifications */}
            <div className="fixed top-4 right-4 z-[998] flex flex-col gap-2 pointer-events-none">
                {successVisible && flash?.success && (
                    <div className={`pointer-events-auto relative flex items-center gap-3 px-4 py-3.5 bg-white border border-green-200 shadow-xl rounded-2xl min-w-[280px] max-w-sm overflow-hidden ${successLeaving ? 'animate-slide-out-r' : 'animate-slide-in-r'}`}>
                        <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 flex-1">{flash.success}</p>
                        <button onClick={dismissSuccess} className="text-slate-300 hover:text-slate-500 transition-colors ml-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                        <div className="absolute bottom-0 left-0 h-0.5 bg-green-400 rounded-full animate-toast-bar"/>
                    </div>
                )}
                {errorVisible && flash?.error && (
                    <div className={`pointer-events-auto relative flex items-center gap-3 px-4 py-3.5 bg-white border border-red-200 shadow-xl rounded-2xl min-w-[280px] max-w-sm overflow-hidden ${errorLeaving ? 'animate-slide-out-r' : 'animate-slide-in-r'}`}>
                        <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 flex-1">{flash.error}</p>
                        <button onClick={dismissError} className="text-slate-300 hover:text-slate-500 transition-colors ml-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                )}
            </div>

            <div className="app-page-enter flex flex-col flex-1">
                {/* Header */}
                <header
                    className="safe-top sticky top-0 z-30 transition-all duration-300"
                    style={scrolled ? {
                        background: 'rgba(15,23,42,0.82)',
                        backdropFilter: 'blur(20px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                    } : { background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-14">
                            {/* Brand */}
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1"/>
                                    </svg>
                                </div>
                                <div className="leading-tight">
                                    <Link href={route('director.dashboard')} className="text-sm font-bold text-white block hover:text-indigo-400 transition-colors">
                                        {tenantName}
                                    </Link>
                                    <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Területi Igazgató</span>
                                </div>
                            </div>

                            {/* Desktop nav */}
                            <nav className="hidden sm:flex items-center gap-1">
                                {navLinks.map((item) => {
                                    const active = route().current(item.matchRoute);
                                    return (
                                        <Link
                                            key={item.route}
                                            href={route(item.route)}
                                            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/>
                                            </svg>
                                            {item.label}
                                            {item.badge && item.badge > 0 ? (
                                                <span className="absolute -top-0.5 -right-0.5">
                                                    <span className="absolute -inset-0.5 rounded-full bg-rose-500 animate-ping opacity-40"/>
                                                    <span className="relative min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold leading-none px-0.5">{item.badge > 9 ? '9+' : item.badge}</span>
                                                </span>
                                            ) : null}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Right side */}
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:block"><FeedbackWidget /></div>
                                <div className="hidden sm:flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                                    <div className="w-6 h-6 rounded-lg bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-bold text-indigo-300 leading-none">{userInitial}</span>
                                    </div>
                                    <span className="text-xs font-medium text-slate-300">{userName}</span>
                                </div>
                                <form onSubmit={logout} className="hidden sm:block">
                                    <button type="submit" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                        Kilépés
                                    </button>
                                </form>
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(!mobileOpen)}
                                    className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    {mobileOpen ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile nav drawer */}
                    {mobileOpen && (
                        <div className="sm:hidden border-t border-white/5 bg-slate-900">
                            <div className="px-4 py-3 space-y-1">
                                <div className="flex items-center gap-2.5 px-3 py-2.5 mb-2 border-b border-white/5">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-bold text-indigo-300 leading-none">{userInitial}</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-300">{userName}</span>
                                </div>
                                {navLinks.map((item) => {
                                    const active = route().current(item.matchRoute);
                                    return (
                                        <Link
                                            key={item.route}
                                            href={route(item.route)}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/>
                                            </svg>
                                            {item.label}
                                            {item.badge && item.badge > 0 ? (
                                                <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1">{item.badge > 9 ? '9+' : item.badge}</span>
                                            ) : null}
                                        </Link>
                                    );
                                })}
                                <div className="pt-2 border-t border-white/5 mt-2">
                                    <div className="flex items-center gap-3 px-3 py-2.5">
                                        <FeedbackWidget />
                                        <span className="text-sm font-medium text-slate-400">Névtelen visszajelzés</span>
                                    </div>
                                    <form onSubmit={logout}>
                                        <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                            Kilépés
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </header>

                {/* Main */}
                <main className="flex-1 w-full overflow-x-hidden bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-slate-900 border-t border-white/5 px-4 sm:px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <span className="text-xs text-slate-500">KK Nyilvántartó &mdash; Területi Igazgató Portál &mdash; &copy; {currentYear}</span>
                        </div>
                        <a href="mailto:supportitsecurity@gmail.com" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">supportitsecurity@gmail.com</a>
                    </div>
                </footer>
            </div>
        </div>
    );
}
