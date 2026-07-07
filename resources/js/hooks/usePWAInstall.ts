import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    prompt(): Promise<void>;
}

export type PWAPlatform = 'ios' | 'android' | 'desktop' | 'other';

const DISMISS_KEY = 'pwa-install-dismissed-until';
const SNOOZE_DAYS = 14;
// A beforeinstallprompt csak akkor sül el, ha Chrome szerint a felhasználó
// már "eleget elkötelezett" az oldal felé — ez néhány másodpercet, akár
// több látogatást is igénybe vehet. Ennyit várunk, mielőtt a generikus
// (böngésző-menüs) útmutatóra váltanánk, hogy ne előzzük meg feleslegesen
// a natív promptot azokon a böngészőkön, amik támogatnák.
const FALLBACK_GRACE_MS = 4000;

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = () => /android/i.test(navigator.userAgent);

const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true;

function getPlatform(): PWAPlatform {
    if (isIOS()) return 'ios';
    if (isAndroid()) return 'android';
    if (/Macintosh|Windows|Linux/i.test(navigator.userAgent)) return 'desktop';
    return 'other';
}

function readDismissedUntil(): number {
    try {
        const raw = localStorage.getItem(DISMISS_KEY);
        return raw ? parseInt(raw, 10) : 0;
    } catch {
        return 0;
    }
}

/** PWA telepítési életciklus kezelése: elkapja a natív beforeinstallprompt
 *  eseményt (Android Chrome/Edge), és felismeri, ha csak útmutatásra van
 *  szükség (iOS Safari, vagy olyan böngésző, ami nem támogatja az API-t). */
export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [installed, setInstalled] = useState(() => isStandalone());
    const [dismissedUntil, setDismissedUntil] = useState(() => readDismissedUntil());
    const [fallbackReady, setFallbackReady] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (installed) return;

        function onBeforeInstallPrompt(e: Event) {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        }
        function onAppInstalled() {
            setInstalled(true);
            setDeferredPrompt(null);
            try { localStorage.removeItem(DISMISS_KEY); } catch { /* ignore */ }
        }

        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
        window.addEventListener('appinstalled', onAppInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
            window.removeEventListener('appinstalled', onAppInstalled);
        };
    }, [installed]);

    useEffect(() => {
        const t = setTimeout(() => setFallbackReady(true), FALLBACK_GRACE_MS);
        return () => clearTimeout(t);
    }, []);

    const platform = getPlatform();
    const canPromptNative = !!deferredPrompt;
    const isDismissed = Date.now() < dismissedUntil;

    // iOS Safari sosem támogatja a beforeinstallprompt-ot — ott mindig útmutatás kell.
    const showIosGuide = platform === 'ios' && !installed && !canPromptNative;
    // Minden más nem-natív esetben (pl. régebbi Chrome, Firefox Android) generikus
    // menü-útmutatás, de csak a türelmi idő letelte után (lásd FALLBACK_GRACE_MS).
    const showGenericGuide = !installed && !canPromptNative && platform !== 'ios' && fallbackReady;

    const shouldShow = !installed && !isDismissed && (canPromptNative || showIosGuide || showGenericGuide);

    const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
        if (!deferredPrompt) return 'unavailable';
        setBusy(true);
        try {
            await deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            setDeferredPrompt(null);
            if (choice.outcome === 'accepted') setInstalled(true);
            return choice.outcome;
        } finally {
            setBusy(false);
        }
    }, [deferredPrompt]);

    const dismiss = useCallback((days: number = SNOOZE_DAYS) => {
        const until = Date.now() + days * 86_400_000;
        try { localStorage.setItem(DISMISS_KEY, String(until)); } catch { /* ignore */ }
        setDismissedUntil(until);
    }, []);

    return {
        platform,
        installed,
        canPromptNative,
        showIosGuide,
        showGenericGuide,
        shouldShow,
        busy,
        promptInstall,
        dismiss,
    };
}
