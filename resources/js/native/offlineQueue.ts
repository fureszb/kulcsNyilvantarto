import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'kk_offline_queue';

export interface QueuedAction {
    id: string;
    type: 'nfc_scan' | 'geofence_ping';
    payload: Record<string, unknown>;
    queuedAt: string;
}

/** @capacitor/preferences-alapú perzisztens sor (natív SharedPreferences/
 *  UserDefaults) — SZÁNDÉKOSAN nem localStorage: az utóbbi az aktuális
 *  webes origin-hez (https://cortexopsystems.com) kötött, a natív offline
 *  fallback oldal (mobile/www/index.html) viszont file://-ról fut, saját,
 *  ÜRES localStorage-dzsal — nem látná a queue-t. A Preferences ezzel
 *  szemben app-szintű, bármelyik betöltött oldalról ugyanaz. A várható
 *  méret (néhány tíz elem egy műszak alatt) miatt nem indokolt SQLite/
 *  IndexedDB-t bevezetni. Csak akkor kerül ide elem, ha a POST hálózati
 *  szinten hiúsult meg (nincs szerver-válasz), nem üzleti-logikai hiba
 *  (403/404) esetén — azt a szerver már véglegesen eldöntötte. */
async function readQueue(): Promise<QueuedAction[]> {
    try {
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        return value ? JSON.parse(value) : [];
    } catch {
        return [];
    }
}

async function writeQueue(queue: QueuedAction[]): Promise<void> {
    try {
        await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(queue) });
    } catch {
        // natív storage-hiba — nem kritikus, csak elveszik a sor
    }
}

export async function enqueueAction(type: QueuedAction['type'], payload: Record<string, unknown>): Promise<void> {
    const queue = await readQueue();
    queue.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        payload,
        queuedAt: new Date().toISOString(),
    });
    await writeQueue(queue);
}

export async function getQueue(): Promise<QueuedAction[]> {
    return readQueue();
}

export async function getQueueLength(): Promise<number> {
    return (await readQueue()).length;
}

export async function removeFromQueue(id: string): Promise<void> {
    await writeQueue((await readQueue()).filter((item) => item.id !== id));
}

/** Idempotencia-kulcs egy adott NFC-scan/geofence-ping kísérlethez — UGYANAZT
 *  az értéket kell elküldeni élőben ÉS a queue-ba eltett/később szinkronizált
 *  változatnál is, hogy a szerver felismerje, ha a "hálózati hiba" valójában
 *  csak a válasz veszett el (a kérés célba ért). */
export function generateClientRef(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
