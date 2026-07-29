import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { subscribeNativePush, unsubscribeNativePush } from '../api/push';

function currentPlatform(): 'android' | 'ios' {
    return Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
}

/** Engedélyt kér, regisztrál az FCM/APNs-nél, majd a kapott device tokent
 *  elküldi a már meglévő `/push/subscribe-native` végpontnak. A `register()`
 *  hívás aszinkron — a token a `registration` esemény listenerben érkezik,
 *  ezért Promise-ba csomagoljuk egyetlen "első token" várakozással. */
export async function enableNativePush(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return false;

    return new Promise((resolve) => {
        const registrationHandle = PushNotifications.addListener('registration', async (token) => {
            await registrationHandle.then((h) => h.remove());
            await errorHandle.then((h) => h.remove());
            try {
                await subscribeNativePush(token.value, currentPlatform());
                resolve(true);
            } catch {
                resolve(false);
            }
        });
        const errorHandle = PushNotifications.addListener('registrationError', async () => {
            await registrationHandle.then((h) => h.remove());
            await errorHandle.then((h) => h.remove());
            resolve(false);
        });

        PushNotifications.register();
    });
}

export async function disableNativePush(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    await unsubscribeNativePush().catch(() => {});
}

/** Értesítés-tapra navigáció — a backend `url` mezője (lásd
 *  NfcAccessController::notifyEveryone `route('presence.index')`) egy WEBES
 *  útvonal, ami a mobil app hash-routerében nem értelmezhető 1:1; egyelőre
 *  csak a callbacket kötjük be, a tényleges deep-link célképernyő-leképezés
 *  (webes route név → mobil útvonal) egy külön, backend-koordinációt igénylő
 *  lépés (a natív push payloadnak inkább egy típus-mezőt kellene küldenie
 *  webes URL helyett). */
export function onPushNotificationTapped(callback: () => void): void {
    if (!Capacitor.isNativePlatform()) return;
    PushNotifications.addListener('pushNotificationActionPerformed', () => callback());
}
