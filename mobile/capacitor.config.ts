import type { CapacitorConfig } from '@capacitor/cli';

// appId ugyanabban a hu.kknyilvantarto.* névtérben, mint a testvér Kotlin
// Multiplatform app (KKnyilvantartoKOTLIN, hu.kknyilvantarto.app) — külön
// csomagnév (.mobile), hogy a két natív kliens egymás mellett telepíthető
// legyen ugyanazon a teszteszközön.
const config: CapacitorConfig = {
    appId: 'hu.kknyilvantarto.mobile',
    appName: 'kkv2',
    webDir: 'www',
    backgroundColor: '#0f172a',
    ios: {
        contentInset: 'automatic',
    },
    plugins: {
        SplashScreen: {
            backgroundColor: '#0f172a',
            launchAutoHide: true,
        },
        StatusBar: {
            style: 'DARK',
            backgroundColor: '#0f172a',
        },
    },
};

export default config;
