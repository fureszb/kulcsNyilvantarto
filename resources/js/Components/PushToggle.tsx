import { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

/** Harang-kapcsoló a fejlécbe: push értesítések ki/be.
 *  iOS-en nem telepített appnál telepítési útmutatót mutat. */
export default function PushToggle() {
    const { status, busy, subscribe, unsubscribe } = usePushNotifications();
    const [showIosHelp, setShowIosHelp] = useState(false);

    if (status === 'loading' || status === 'unsupported') return null;

    function handleClick() {
        if (busy) return;
        if (status === 'ios-needs-install') { setShowIosHelp(v => !v); return; }
        if (status === 'denied') return;
        if (status === 'on') void unsubscribe();
        else void subscribe();
    }

    const active = status === 'on';

    return (
        <div className="relative">
            <button
                onClick={handleClick}
                disabled={busy || status === 'denied'}
                aria-label={active ? 'Push értesítések kikapcsolása' : 'Push értesítések bekapcsolása'}
                aria-pressed={active}
                title={
                    status === 'denied'
                        ? 'Az értesítések le vannak tiltva a böngésző beállításaiban'
                        : status === 'ios-needs-install'
                            ? 'Értesítésekhez add az alkalmazást a kezdőképernyőhöz'
                            : active ? 'Push értesítések bekapcsolva' : 'Push értesítések bekapcsolása'
                }
                className={`relative flex items-center justify-center w-8 h-8 rounded-lg border transition-all cursor-pointer disabled:cursor-not-allowed ${
                    active
                        ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20'
                } ${status === 'denied' ? 'opacity-40' : ''}`}
            >
                {status === 'denied' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.63 13A17.89 17.89 0 0118 8M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14M13.73 21a2 2 0 01-3.46 0M1 1l22 22M9.34 2.68A6 6 0 0118 8c0 1.23.14 2.37.38 3.41"/>
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                )}
                {active && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-400 border border-slate-900"/>
                )}
            </button>

            {showIosHelp && status === 'ios-needs-install' && (
                <div className="absolute right-0 top-10 z-50 w-64 p-3 rounded-xl bg-slate-800 border border-white/10 shadow-xl text-xs text-slate-300 leading-relaxed">
                    <p className="font-semibold text-white mb-1">Értesítések iPhone-on</p>
                    <p>
                        1. Nyisd meg a <span className="text-white">Megosztás</span> menüt (
                        <svg className="inline w-3 h-3 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12l-4 4m4-4l4 4"/></svg>
                        )<br/>
                        2. Válaszd a <span className="text-white">„Hozzáadás a Főképernyőhöz"</span> opciót<br/>
                        3. Nyisd meg az appot a kezdőképernyőről, és kapcsold be itt az értesítéseket
                    </p>
                    <button onClick={() => setShowIosHelp(false)} className="mt-2 text-blue-400 font-semibold">Értem</button>
                </div>
            )}
        </div>
    );
}
