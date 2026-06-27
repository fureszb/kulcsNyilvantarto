import { Link } from '@inertiajs/react';

interface Props {
    status: 403 | 404 | 405 | 419 | number;
}

const config: Record<number, { color: string; label: string; title: string; description: string; iconPath: string }> = {
    403: {
        color: 'from-rose-950 via-slate-900',
        label: 'text-rose-400',
        title: 'Hozzáférés megtagadva',
        description: 'Nincs jogosultsága ehhez az oldalhoz vagy művelethez.',
        iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    },
    404: {
        color: 'from-slate-950 via-slate-900',
        label: 'text-blue-400',
        title: 'Az oldal nem található',
        description: 'A keresett oldal nem létezik vagy áthelyezésre került.',
        iconPath: 'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    405: {
        color: 'from-amber-950 via-slate-900',
        label: 'text-amber-400',
        title: 'Nem engedélyezett kérés',
        description: 'Ez a kérési módszer nem engedélyezett az adott erőforráson.',
        iconPath: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
    },
    419: {
        color: 'from-orange-950 via-slate-900',
        label: 'text-orange-400',
        title: 'Az oldal lejárt',
        description: 'Az oldal munkamenete lejárt. Kérjük frissítse az oldalt és próbálja újra.',
        iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    },
};

export default function ErrorPage({ status }: Props) {
    const info = config[status] ?? {
        color: 'from-slate-950 via-slate-900',
        label: 'text-slate-400',
        title: 'Hiba történt',
        description: 'Váratlan hiba lépett fel. Kérjük próbálja újra később.',
        iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    };

    return (
        <div className={`relative min-h-screen bg-gradient-to-br ${info.color} to-slate-950 flex items-center justify-center p-6 overflow-hidden`}>
            <title>Hiba {status}</title>

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Ambient blobs */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none"/>
            <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-white/[0.025] rounded-full blur-3xl pointer-events-none"/>

            <div className="relative animate-page-enter text-center max-w-lg w-full">

                {/* Status code — ghost text */}
                <div className="relative h-44 sm:h-56 flex items-center justify-center mb-2">
                    <span
                        className="text-[11rem] sm:text-[14rem] font-black leading-none select-none pointer-events-none"
                        style={{ color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.06)' }}
                    >
                        {status}
                    </span>

                    {/* Icon on top of ghost number */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                            <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={info.iconPath}/>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Label + title + description */}
                <p className={`text-xs font-bold uppercase tracking-[0.25em] mb-3 ${info.label}`}>HTTP {status}</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">{info.title}</h1>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-10 max-w-sm mx-auto">{info.description}</p>

                {/* Actions */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        Vissza
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-950/50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        Főoldal
                    </Link>
                </div>

                <p className="mt-12 text-xs text-white/10 tracking-widest uppercase">KulcsNyilvántartó</p>
            </div>
        </div>
    );
}
