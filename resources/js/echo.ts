import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo;
        __REVERB_CONFIG__: {
            key: string;
            wsHost: string;
            wsPort: number;
            forceTLS: boolean;
        };
    }
}

let instance: Echo | null = null;

export function getEcho(tenantSlug: string): Echo {
    if (!instance) {
        window.Pusher = Pusher;
        const cfg = window.__REVERB_CONFIG__ ?? {};
        instance = new Echo({
            broadcaster:       'reverb',
            key:               cfg.key,
            wsHost:            cfg.wsHost,
            wsPort:            cfg.wsPort ?? 443,
            wssPort:           cfg.wsPort ?? 443,
            forceTLS:          cfg.forceTLS ?? true,
            enabledTransports: ['ws', 'wss'],
            authEndpoint:      `/${tenantSlug}/broadcasting/auth`,
        });
    }
    return instance;
}

export function disconnectEcho(): void {
    instance?.disconnect();
    instance = null;
}
