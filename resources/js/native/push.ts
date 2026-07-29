import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

function currentPlatform(): 'android' | 'ios' {
    return Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
}

/** Engedélyt kér, regisztrál az FCM/APNs-nél, majd a kapott device tokent
 *  elküldi a `native.push.subscribe-native` végpontnak (session-guarddal,
 *  lásd routes/web.php). A `register()` hívás aszinkron — a token a
 *  `registration` esemény listenerben érkezik, ezért Promise-ba
 *  csomagoljuk egyetlen "első token" várakozással. */
export async function enableNativePush(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return false;

    return new Promise((resolve) => {
        const registrationHandle = PushNotifications.addListener('registration', async (token) => {
            await registrationHandle.then((h) => h.remove());
            await errorHandle.then((h) => h.remove());
            try {
                await axios.post(route('native.push.subscribe-native'), {
                    device_token: token.value,
                    platform: currentPlatform(),
                });
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
    await axios.post(route('native.push.unsubscribe-native')).catch(() => {});
}

/** Értesítés-tapra navigáció — a natív push payload `url` mezője (lásd
 *  SendNativePushJob) egy VALÓDI webes Inertia-route ebben a WebView-ban
 *  (nem egy külön mobil hash-route-térkép, mint a levetett külön kliensnél),
 *  ezért egyszerű teljes navigációval (router.visit) megnyitható. */
export function onPushNotificationTapped(callback: (url: string) => void): void {
    if (!Capacitor.isNativePlatform()) return;
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        const url = action.notification.data?.url;
        if (url) callback(url);
    });
}
