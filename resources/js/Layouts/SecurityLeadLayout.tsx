import { useState, type ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import FlashMessage from '../Components/FlashMessage';
import type { PageProps } from '../types';

interface Props {
    children: ReactNode;
    title?: string;
    headerActions?: ReactNode;
}

const NAV_ITEMS = [
    { route: 'security-lead.dashboard', label: 'Áttekintés',           icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zm10 0a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z' },
    { route: 'notes.index',             label: 'Váltóüzenetek',        icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { route: 'vezenyles.index',         label: 'Vezénylés',            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { route: 'security-lead.reports',   label: 'Napi Jelentés',        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { route: 'security-lead.workers',   label: 'Emberek teljesítése',  icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { route: 'security-lead.inventory', label: 'Leltár',               icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { route: 'ai.chat',                 label: 'AI Asszisztens',       icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
];

export default function SecurityLeadLayout({ children, title, headerActions }: Props) {
    const { auth, tenant } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const tenantName = tenant?.name ?? 'KK Nyilvántartó';
    const currentYear = new Date().getFullYear();

    function logout(e: React.FormEvent) {
        e.preventDefault();
        router.post(route('logout'));
    }

    return (
        <div className="min-h-full overflow-x-hidden bg-slate-50 antialiased">
            {title && <title>Biztonsági vezető – {title}</title>}
            <div className="flex h-screen overflow-hidden">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 flex flex-col shrink-0 transition-transform duration-200 ease-in-out lg:relative lg:inset-auto lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                    <div className="safe-top px-5 py-5 border-b border-white/10">
                        <Link href={route('home')} className="flex items-center gap-3 group">
                            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-500 transition-colors shadow-lg">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                            </div>
                            <div className="leading-tight min-w-0">
                                <span className="text-white font-bold text-sm block truncate">{tenantName}</span>
                                <span className="text-slate-500 text-xs font-medium">Biztonsági vezető</span>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                        {NAV_ITEMS.map((item) => {
                            const active = route().current(`${item.route}*`);
                            return (
                                <Link
                                    key={item.route}
                                    href={route(item.route)}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                                >
                                    <svg className="shrink-0 w-[1.125rem] h-[1.125rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/>
                                    </svg>
                                    {item.label}
                                </Link>
                            );
                        })}

                        <div className="pt-3 mt-3 border-t border-white/10 space-y-0.5">
                            <Link href={route('home')} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${route().current('home') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                <svg className="w-[1.125rem] h-[1.125rem] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                                Kezdőlap
                            </Link>
                        </div>
                    </nav>

                    <div className="px-3 py-4 border-t border-white/10 space-y-1">
                        {auth.user && (
                            <Link href={route('profile.edit')} onClick={() => setSidebarOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <svg className="w-[1.125rem] h-[1.125rem] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                <span className="truncate">{auth.user.name}</span>
                            </Link>
                        )}
                        <form onSubmit={logout}>
                            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                                <svg className="w-[1.125rem] h-[1.125rem] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                Kijelentkezés
                            </button>
                        </form>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col overflow-auto min-w-0">
                    <header className="safe-top relative bg-slate-900 border-b border-white/10 px-4 sm:px-8 py-0 flex items-center shrink-0 h-14 gap-3">
                        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="relative lg:hidden p-1.5 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                        </button>
                        <h1 className="relative text-sm font-bold text-white flex-1 truncate">{title ?? 'Biztonsági vezető'}</h1>
                        {headerActions && <div className="relative flex items-center gap-2 shrink-0">{headerActions}</div>}
                    </header>

                    <main className="flex-1 px-4 sm:px-8 py-6 overflow-x-hidden bg-slate-50">
                        <FlashMessage />
                        {children}
                    </main>

                    <footer className="shrink-0 bg-slate-900 border-t border-white/5 px-4 sm:px-8 py-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                            </div>
                            <div className="leading-tight">
                                <span className="text-sm font-semibold text-white block">{tenantName}</span>
                                <span className="text-xs text-slate-500">&copy; {currentYear} · Biztonsági vezetői felület</span>
                            </div>
                        </div>
                        <a href="mailto:supportitsecurity@gmail.com" className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            supportitsecurity@gmail.com
                        </a>
                    </footer>
                </div>
            </div>
        </div>
    );
}
