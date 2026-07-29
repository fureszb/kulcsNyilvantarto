import { Preferences } from '@capacitor/preferences';

// Nem érzékeny konfiguráció (szerver-URL + tenant slug) — @capacitor/preferences
// elég hozzá, a bearer tokenhez viszont a secureToken.ts (Keychain/Keystore) kell.
const SERVER_URL_KEY = 'kk_server_url';
const TENANT_SLUG_KEY = 'kk_tenant_slug';

export interface AppConfig {
    serverUrl: string;
    tenantSlug: string;
}

export async function getAppConfig(): Promise<AppConfig | null> {
    const [{ value: serverUrl }, { value: tenantSlug }] = await Promise.all([
        Preferences.get({ key: SERVER_URL_KEY }),
        Preferences.get({ key: TENANT_SLUG_KEY }),
    ]);
    if (!serverUrl || !tenantSlug) return null;
    return { serverUrl, tenantSlug };
}

export async function setAppConfig(config: AppConfig): Promise<void> {
    await Promise.all([
        Preferences.set({ key: SERVER_URL_KEY, value: config.serverUrl }),
        Preferences.set({ key: TENANT_SLUG_KEY, value: config.tenantSlug }),
    ]);
}

export async function clearAppConfig(): Promise<void> {
    await Promise.all([
        Preferences.remove({ key: SERVER_URL_KEY }),
        Preferences.remove({ key: TENANT_SLUG_KEY }),
    ]);
}
