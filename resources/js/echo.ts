import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo;
    }
}

let instance: Echo | null = null;

export function getEcho(tenantSlug: string): Echo {
    if (!instance) {
        window.Pusher = Pusher;
        instance = new Echo({
            broadcaster:        'reverb',
            key:                import.meta.env.VITE_REVERB_APP_KEY as string,
            wsHost:             import.meta.env.VITE_REVERB_HOST as string,
            wsPort:             parseInt(import.meta.env.VITE_REVERB_PORT ?? '443'),
            wssPort:            parseInt(import.meta.env.VITE_REVERB_PORT ?? '443'),
            forceTLS:           (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
            enabledTransports:  ['ws', 'wss'],
            authEndpoint:       `/${tenantSlug}/broadcasting/auth`,
        });
    }
    return instance;
}

export function disconnectEcho(): void {
    instance?.disconnect();
    instance = null;
}
