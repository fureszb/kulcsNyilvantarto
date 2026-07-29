import { NavLink } from 'react-router-dom';

interface Tab {
    to: string;
    label: string;
    icon: (active: boolean) => React.ReactNode;
}

const iconClass = (active: boolean) => `w-6 h-6 ${active ? 'text-white' : 'text-white/50'}`;

const TABS: Tab[] = [
    {
        to: '/home',
        label: 'Kezdőlap',
        icon: (active) => (
            <svg className={iconClass(active)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        to: '/nfc',
        label: 'NFC',
        icon: (active) => (
            <svg className={iconClass(active)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 8.5a5 5 0 017 7M6 6a9 9 0 0112 12M12 12a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
        ),
    },
    {
        to: '/profile',
        label: 'Profil',
        icon: (active) => (
            <svg className={iconClass(active)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
];

// Ugyanaz a sötét "chrome" héj (bg-slate-900 / brand.chrome), mint a webes
// AppLayout fejléce/lábléce — csak alsó tab-sávvá alakítva, natív app-mintát
// követve (Capacitor WebView-ban nincs helye egy webes felső navigációnak).
export function BottomTabBar() {
    return (
        <nav className="safe-bottom bg-brand-chrome border-t border-white/10 shrink-0">
            <div className="flex items-stretch justify-around">
                {TABS.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        className="flex-1 flex flex-col items-center gap-1 py-2.5"
                    >
                        {({ isActive }) => (
                            <>
                                {tab.icon(isActive)}
                                <span className={`text-[11px] font-medium ${isActive ? 'text-white' : 'text-white/50'}`}>
                                    {tab.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
