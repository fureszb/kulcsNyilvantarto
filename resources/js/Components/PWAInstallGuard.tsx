import { useEffect, useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

/** Globális, nem-tolakodó telepítési ajánlat: elkapja a natív Chrome/Edge
 *  telepítési promptot, és egyedi kártyán kínálja fel — iOS Safarin és
 *  a natív API-t nem támogató böngészőkön lépésenkénti útmutatót ad
 *  a "Hozzáadás a kezdőképernyőhöz" művelethez. Snooze: 14 nap. */
export default function PWAInstallGuard() {
    const { canPromptNative, showIosGuide, showGenericGuide, shouldShow, busy, promptInstall, dismiss } = usePWAInstall();
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        if (!shouldShow) { setVisible(false); return; }
        // Kis késleltetés, hogy ne versenyezzen a kezdő oldal-betöltési
        // animációkkal (pl. Portal üdvözlő overlay).
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
    }, [shouldShow]);

    if (!shouldShow || !visible) return null;

    function close(days?: number) {
        setLeaving(true);
        setTimeout(() => { setVisible(false); dismiss(days); }, 220);
    }

    async function handleInstall() {
        const outcome = await promptInstall();
        if (outcome === 'accepted') { setLeaving(true); setTimeout(() => setVisible(false), 220); }
        else if (outcome === 'dismissed') close(3); // rövidebb snooze, ha a natív promptot is elutasította
    }

    return (
        <div
            className={`fixed inset-x-0 bottom-0 z-[900] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none ${leaving ? 'animate-pwa-sheet-out' : 'animate-pwa-sheet-in'}`}
        >
            <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 p-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

                <button
                    onClick={() => close()}
                    aria-label="Bezárás"
                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="relative flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-bold text-sm leading-tight">Telepítsd az alkalmazást</p>
                        <p className="text-slate-400 text-xs mt-0.5">Gyorsabb elérés, teljes képernyő, offline működés</p>
                    </div>
                </div>

                {canPromptNative && (
                    <>
                        <ul className="space-y-1.5 mb-4">
                            {['Egy koppintással elérhető a kezdőképernyőről', 'Böngésző-sáv nélküli, natív élmény', 'Push értesítések és gyorsabb betöltés'].map(f => (
                                <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                                    <svg className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleInstall}
                                disabled={busy}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition-colors disabled:opacity-60 cursor-pointer"
                            >
                                {busy ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" /></svg>
                                )}
                                Alkalmazás telepítése
                            </button>
                            <button onClick={() => close(3)} className="px-3 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer">
                                Talán később
                            </button>
                        </div>
                    </>
                )}

                {!canPromptNative && showIosGuide && (
                    <>
                        <div className="rounded-xl bg-white/5 border border-white/10 p-3 mb-4 text-xs text-slate-300 leading-relaxed">
                            <p className="flex items-center gap-1.5">
                                <span className="text-white font-semibold">1.</span> Koppints a Megosztás ikonra
                                <svg className="inline w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12l-4 4m4-4l4 4" /></svg>
                                lent a böngészősávban
                            </p>
                            <p className="mt-1.5"><span className="text-white font-semibold">2.</span> Válaszd: <span className="text-white">„Hozzáadás a kezdőképernyőhöz”</span></p>
                        </div>
                        <button onClick={() => close()} className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors cursor-pointer">
                            Értem
                        </button>
                    </>
                )}

                {!canPromptNative && !showIosGuide && showGenericGuide && (
                    <>
                        <div className="rounded-xl bg-white/5 border border-white/10 p-3 mb-4 text-xs text-slate-300 leading-relaxed">
                            <p className="flex items-center gap-1.5">
                                <span className="text-white font-semibold">1.</span> Nyisd meg a böngésző menüjét
                                <svg className="inline w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="18" r="1.6" /></svg>
                            </p>
                            <p className="mt-1.5"><span className="text-white font-semibold">2.</span> Válaszd: <span className="text-white">„Telepítés”</span> vagy <span className="text-white">„Hozzáadás a kezdőképernyőhöz”</span></p>
                        </div>
                        <button onClick={() => close()} className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors cursor-pointer">
                            Értem
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
