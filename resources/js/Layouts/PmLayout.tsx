import { useState, useEffect, useRef, type ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';
import MobileNavDrawer from '../Components/MobileNavDrawer';
import AppHeader from '../Components/AppHeader';
import NotificationBell from '../Components/NotificationBell';
import { getEcho } from '../echo';
import type { PageProps } from '../types';

interface Props {
    children: ReactNode;
    title?: string;
}

export default function PmLayout({ children, title }: Props) {
    const page = usePage<PageProps>();
    const { auth, tenant, flash } = page.props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loaded,       setLoaded]       = useState(false);
    const [loaderFading, setLoaderFading] = useState(false);
    const [newReplies,   setNewReplies]   = useState(0);
    const mountTime = useRef(Date.now());
    const [successVisible, setSuccessVisible] = useState(!!flash?.success);
    const [errorVisible,   setErrorVisible]   = useState(!!flash?.error);
    const [successLeaving, setSuccessLeaving] = useState(false);
    const [errorLeaving,   setErrorLeaving]   = useState(false);
    const tenantName = tenant?.name ?? 'KK Nyilvántartó';
    const currentYear = new Date().getFullYear();
    const userName = auth.user?.name ?? '';
    const userInitial = userName ? userName.charAt(0) : '';

    useEffect(() => {
        if (!tenant?.slug || !auth.user?.id) return;
        const echo = getEcho(tenant.slug);
        const ch = echo.private(`tenant.${tenant.slug}.${auth.user.id}`);
        ch.listen('.new-pm-reply', () => {
            setNewReplies(n => n + 1);
            if (route().current('pm.messages*')) {
                router.reload({ only: ['messages'] });
            }
        });
        return () => { ch.stopListening('.new-pm-reply'); };
    }, [tenant?.slug, auth.user?.id]);

    useEffect(() => {
        if (route().current('pm.messages*')) setNewReplies(0);
    }, []);

    useEffect(() => {
        const MIN  = 480;
        const wait = Math.max(0, MIN - (Date.now() - mountTime.current));
        const t    = setTimeout(() => {
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
    function dismissError()   { setErrorLeaving(true);   setTimeout(() => setErrorVisible(false),   240); }

    function logout(e: React.FormEvent) {
        e.preventDefault();
        router.post(route('logout'));
    }

    const navLinks = [
        {
            route: 'pm.dashboard',
            label: 'Dolgozók',
            icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
            matchRoute: 'pm.dashboard',
        },
        {
            route: 'pm.security',
            label: 'Napi Jelentések',
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            matchRoute: 'pm.security',
        },
        {
            route: 'pm.checks',
            label: 'Kulcsellenőrzések',
            icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
            matchRoute: 'pm.checks',
        },
        {
            route: 'pm.messages',
            label: 'Üzenetek',
            icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            matchRoute: 'pm.messages*',
            badge: newReplies,
        },
        {
            route: 'documents.index',
            label: 'Dokumentumok',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            matchRoute: 'documents.*',
        },
        {
            route: 'presence.index',
            label: 'Ki van bent',
            icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6-4a3 3 0 11-6 0 3 3 0 016 0z',
            matchRoute: 'presence.index',
        },
        {
            route: 'nfc-log.index',
            label: 'NFC napló',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-4 8h4m-4 4h4m-6-4h.01M9 16h.01',
            matchRoute: 'nfc-log.index',
        },
    ];

    const headerNavItems = navLinks.map(item => ({
        key: item.route,
        href: route(item.route),
        label: item.label,
        icon: item.icon,
        active: route().current(item.matchRoute),
        badge: item.badge,
        badgeColor: 'bg-amber-500',
    }));

    return (
        <div className={`pm-layout min-h-screen overflow-x-hidden bg-[#0f172a] flex flex-col${loaded ? ' pm-loaded app-loaded' : ''}`}>
            {title && <title>{title} – {tenantName}</title>}

            {/* PM Page Loader */}
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
                    {/* Grid */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />
                    {/* Amber glow blob */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            top: '30%', left: '50%',
                            transform: 'translate(-50%,-50%)',
                            width: 280, height: 280,
                            background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)',
                        }}
                    />
                    {/* Spinner + progress bar */}
                    <div className="relative flex flex-col items-center gap-5">
                        {/* Spinning ring + icon */}
                        <div className="relative w-16 h-16">
                            <div
                                className="absolute rounded-full border-2"
                                style={{
                                    inset: -6,
                                    borderColor: 'transparent',
                                    borderTopColor: '#f59e0b',
                                    borderRightColor: 'rgba(245,158,11,0.3)',
                                    animation: 'pmSpinRing 0.9s linear infinite',
                                }}
                            />
                            <div
                                className="absolute flex items-center justify-center rounded-xl"
                                style={{
                                    inset: 6,
                                    background: 'rgba(245,158,11,0.15)',
                                    border: '1px solid rgba(245,158,11,0.3)',
                                }}
                            >
                                <svg width="22" height="22" fill="none" stroke="#fbbf24" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div
                            className="overflow-hidden rounded-sm"
                            style={{ width: 120, height: 2, background: 'rgba(255,255,255,0.07)' }}
                        >
                            <div
                                style={{
                                    height: '100%', width: '100%',
                                    background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                                    borderRadius: 2,
                                    transformOrigin: 'left',
                                    animation: 'pmBarFill 0.5s cubic-bezier(.16,1,.3,1) forwards',
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Toast notifications – fixed, stays outside animated wrapper */}
            <div className="fixed top-4 right-4 z-[998] flex flex-col gap-2 pointer-events-none">
                {successVisible && flash?.success && (
                    <div className={`pointer-events-auto relative flex items-center gap-3 px-4 py-3.5 bg-white border border-green-200 shadow-xl rounded-2xl min-w-[280px] max-w-sm overflow-hidden ${successLeaving ? 'animate-slide-out-r' : 'animate-slide-in-r'}`}>
                        <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                            </svg>
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
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 flex-1">{flash.error}</p>
                        <button onClick={dismissError} className="text-slate-300 hover:text-slate-500 transition-colors ml-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Animated wrapper: header + main + footer together */}
            <div className="app-page-enter flex flex-col flex-1">

            {/* Header */}
            <AppHeader
                brandHref={route('pm.dashboard')}
                brandLabel={tenantName}
                brandSublabel="Property Manager"
                brandIcon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                navItems={headerNavItems}
                mobileMenuOpen={mobileOpen}
                onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
            >
                <NotificationBell />
                {/* User chip – desktop */}
                <div className="hidden sm:flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-full px-3 py-1.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/30 border border-amber-500/40 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-amber-300 leading-none">{userInitial}</span>
                    </div>
                    <span className="text-xs font-medium text-white">{userName}</span>
                </div>
                {/* Logout – desktop */}
                <form onSubmit={logout} className="hidden sm:block">
                    <button type="submit" title="Kilépés" aria-label="Kilépés" className="flex w-8 h-8 rounded-full items-center justify-center text-white/80 hover:text-red-300 hover:bg-white/10 transition-colors cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                    </button>
                </form>
            </AppHeader>

            <MobileNavDrawer
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                brandLabel={tenantName}
                brandSublabel="Property Manager"
                items={headerNavItems}
            >
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/75">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/30 border border-amber-500/40 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-amber-300 leading-none">{userInitial}</span>
                    </span>
                    {userName}
                </div>
                <form onSubmit={logout}>
                    <button type="submit" className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                        </span>
                        Kilépés
                    </button>
                </form>
            </MobileNavDrawer>

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
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <span className="text-xs text-slate-500">KK Nyilvántartó &mdash; PM Portál &mdash; &copy; {currentYear}</span>
                    </div>
                    <a href="mailto:supportitsecurity@gmail.com" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">supportitsecurity@gmail.com</a>
                </div>
            </footer>

            </div>{/* /app-page-enter */}
        </div>
    );
}
