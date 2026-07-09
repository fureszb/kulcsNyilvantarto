import { useEffect, useState, type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import type { MobileNavItem } from './MobileNavDrawer';

interface Props {
    brandHref: string;
    brandLabel: string;
    brandSublabel?: string;
    brandIcon?: string;
    navItems: MobileNavItem[];
    mobileMenuOpen: boolean;
    onMobileMenuToggle: () => void;
    /** Melyik Tailwind breakpointtól vált desktop nézetre a fejléc —
     *  igazodjon a MobileNavDrawer-nek adott hiddenFrom-mal. */
    hiddenFrom?: 'sm' | 'lg';
    /** Jobb oldali, szerepkör-specifikus tartalom (óra, push-toggle, profil,
     *  kilépés, admin-link stb.) — ez marad az egyetlen rész, ami layoutonként
     *  ténylegesen eltér, minden más (gradiens, nav, mobil gomb) egységes. */
    children?: ReactNode;
}

const DEFAULT_ICON = 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z';

/** Közös, egységes sticky fejléc-héj minden worker/admin-szerepkörű layouthoz
 *  (az /admin panel AdminLayout-ja kivételével, ld. tovabbFejlesztesek.md).
 *  A gradiens, a nav-pillek és a mobil-gomb egy helyen karbantartva — a
 *  korábbi hiba (pl. PushToggle csak az egyik layoutban) abból eredt, hogy
 *  mindegyik layout a saját, külön másolt fejléc-JSX-ét tartotta karban. */
export default function AppHeader({
    brandHref, brandLabel, brandSublabel, brandIcon,
    navItems, mobileMenuOpen, onMobileMenuToggle, hiddenFrom = 'sm', children,
}: Props) {
    const navHiddenClass = hiddenFrom === 'lg' ? 'hidden lg:flex' : 'hidden sm:flex';
    const toggleHiddenClass = hiddenFrom === 'lg' ? 'lg:hidden' : 'sm:hidden';

    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        function onScroll() { setScrolled(window.scrollY > 12); }
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header className={`safe-top sticky top-0 z-30 shadow-lg shadow-indigo-900/10 transition-[backdrop-filter] duration-300 ${scrolled ? 'backdrop-blur-md' : ''}`}>
            <div
                className="absolute inset-0 gradient-drift transition-opacity duration-300 ease-out"
                style={{
                    backgroundImage: 'linear-gradient(90deg, rgb(7, 29, 79) 0%, #0032a1 55%, rgb(10, 2, 22) 100%)',
                    opacity: scrolled ? 0.82 : 1,
                }}
            />
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 border-b border-white/10">
                    {/* Brand */}
                    <Link href={brandHref} className="flex items-center gap-2.5 group shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center group-hover:bg-white/25 transition-colors shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={brandIcon ?? DEFAULT_ICON} />
                            </svg>
                        </div>
                        <div className="leading-tight hidden sm:block">
                            <span className="text-white font-bold text-sm block">{brandLabel}</span>
                            {brandSublabel && <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider block">{brandSublabel}</span>}
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <nav className={`${navHiddenClass} items-center gap-0.5`}>
                        {navItems.map(item => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors ${item.active ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                                {item.label}
                                {!!item.badge && item.badge > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5">
                                        <span className={`absolute -inset-0.5 rounded-full ${item.badgeColor ?? 'bg-rose-500'} animate-ping opacity-40`} />
                                        <span className={`relative min-w-[14px] h-[14px] flex items-center justify-center rounded-full ${item.badgeColor ?? 'bg-rose-500'} text-white text-[9px] font-bold leading-none px-0.5`}>
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Jobb oldal — layout-specifikus tartalom + mobil menü gomb */}
                    <div className="flex items-center gap-1.5">
                        {children}
                        <button
                            onClick={onMobileMenuToggle}
                            aria-label={mobileMenuOpen ? 'Menü bezárása' : 'Menü megnyitása'}
                            className={`${toggleHiddenClass} flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-colors`}
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
