import axios from 'axios';
import { getAppConfig } from '../storage/appConfig';
import { clearToken, getToken } from '../storage/secureToken';

// Nincs statikus baseURL: a szerver-cím + tenant slug futásidőben, a
// Preferences-ből dől el (lásd screens/ServerSetupScreen), mert a natív
// klienst több telepítés/tenant is használhatja, nem csak egy build-time
// konfigurált szerver.
export const apiClient = axios.create({
    headers: {
        // ngrok free-tier "böngésző-figyelmeztető" közbenső oldala minden
        // valódi böngésző User-Agent-tel érkező kérést lecserél egy saját
        // HTML oldalára (CORS fejlécek NÉLKÜL) — ez az ngrok hivatalosan
        // dokumentált megkerülő fejléce API-kliens forgalomhoz. Csak dev/teszt
        // ngrok-tunnelen keresztüli használatnál releváns, éles domain-nél
        // ártalmatlan no-op.
        'ngrok-skip-browser-warning': 'true',
    },
});

let onUnauthorized: (() => void) | null = null;

/** AuthContext regisztrálja itt a logout-navigációt, hogy a client.ts ne
 *  importálja körkörösen az AuthContextet. */
export function registerUnauthorizedHandler(handler: () => void): void {
    onUnauthorized = handler;
}

apiClient.interceptors.request.use(async (config) => {
    const appConfig = await getAppConfig();
    if (appConfig) {
        // A routes/api.php a bootstrap/app.php withRouting(api: ...) alapértelmezett
        // 'api' prefixével van felkötve — enélkül a kérés a routes/web.php-ba
        // "csúszna" (ahol nincs /auth/login mintázat), és 404-et kapna.
        config.baseURL = `${appConfig.serverUrl.replace(/\/+$/, '')}/api/${appConfig.tenantSlug}`;
    }

    // A login végpont az egyetlen, aminek nincs szüksége bearer tokenre —
    // ott a getToken() üres lesz (nincs még bejelentkezve), ami rendben van.
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            await clearToken();
            onUnauthorized?.();
        }
        return Promise.reject(error);
    },
);
