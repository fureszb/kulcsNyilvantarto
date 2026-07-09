import { useState, type ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';
import FlashMessage from '../Components/FlashMessage';
import MobileNavDrawer from '../Components/MobileNavDrawer';
import AppHeader from '../Components/AppHeader';
import type { PageProps } from '../types';

interface Props {
    children: ReactNode;
    title?: string;
}

export default function SuperAdminLayout({ children, title }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const currentYear = new Date().getFullYear();

    function logout(e: React.FormEvent) {
        e.preventDefault();
        router.post(route('super-admin.logout'));
    }

    const headerNavItems = [
        { key: 'landing', href: route('landing'), label: 'Kezdőlap', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { key: 'companies', href: route('super-admin.dashboard'), label: 'Cégek', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', active: route().current('super-admin.dashboard') },
    ];

    return (
        <div className="min-h-screen overflow-x-hidden flex flex-col bg-slate-100">
            {title && <title>{title} – KK Nyilvántartó</title>}

            <AppHeader
                brandHref={route('super-admin.dashboard')}
                brandLabel="KK Nyilvántartó"
                brandSublabel="Super Admin"
                brandIcon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                navItems={headerNavItems}
                mobileMenuOpen={mobileOpen}
                onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
            >
                <form onSubmit={logout} className="hidden sm:block">
                    <button type="submit" title="Kijelentkezés" aria-label="Kijelentkezés" className="flex w-8 h-8 rounded-full items-center justify-center text-white/80 hover:text-red-300 hover:bg-white/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                    </button>
                </form>
            </AppHeader>

            <MobileNavDrawer
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                brandLabel="KK Nyilvántartó"
                brandSublabel="Super Admin"
                items={headerNavItems}
            >
                <form onSubmit={logout}>
                    <button type="submit" className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        </span>
                        Kijelentkezés
                    </button>
                </form>
            </MobileNavDrawer>

            <main className="flex-1 max-w-6xl mx-auto w-full overflow-x-hidden px-4 sm:px-6 py-6 sm:py-8">
                <FlashMessage />
                {children}
            </main>

            <footer className="bg-slate-900 border-t border-white/5 px-4 sm:px-6 py-5">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                        </div>
                        <div className="leading-tight">
                            <span className="text-sm font-semibold text-white block">KK Nyilvántartó</span>
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
