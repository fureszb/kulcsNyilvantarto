import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import FlashMessage from '../Components/FlashMessage';
import PushToggle from '../Components/PushToggle';
import FeedbackWidget from '../Components/FeedbackWidget';
import { getEcho } from '../echo';
import type { PageProps } from '../types';

function LiveClock() {
    const [time, setTime] = useState('');
    useEffect(() => {
        function tick() {
            setTime(new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }));
        }
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-xs font-semibold text-slate-300 tabular-nums">{time}</span>
        </div>
    );
}

interface Props {
    children: ReactNode;
    title?: string;
}

export default function AppLayout({ children, title }: Props) {
    const page = usePage<PageProps>();
    const { auth, tenant, nav } = page.props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [extraMessages, setExtraMessages] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channelRef = useRef<any>(null);
    const user = auth.user;

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => {
        if (!tenant?.slug || !user?.id) return;
        const echo = getEcho(tenant.slug);
        const ch = echo.private(`tenant.${tenant.slug}.${user.id}`);
        channelRef.current = ch;
        ch.listen('.new-pm-message', () => {
            setExtraMessages(n => n + 1);
            if (route().current('messages.*')) {
                router.reload({ only: ['messages'] });
            }
        });
        ch.listen('.new-pm-reply', () => {
            setExtraMessages(n => n + 1);
            if (route().current('messages.*')) {
                router.reload({ only: ['messages'] });
            }
        });
        return () => {
            ch.stopListening('.new-pm-message');
            ch.stopListening('.new-pm-reply');
        };
    }, [tenant?.slug, user?.id]);

    useEffect(() => { setExtraMessages(0); }, [nav?.newMessages]);

    const currentYear = new Date().getFullYear();
    const tenantName = tenant?.name ?? 'KK Nyilvántartó';

    function logout(e: React.FormEvent) {
        e.preventDefault();
        router.post(route('logout'));
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-800 antialiased flex flex-col">
            {title && <title>{title} – {tenantName}</title>}

            <header
                className="safe-top sticky top-0 z-30 transition-all duration-300"
                style={scrolled ? {
                    background: 'rgba(15,23,42,0.82)',
                    backdropFilter: 'blur(20px) saturate(1.4)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                } : { background: '#0f172a' }}
            >
                <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 border-b border-white/5">
                        {/* Brand */}
                        <Link href={route('home')} className="flex items-center gap-2.5 group shrink-0">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg group-hover:bg-blue-500 transition-colors shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                                </svg>
                            </div>
                            <span className="text-white font-bold text-sm hidden sm:block">{tenantName}</span>
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden sm:flex items-center gap-0.5">
                            {[
                                { href: route('home'), active: route().current('home'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Kezdőlap', badge: 0, badgeColor: '' },
                                { href: route('security.index'), active: route().current('security.*'), icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Napi Jelentés', badge: 0, badgeColor: '' },
                                ...(!user?.is_property_manager ? [
                                    { href: route('notes.index'), active: route().current('notes.*'), icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', label: 'Váltóüzenetek', badge: nav?.newNotes ?? 0, badgeColor: 'bg-rose-500' },
                                    { href: route('messages.index'), active: route().current('messages.*'), icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'PM üzenetek', badge: (nav?.newMessages ?? 0) + extraMessages, badgeColor: 'bg-amber-500' },
                                    { href: route('ai.chat'), active: route().current('ai.*'), icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', label: 'AI', badge: 0, badgeColor: '' },
                                ] : []),
                                ...(user && !user.is_property_manager ? [
                                    { href: route('vezenyles.index'), active: route().current('vezenyles.*'), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Vezénylés', badge: 0, badgeColor: '' },
                                ] : []),
                            ].map(nl => (
                                <Link key={nl.href} href={nl.href}
                                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${nl.active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={nl.icon}/></svg>
                                    {nl.label}
                                    {nl.badge > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5">
                                            <span className={`absolute -inset-0.5 rounded-full ${nl.badgeColor} animate-ping opacity-40`}/>
                                            <span className={`relative min-w-[14px] h-[14px] flex items-center justify-center rounded-full ${nl.badgeColor} text-white text-[9px] font-bold leading-none px-0.5`}>{nl.badge > 9 ? '9+' : nl.badge}</span>
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-1.5">
                            <LiveClock />
                            <PushToggle />

                            {user && (
                                <>
                                    <div className="hidden sm:block"><FeedbackWidget /></div>
                                    <Link href={route('profile.edit')}
                                        className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 hover:bg-white/10 transition-colors">
                                        <div className="w-5 h-5 rounded-md bg-blue-500/30 border border-blue-500/40 flex items-center justify-center shrink-0">
                                            <span className="text-[9px] font-bold text-blue-300 leading-none">{user.name.charAt(0)}</span>
                                        </div>
                                        <span className="text-xs font-medium text-slate-300 max-w-[100px] truncate">{user.name}</span>
                                    </Link>
                                    <form onSubmit={logout} className="hidden sm:block">
                                        <button type="submit" className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                            Kilépés
                                        </button>
                                    </form>
                                    {user.is_admin && (
                                        <Link href={route('admin.settings.edit')}
                                            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors bg-white/5 border border-white/10 ${route().current('admin.*') ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                            Admin
                                        </Link>
                                    )}
                                </>
                            )}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="sm:hidden border-t border-white/10 px-4 py-3 space-y-1">
                        {[
                            { href: route('home'), active: route().current('home'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Kezdőlap', badge: 0, badgeColor: '' },
                            { href: route('security.index'), active: route().current('security.*'), icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Napi Jelentés', badge: 0, badgeColor: '' },
                            ...(!user?.is_property_manager ? [
                                { href: route('notes.index'), active: route().current('notes.*'), icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', label: 'Váltóüzenetek', badge: nav?.newNotes ?? 0, badgeColor: 'bg-rose-500' },
                                { href: route('messages.index'), active: route().current('messages.*'), icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'PM üzenetek', badge: (nav?.newMessages ?? 0) + extraMessages, badgeColor: 'bg-amber-500' },
                                { href: route('ai.chat'), active: route().current('ai.*'), icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', label: 'AI', badge: 0, badgeColor: '' },
                            ] : []),
                            ...(user && !user.is_property_manager ? [
                                { href: route('vezenyles.index'), active: route().current('vezenyles.*'), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Vezénylés', badge: 0, badgeColor: '' },
                            ] : []),
                        ].map(nl => (
                            <Link key={nl.href} href={nl.href} onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${nl.active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={nl.icon}/></svg>
                                {nl.label}
                                {nl.badge > 0 && (
                                    <span className="ml-auto relative">
                                        <span className={`absolute -inset-0.5 rounded-full ${nl.badgeColor} animate-ping opacity-50`}/>
                                        <span className={`relative min-w-[1.4rem] h-[1.4rem] flex items-center justify-center rounded-full ${nl.badgeColor} text-white text-[10px] font-bold leading-none px-1`}>{nl.badge > 9 ? '9+' : nl.badge}</span>
                                    </span>
                                )}
                            </Link>
                        ))}
                        {user && (
                            <>
                                <div className="flex items-center gap-3 px-3 py-2.5">
                                    <FeedbackWidget />
                                    <span className="text-sm font-medium text-slate-400">Névtelen visszajelzés</span>
                                </div>
                                <Link href={route('profile.edit')} onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                    {user.name}
                                </Link>
                                <form onSubmit={logout}>
                                    <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                        Kilépés
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                )}
            </header>

            <main className="app-loaded flex-1 max-w-7xl mx-auto w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <FlashMessage />
                <div className="app-page-enter">
                    {children}
                </div>
            </main>

            <footer className="bg-slate-900 border-t border-white/5 px-4 sm:px-6 lg:px-8 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                        </div>
                        <div className="leading-tight">
                            <span className="text-sm font-semibold text-white block">{tenantName}</span>
                            <span className="text-xs text-slate-500">&copy; {currentYear}</span>
                        </div>
                    </div>
                    <a href="mailto:supportitsecurity@gmail.com" className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        supportitsecurity@gmail.com
                    </a>
                </div>
            </footer>
        </div>
    );
}

