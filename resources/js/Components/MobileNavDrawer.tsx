import { useEffect, useState, type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export interface MobileNavItem {
    key: string;
    href: string;
    label: string;
    icon: string;
    active?: boolean;
    badge?: number;
    badgeColor?: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    brandLabel: string;
    brandSublabel?: string;
    brandIcon?: string;
    items: MobileNavItem[];
    /** Extra tartalom a fő lista alatt (profil/csapat/admin/kilépés) — layout-specifikus. */
    children?: ReactNode;
    /** Melyik Tailwind breakpointtól tűnik el a mobil menü — igazodjon a layout saját
     *  hamburger-gombjához (a legtöbb layout `sm`, a SecurityLeadLayout `lg`). */
    hiddenFrom?: 'sm' | 'lg';
}

const DEFAULT_ICON = 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z';

/** Komoot-stílusú, jobbról beúszó, teljes képernyős mobil navigáció —
 *  ikon+címke soros menüpontok, alul "Alkalmazás telepítése" gombbal.
 *  A háttér-gradiens szándékosan ugyanaz a kék-fekete paletta, mint a
 *  sticky fejléceken (csak függőleges irányba fordítva a magas panelhez). */
export default function MobileNavDrawer({ open, onClose, brandLabel, brandSublabel, brandIcon, items, children, hiddenFrom = 'sm' }: Props) {
    const hiddenClass = hiddenFrom === 'lg' ? 'lg:hidden' : 'sm:hidden';
    const [mounted, setMounted] = useState(open);
    const [closing, setClosing] = useState(false);
    const { canPromptNative, showIosGuide, busy, promptInstall } = usePWAInstall();
    const [showInstallHint, setShowInstallHint] = useState(false);

    useEffect(() => {
        if (open) { setMounted(true); setClosing(false); }
    }, [open]);

    useEffect(() => {
        if (!mounted) return;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [mounted]);

    useEffect(() => {
        if (!mounted) return;
        function onKey(e: KeyboardEvent) { if (e.key === 'Escape') requestClose(); }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [mounted]);

    function requestClose() {
        setClosing(true);
        setTimeout(() => { setMounted(false); setClosing(false); onClose(); }, 240);
    }

    async function handleInstallClick() {
        if (canPromptNative) {
            await promptInstall();
        } else {
            setShowInstallHint(v => !v);
        }
    }

    if (!mounted) return null;

    return (
        <>
            <div
                className={`fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm ${hiddenClass} ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
                onClick={requestClose}
            />
            <div
                className={`fixed inset-y-0 right-0 z-[100] w-full max-w-sm ${hiddenClass} flex flex-col shadow-2xl ${closing ? 'animate-drawer-out' : 'animate-drawer-in'}`}
                style={{ backgroundImage: 'linear-gradient(180deg, rgb(7, 29, 79) 0%, #0032a1 55%, rgb(10, 2, 22) 100%)' }}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="safe-top flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={brandIcon ?? DEFAULT_ICON} />
                            </svg>
                        </div>
                        <div className="min-w-0 leading-tight">
                            <p className="text-white font-bold text-sm truncate">{brandLabel}</p>
                            {brandSublabel && <p className="text-white/50 text-[11px] font-semibold uppercase tracking-wider truncate">{brandSublabel}</p>}
                        </div>
                    </div>
                    <button
                        onClick={requestClose}
                        aria-label="Bezárás"
                        className="w-9 h-9 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {items.map(item => (
                        <Link
                            key={item.key}
                            href={item.href}
                            onClick={requestClose}
                            className={`relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${item.active ? 'bg-white/20 text-white' : 'text-white/75 hover:text-white hover:bg-white/10'}`}
                        >
                            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                            </span>
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge != null && item.badge > 0 && (
                                <span className={`min-w-[1.4rem] h-[1.4rem] flex items-center justify-center rounded-full ${item.badgeColor ?? 'bg-rose-500'} text-white text-[10px] font-bold leading-none px-1 shrink-0`}>
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </Link>
                    ))}

                    {children && (
                        <div className="pt-2 mt-2 border-t border-white/10 space-y-1">
                            {children}
                        </div>
                    )}
                </div>

                {/* Footer: alkalmazás telepítése */}
                <div className="shrink-0 p-4 border-t border-white/10">
                    {showInstallHint && !canPromptNative && (
                        <div className="mb-3 rounded-xl bg-white/10 border border-white/15 p-3 text-xs text-white/80 leading-relaxed">
                            {showIosGuide ? (
                                <>
                                    <p><span className="text-white font-semibold">1.</span> Koppints a Megosztás ikonra lent a böngészősávban</p>
                                    <p className="mt-1"><span className="text-white font-semibold">2.</span> Válaszd: „Hozzáadás a kezdőképernyőhöz”</p>
                                </>
                            ) : (
                                <>
                                    <p><span className="text-white font-semibold">1.</span> Nyisd meg a böngésző menüjét</p>
                                    <p className="mt-1"><span className="text-white font-semibold">2.</span> Válaszd: „Telepítés” vagy „Hozzáadás a kezdőképernyőhöz”</p>
                                </>
                            )}
                        </div>
                    )}
                    <button
                        onClick={handleInstallClick}
                        disabled={busy}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-[#0032a1] text-sm font-bold hover:bg-white/90 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                        {busy ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" /></svg>
                        )}
                        Alkalmazás letöltése
                    </button>
                </div>
            </div>
        </>
    );
}
