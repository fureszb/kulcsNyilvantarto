import axios from 'axios';
import { Network } from '@capacitor/network';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { getQueue, removeFromQueue, type QueuedAction } from './offlineQueue';

const ENDPOINTS: Record<QueuedAction['type'], string> = {
    nfc_scan: 'native.nfc.scan',
    geofence_ping: 'native.geofence.ping',
};

let flushing = false;
let onQueueChanged: (() => void) | null = null;
let onSessionExpired: (() => void) | null = null;

export function onOfflineQueueChanged(callback: () => void): void {
    onQueueChanged = callback;
}

/** A UI (AppLayout) ide iratkozik fel, hogy bannert mutasson, ha a
 *  szinkronizálás lejárt munkamenet miatt akadt el — anélkül a user offline
 *  szakasz után csendben soha nem szinkronizálna, észrevétlenül. */
export function onOfflineSyncSessionExpired(callback: () => void): void {
    onSessionExpired = callback;
}

/** Sorban, egymás után küldi be a felgyűlt elemeket — HTTP-választ kapó
 *  eredmény (siker VAGY 403/404 üzleti elutasítás) végleges, törlődik a
 *  sorból. 401/419 (lejárt munkamenet) esetén megáll a feldolgozás, mert
 *  további elemek is ugyanígy elbuknának, amíg a user újra be nem
 *  jelentkezik. Nyers hálózati hiba (nincs válasz) esetén szintén megáll —
 *  még mindig nincs net. */
export async function flushOfflineQueue(): Promise<void> {
    if (flushing) return;
    flushing = true;

    try {
        for (const item of await getQueue()) {
            try {
                await axios.post(route(ENDPOINTS[item.type]), item.payload);
                await removeFromQueue(item.id);
                onQueueChanged?.();
            } catch (error) {
                if (!axios.isAxiosError(error) || !error.response) {
                    break; // nincs net, próbáljuk később
                }
                if (error.response.status === 401 || error.response.status === 419) {
                    onSessionExpired?.();
                    break; // lejárt munkamenet, be kell jelentkezni újra
                }
                // egyéb HTTP-válasz (siker, 403, 404) — a szerver döntött, kivesszük
                await removeFromQueue(item.id);
                onQueueChanged?.();
            }
        }
    } finally {
        flushing = false;
    }
}

export function initOfflineSync(): void {
    if (!Capacitor.isNativePlatform()) return;

    flushOfflineQueue();

    Network.addListener('networkStatusChange', (status) => {
        if (status.connected) flushOfflineQueue();
    });

    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) flushOfflineQueue();
    });
}
