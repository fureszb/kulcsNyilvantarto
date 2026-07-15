import { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

/** Push értesítések be/ki kapcsolója a profil oldalon, jól látható Be/Ki felirattal.
 *  iOS-en nem telepített appnál telepítési útmutatót mutat. */
export default function PushNotificationSwitch() {
    const { status, busy, subscribe, unsubscribe } = usePushNotifications();
    const [showIosHelp, setShowIosHelp] = useState(false);

    if (status === 'unsupported') return null;

    const active = status === 'on';
    const disabled = busy || status === 'denied' || status === 'loading';

    function handleClick() {
        if (busy || status === 'loading') return;
        if (status === 'ios-needs-install') { setShowIosHelp(v => !v); return; }
        if (status === 'denied') return;
        if (status === 'on') void unsubscribe();
        else void subscribe();
    }

    const helperText =
        status === 'denied'
            ? 'Az értesítések le vannak tiltva a böngésző beállításaiban.'
            : status === 'ios-needs-install'
                ? 'Kattints ide a telepítési útmutatóért.'
                : status === 'loading'
                    ? 'Állapot lekérdezése…'
                    : active
                        ? 'Push értesítéseket kapsz erről az eszközről.'
                        : 'Kapcsold be, hogy értesítést kapj erről az eszközről.';

    return (
        <div>
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700">Push értesítések</p>
                    <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold uppercase tracking-wide ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                        {status === 'loading' ? '…' : active ? 'Be' : 'Ki'}
                    </span>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={active}
                        aria-label={active ? 'Push értesítések kikapcsolása' : 'Push értesítések bekapcsolása'}
                        onClick={handleClick}
                        disabled={disabled}
                        title={status === 'denied' ? 'Az értesítések le vannak tiltva a böngésző beállításaiban' : undefined}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${active ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${active ? 'translate-x-5' : 'translate-x-0'}`}/>
                    </button>
                </div>
            </div>

            {showIosHelp && status === 'ios-needs-install' && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
                    <p className="font-semibold text-slate-700 mb-1">Értesítések iPhone-on</p>
                    <p>
                        1. Nyisd meg a <span className="text-slate-700 font-medium">Megosztás</span> menüt (
                        <svg className="inline w-3 h-3 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12l-4 4m4-4l4 4"/></svg>
                        )<br/>
                        2. Válaszd a <span className="text-slate-700 font-medium">„Hozzáadás a Főképernyőhöz"</span> opciót<br/>
                        3. Nyisd meg az appot a kezdőképernyőről, és kapcsold be itt az értesítéseket
                    </p>
                    <button onClick={() => setShowIosHelp(false)} className="mt-2 text-blue-600 font-semibold cursor-pointer">Értem</button>
                </div>
            )}
        </div>
    );
}
