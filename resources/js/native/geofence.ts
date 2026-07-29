import axios from 'axios';
import { Geolocation, type CallbackID } from '@capacitor/geolocation';

const MIN_PING_INTERVAL_MS = 30_000;

let watchId: CallbackID | null = null;
let lastPingAt = 0;

/** Előtér-GPS-ping hurok: a `watchPosition` esemény-vezérelt (nem
 *  setInterval-lel pollozott getCurrentPosition), de a szerverre csak
 *  MIN_PING_INTERVAL_MS-enként küldünk pinget, hogy ne árasszuk el a
 *  végpontot minden GPS-frissítésnél. Csak előtérben fut — háttér-
 *  követéshez külön natív konfiguráció (Android foreground service, iOS
 *  background mode) kellene, ez egy későbbi fázis terve. */
export async function startGeofenceTracking(): Promise<boolean> {
    if (watchId !== null) return true;

    const permission = await Geolocation.requestPermissions();
    if (permission.location !== 'granted' && permission.coarseLocation !== 'granted') {
        return false;
    }

    watchId = await Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 10_000 }, (position) => {
        if (!position) return;

        const now = Date.now();
        if (now - lastPingAt < MIN_PING_INTERVAL_MS) return;
        lastPingAt = now;

        axios.post(route('native.geofence.ping'), {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            recorded_at: new Date(position.timestamp).toISOString(),
        }).catch(() => {
            // hálózati hiba esetén a következő ping (legfeljebb
            // MIN_PING_INTERVAL_MS múlva) úgyis megpróbálja újra
        });
    });

    return true;
}

export async function stopGeofenceTracking(): Promise<void> {
    if (watchId === null) return;
    await Geolocation.clearWatch({ id: watchId });
    watchId = null;
}
