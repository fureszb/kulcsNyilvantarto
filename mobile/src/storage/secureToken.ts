import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

// A Sanctum bearer token Keychain (iOS) / EncryptedSharedPreferences (Android)
// mögé kerül — SOHA nem localStorage/Preferences (azok nem titkosítottak).
const TOKEN_KEY = 'kk_auth_token';

export async function getToken(): Promise<string | null> {
    try {
        const { value } = await SecureStoragePlugin.get({ key: TOKEN_KEY });
        return value;
    } catch {
        // A plugin hibát dob, ha a kulcs nem létezik — ez a "nincs bejelentkezve" eset.
        return null;
    }
}

export async function setToken(token: string): Promise<void> {
    await SecureStoragePlugin.set({ key: TOKEN_KEY, value: token });
}

export async function clearToken(): Promise<void> {
    try {
        await SecureStoragePlugin.remove({ key: TOKEN_KEY });
    } catch {
        // már nem volt token — nem hiba
    }
}
