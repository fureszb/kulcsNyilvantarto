import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import FlashMessage from '../Components/FlashMessage';
import MobileNavDrawer from '../Components/MobileNavDrawer';
import AppHeader from '../Components/AppHeader';
import NotificationBell from '../Components/NotificationBell';
import type { PageProps } from '../types';

interface Props {
    children: ReactNode;
    title?: string;
}

export default function SecurityLeadLayout({ children, title }: Props) {
    const page = usePage<PageProps>();
    const { auth, tenant } = page.props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [loaderFading, setLoaderFading] = useState(false);
    const mountTime = useRef(Date.now());
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

    function logout(e: React.FormEvent) {
        e.preventDefault();
        router.post(route('logout'));
    }

    const navLinks = [
        {
            route: 'security-lead.dashboard',
            label: 'Áttekintés',
            icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
            matchRoute: 'security-lead.dashboard',
        },
        {
            route: 'notes.index',
            label: 'Váltóüzenetek',
            icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
            matchRoute: 'notes.*',
        },
        {
            route: 'messages.index',
            label: 'Igazgatói üzenetek',
            icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
            matchRoute: 'messages.*',
        },
        {
            route: 'vezenyles.index',
            label: 'Vezénylés',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            matchRoute: 'vezenyles.*',
        },
        {
            route: 'security-lead.workers',
            label: 'Emberek',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            matchRoute: 'security-lead.workers*',
        },
        {
            route: 'ai.chat',
            label: 'AI',
            icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
            matchRoute: 'ai.*',
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
                            background: 'radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 70%)',
                        }}
                    />
                    <div className="relative flex flex-col items-center gap-5">
                        <div className="relative w-16 h-16">
                            <div
                                className="absolute rounded-full border-2"
                                style={{
                                    inset: -6,
                                    borderColor: 'transparent',
                                    borderTopColor: '#06b6d4',
                                    borderRightColor: 'rgba(6,182,212,0.3)',
                                    animation: 'pmSpinRing 0.9s linear infinite',
                                }}
                            />
                            <div
                                className="absolute flex items-center justify-center rounded-xl"
                                style={{
                                    inset: 6,
                                    background: 'rgba(6,182,212,0.15)',
                                    border: '1px solid rgba(6,182,212,0.3)',
                                }}
                            >
                                <svg width="22" height="22" fill="none" stroke="#67e8f9" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                </svg>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-sm" style={{ width: 120, height: 2, background: 'rgba(255,255,255,0.07)' }}>
                            <div
                                style={{
                                    height: '100%', width: '100%',
                                    background: 'linear-gradient(90deg, #06b6d4, #67e8f9)',
                                    borderRadius: 2,
                                    transformOrigin: 'left',
                                    animation: 'pmBarFill 0.5s cubic-bezier(.16,1,.3,1) forwards',
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <FlashMessage />

            <div className="app-page-enter flex flex-col flex-1">
                {/* Header */}
                <AppHeader
                    brandHref={route('security-lead.dashboard')}
                    brandLabel="Biztonsági Vezető"
                    brandIcon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    navItems={headerNavItems}
                    mobileMenuOpen={mobileOpen}
                    onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
                    hiddenFrom="lg"
                >
                    <NotificationBell />
                    <div className="relative hidden sm:block">
                        <button
                            type="button"
                            onClick={() => setProfileMenuOpen(v => !v)}
                            className="flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 hover:bg-white/20 transition-colors cursor-pointer"
                        >
                            <div className="w-6 h-6 rounded-lg bg-cyan-500/30 border border-cyan-500/40 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-cyan-300 leading-none">{userInitial}</span>
                            </div>
                            <span className="text-xs font-medium text-white">{userName}</span>
                            <svg className={`w-3 h-3 text-white/60 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>

                        {profileMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                                <div className="absolute right-0 top-11 z-50 w-52 py-1.5 rounded-xl bg-slate-800 border border-white/10 shadow-xl overflow-hidden">
                                    <Link
                                        href={route('profile.edit')}
                                        onClick={() => setProfileMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                        Profil szerkesztése
                                    </Link>
                                    <Link
                                        href={route('security-lead.team')}
                                        onClick={() => setProfileMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                        Csapat
                                    </Link>
                                </div>
                            </>
                        )}
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
                    hiddenFrom="lg"
                    brandLabel="Biztonsági Vezető"
                    items={headerNavItems}
                >
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/75">
                        <span className="w-8 h-8 rounded-lg bg-cyan-500/30 border border-cyan-500/40 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-cyan-300 leading-none">{userInitial}</span>
                        </span>
                        {userName}
                    </div>
                    <Link href={route('profile.edit')} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 transition-colors">
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        </span>
                        Profil szerkesztése
                    </Link>
                    <Link href={route('security-lead.team')} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 transition-colors">
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </span>
                        Csapat
                    </Link>
                    <Link href={route('home')} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 transition-colors">
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                        </span>
                        Kezdőlap (dolgozói nézet)
                    </Link>
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
                            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <span className="text-xs text-slate-500">KK Nyilvántartó &mdash; Biztonsági Vezetői Portál &mdash; &copy; {currentYear}</span>
                        </div>
                        <a href="mailto:supportitsecurity@gmail.com" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">supportitsecurity@gmail.com</a>
                    </div>
                </footer>
            </div>
        </div>
    );
}
