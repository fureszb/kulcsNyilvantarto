import { useState, useEffect, useRef, type ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';
import MobileNavDrawer from '../Components/MobileNavDrawer';
import AppHeader from '../Components/AppHeader';
import type { PageProps } from '../types';

interface Props {
    children: ReactNode;
    title?: string;
}

export default function DirectorLayout({ children, title }: Props) {
    const page = usePage<PageProps>();
    const { auth, tenant, flash } = page.props;

    const [mobileOpen, setMobileOpen] = useState(false);
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
            route: 'pm.messages',
            label: 'Üzenetek',
            icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
            matchRoute: 'pm.messages*',
        },
        {
            route: 'vezenyles.index',
            label: 'Vezénylés',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            matchRoute: 'vezenyles.index',
        },
        {
            route: 'documents.index',
            label: 'Dokumentumok',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            matchRoute: 'documents.*',
        },
    ];

    const headerNavItems = navLinks.map(item => ({
        key: item.route,
        href: route(item.route),
        label: item.label,
        icon: item.icon,
        active: route().current(item.matchRoute),
    }));

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
                <AppHeader
                    brandHref={route('director.dashboard')}
                    brandLabel="Területi Igazgató"
                    brandIcon="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1"
                    navItems={headerNavItems}
                    mobileMenuOpen={mobileOpen}
                    onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
                >
                    <div className="hidden sm:flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-full px-3 py-1.5">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-indigo-300 leading-none">{userInitial}</span>
                        </div>
                        <span className="text-xs font-medium text-white">{userName}</span>
                    </div>
                    <form onSubmit={logout} className="hidden sm:block">
                        <button type="submit" title="Kilépés" aria-label="Kilépés" className="flex w-8 h-8 rounded-full items-center justify-center text-white/80 hover:text-red-300 hover:bg-white/10 transition-colors cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        </button>
                    </form>
                </AppHeader>

                <MobileNavDrawer
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    brandLabel="Területi Igazgató"
                    items={headerNavItems}
                >
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/75">
                        <span className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-indigo-300 leading-none">{userInitial}</span>
                        </span>
                        {userName}
                    </div>
                    <form onSubmit={logout}>
                        <button type="submit" className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
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
