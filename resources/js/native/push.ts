import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';

const DEVICE_TOKEN_KEY = 'kk_push_device_token';

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
                await Preferences.set({ key: DEVICE_TOKEN_KEY, value: token.value });
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
    // A saját eszköz tokenjét küldjük — enélkül a backend (kompatibilitásból
    // a device_token nélkül hívó Kotlin klienssel) a user ÖSSZES eszközének
    // push-jét törölné, nem csak ezét.
    const { value: deviceToken } = await Preferences.get({ key: DEVICE_TOKEN_KEY });
    await axios.post(route('native.push.unsubscribe-native'), deviceToken ? { device_token: deviceToken } : {}).catch(() => {});
    await Preferences.remove({ key: DEVICE_TOKEN_KEY });
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
