import { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

/**
 * Automatikusan megjelenő, egykattintásos push-engedélyező sáv — a böngésző
 * `Notification.requestPermission()` API-ja biztonsági okból KIZÁRÓLAG közvetlen
 * felhasználói kattintásból hívható (lásd usePushNotifications.ts kommentje), ezért teljesen
 * kattintás nélküli automatikus feliratkozás technikailag nem lehetséges — ez a sáv a
 * legközelebbi elérhető megoldás: nem kell a Profil oldalra navigálni és ott kapcsolót
 * keresni, a sáv magától megjelenik minden oldalon, amíg a user nincs feliratkozva.
 */
export default function PushPermissionBanner() {
    const { status, busy, subscribe } = usePushNotifications();
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || status !== 'off') return null;

    return (
        <div className="bg-cyan-50 border-b border-cyan-200 px-4 sm:px-6 py-2.5">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
                <svg className="w-4 h-4 text-cyan-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-xs text-cyan-800 flex-1">
                    Kapcsold be az értesítéseket, hogy azonnal értesülj a fontos eseményekről (zóna-elhagyás, NFC-riasztás, üzenetek).
                </p>
                <button
                    type="button"
                    onClick={() => void subscribe()}
                    disabled={busy}
                    className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 whitespace-nowrap disabled:opacity-50 cursor-pointer"
                >
                    {busy ? 'Kapcsolás…' : 'Engedélyezem'}
                </button>
                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    aria-label="Bezárás"
                    className="text-cyan-400 hover:text-cyan-600 shrink-0 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
