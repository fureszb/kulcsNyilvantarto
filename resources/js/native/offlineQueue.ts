const STORAGE_KEY = 'kk_offline_queue';

export interface QueuedAction {
    id: string;
    type: 'nfc_scan' | 'geofence_ping';
    payload: Record<string, unknown>;
    queuedAt: string;
}

/** Egyszerű, localStorage-alapú perzisztens sor — a várható méret (néhány
 *  tíz elem egy műszak alatt, ha épp nincs lefedettség) miatt nem indokolt
 *  IndexedDB-t bevezetni. Csak akkor kerül ide elem, ha a POST hálózati
 *  szinten hiúsult meg (nincs szerver-válasz), nem üzleti-logikai hiba
 *  (403/404) esetén — azt a szerver már véglegesen eldöntötte. */
function readQueue(): QueuedAction[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeQueue(queue: QueuedAction[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch {
        // privát mód / letiltott storage — nem kritikus, csak elveszik a sor
    }
}

export function enqueueAction(type: QueuedAction['type'], payload: Record<string, unknown>): void {
    const queue = readQueue();
    queue.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        payload,
        queuedAt: new Date().toISOString(),
    });
    writeQueue(queue);
}

export function getQueue(): QueuedAction[] {
    return readQueue();
}

export function getQueueLength(): number {
    return readQueue().length;
}

export function removeFromQueue(id: string): void {
    writeQueue(readQueue().filter((item) => item.id !== id));
}
