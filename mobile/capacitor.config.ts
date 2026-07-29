import type { CapacitorConfig } from '@capacitor/cli';

// appId ugyanabban a hu.kknyilvantarto.* névtérben, mint a testvér Kotlin
// Multiplatform app (KKnyilvantartoKOTLIN, hu.kknyilvantarto.app) — külön
// csomagnév (.mobile), hogy a két natív kliens egymás mellett telepíthető
// legyen ugyanazon a teszteszközön.
const config: CapacitorConfig = {
    appId: 'hu.kknyilvantarto.mobile',
    appName: 'kkv3',
    webDir: 'www',
    // A natív app a meglévő Inertia/React PWA-t tölti be élesben, nem egy
    // külön natív kliens-buildet — így minden PWA-oldal 1:1 megegyezik a
    // böngészős verzióval, nem kell semmit portolni. A webDir/www-t a
    // Capacitor CLI-nek muszáj megadni, de a szerver.url felülírja: a
    // WebView egyenesen ezt az URL-t tölti be helyi fájlok helyett.
    server: {
        url: 'https://cortexopsystems.com',
        cleartext: false,
    },
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
