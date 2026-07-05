import { router } from '@inertiajs/react';

declare function route(name: string, params?: unknown): string;

interface Lead {
    id: number;
    name: string;
    email: string;
    locations: { id: number; name: string }[];
}

interface Props {
    welcomeName: string;
    leads: Lead[];
}

export default function DirectorDashboard({ welcomeName, leads }: Props) {
    function logout() {
        router.post(route('logout'));
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <title>Területi igazgató – Vezérlőpult</title>

            <header className="bg-slate-900 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1"/></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold leading-tight">Területi igazgató</p>
                            <p className="text-xs text-slate-400">{welcomeName}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        Kilépés
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Felügyelt biztonsági vezetők</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        A hozzád rendelt vezetők és az általuk kezelt irodaházak. A részletes
                        statisztikák, célkitűzések és a havi riport hamarosan elérhető.
                    </p>
                </div>

                {leads.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                        <p className="text-sm text-slate-500">
                            Még nincs hozzád rendelve biztonsági vezető. Az adminisztrátor a
                            felhasználó-szerkesztő oldalon tudja beállítani a hozzárendeléseket.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {leads.map(lead => (
                            <div key={lead.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-indigo-700">{lead.name.charAt(0)}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{lead.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{lead.email}</p>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-slate-100">
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                        Irodaházak ({lead.locations.length})
                                    </p>
                                    {lead.locations.length === 0 ? (
                                        <p className="text-xs text-slate-400">Nincs hozzárendelt irodaház.</p>
                                    ) : (
                                        <ul className="space-y-1">
                                            {lead.locations.map(loc => (
                                                <li key={loc.id} className="flex items-center gap-1.5 text-xs text-slate-600">
                                                    <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-4h.01M11 17h.01"/></svg>
                                                    {loc.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
