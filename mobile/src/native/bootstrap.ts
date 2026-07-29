import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

/** Natív shell-specifikus indítási lépések — böngészőben (`npm run dev`)
 *  a Capacitor.isNativePlatform() false, ezért ezek a hívások csendben
 *  kimaradnak (a webes fallback-implementációk egyébként is no-op-ok
 *  lennének, de a korai returnnel elkerüljük a felesleges konzol-zajt). */
export async function bootstrapNative(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    await StatusBar.setBackgroundColor({ color: '#0f172a' }).catch(() => {});

    // Android hardver-vissza gomb: ha van böngészhető history-bejegyzés, azt
    // használjuk (react-router HashRouter), egyébként az app a háttérbe kerül
    // (natív app-viselkedés — NEM záródik be, ahogy egy natív Android app sem).
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
            window.history.back();
        } else {
            CapacitorApp.minimizeApp();
        }
    });

    await SplashScreen.hide();
}
