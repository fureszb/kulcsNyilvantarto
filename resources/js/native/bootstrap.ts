import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

/** Natív shell-specifikus indítási lépések — böngészőben a
 *  Capacitor.isNativePlatform() false, ezért ezek a hívások csendben
 *  kimaradnak. Ugyanaz a PWA-bundle fut itt is, mint a böngészőben, csak
 *  a Capacitor WebView (lásd mobile/capacitor.config.ts server.url) tölti be. */
export async function bootstrapNative(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    await StatusBar.setBackgroundColor({ color: '#071d4f' }).catch(() => {});

    // Android hardver-vissza gomb: az Inertia router.on('back') helyett a
    // böngésző history API-t használjuk, mert a WebView natív háttérbe-
    // küldése (minimizeApp) NEM zárja be az appot, ahogy egy natív Android
    // app sem záródik be vissza-gombra a legfelső képernyőn.
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
            window.history.back();
        } else {
            CapacitorApp.minimizeApp();
        }
    });

    await SplashScreen.hide().catch(() => {});
}
