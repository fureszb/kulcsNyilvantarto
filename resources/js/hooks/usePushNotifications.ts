import { useCallback, useEffect, useState } from 'react';

declare function route(name: string, params?: unknown): string;

export type PushStatus =
    | 'loading'
    | 'unsupported'       // a böngésző nem tud web pusht
    | 'ios-needs-install' // iOS: előbb a kezdőképernyőre kell telepíteni
    | 'denied'            // az engedély véglegesen megtagadva
    | 'off'               // engedélyezhető, de nincs feliratkozás
    | 'on';               // aktív feliratkozás

function getXsrfToken(): string {
    return decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '');
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(b64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true;

const pushSupported = () =>
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

/** Web Push feliratkozás-kezelés. A subscribe() KIZÁRÓLAG felhasználói
 *  interakcióból (gombnyomás) hívható — iOS-en csak standalone (telepített)
 *  módban kérünk engedélyt, különben telepítési útmutatót jelzünk. */
export function usePushNotifications() {
    const [status, setStatus] = useState<PushStatus>('loading');
    const [busy, setBusy] = useState(false);

    const refresh = useCallback(async () => {
        if (!pushSupported()) {
            // iOS Safariban a Push API csak telepített (standalone) módban létezik
            setStatus(isIOS() && !isStandalone() ? 'ios-needs-install' : 'unsupported');
            return;
        }
        if (Notification.permission === 'denied') { setStatus('denied'); return; }
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            setStatus(sub ? 'on' : 'off');
        } catch {
            setStatus('off');
        }
    }, []);

    useEffect(() => { void refresh(); }, [refresh]);

    /** Gombnyomásból hívandó! */
    const subscribe = useCallback(async (): Promise<boolean> => {
        if (isIOS() && !isStandalone()) { setStatus('ios-needs-install'); return false; }
        if (!pushSupported()) { setStatus('unsupported'); return false; }

        setBusy(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setStatus(permission === 'denied' ? 'denied' : 'off');
                return false;
            }

            const vapid = document.querySelector('meta[name="vapid-public-key"]')?.getAttribute('content');
            if (!vapid) throw new Error('VAPID kulcs hiányzik');

            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapid).buffer as ArrayBuffer,
            });

            const res = await fetch(route('push.subscribe'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getXsrfToken() },
                body: JSON.stringify(sub.toJSON()),
            });
            if (!res.ok) throw new Error('Feliratkozás mentése sikertelen');

            setStatus('on');
            return true;
        } catch {
            setStatus('off');
            return false;
        } finally {
            setBusy(false);
        }
    }, []);

    const unsubscribe = useCallback(async (): Promise<void> => {
        setBusy(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await fetch(route('push.unsubscribe'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getXsrfToken() },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }
            setStatus('off');
        } catch {
            await refresh();
        } finally {
            setBusy(false);
        }
    }, [refresh]);

    return { status, busy, subscribe, unsubscribe };
}
