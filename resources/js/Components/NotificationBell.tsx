import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { getEcho } from '../echo';
import type { PageProps } from '../types';

declare function route(name: string, params?: unknown): string;

type NfcEventType = 'entered' | 'exited' | 'denied';

interface NfcNotificationItem {
    id: number | string;
    actor_name: string;
    location_name: string;
    type: NfcEventType;
    occurred_at: string;
    read_at: string | null;
}

interface LiveEvent {
    userName: string;
    locationName: string;
    type: NfcEventType;
    occurredAt: string;
}

function csrfToken(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

const TYPE_LABEL: Record<NfcEventType, string> = {
    entered: 'belépett',
    exited: 'kilépett',
    denied: 'jogosulatlan próbálkozás',
};

const TYPE_COLOR: Record<NfcEventType, string> = {
    entered: 'text-green-600 bg-green-50',
    exited: 'text-blue-600 bg-blue-50',
    denied: 'text-red-600 bg-red-50',
};

export default function NotificationBell() {
    const { auth, tenant, nav } = usePage<PageProps>().props;
    const user = auth.user;
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(nav?.newNfcNotifications ?? 0);
    const [notifications, setNotifications] = useState<NfcNotificationItem[]>([]);
    const [toast, setToast] = useState<LiveEvent | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => setUnreadCount(nav?.newNfcNotifications ?? 0), [nav?.newNfcNotifications]);

    useEffect(() => {
        if (!tenant?.slug || !user?.id) return;
        const channel = getEcho(tenant.slug).private(`tenant.${tenant.slug}.${user.id}`);
        channel.listen('.nfc-access', (evt: LiveEvent) => {
            setUnreadCount(n => n + 1);
            setNotifications(prev => [
                { id: `live-${Date.now()}`, actor_name: evt.userName, location_name: evt.locationName, type: evt.type, occurred_at: evt.occurredAt, read_at: null },
                ...prev,
            ].slice(0, 20));

            setToast(evt);
            if (toastTimer.current) clearTimeout(toastTimer.current);
            toastTimer.current = setTimeout(() => setToast(null), 6000);
        });
        return () => { channel.stopListening('.nfc-access'); };
    }, [tenant?.slug, user?.id]);

    async function toggleOpen() {
        const next = !open;
        setOpen(next);
        if (!next) return;

        try {
            const res = await fetch(route('nfc-notifications.index'), { headers: { Accept: 'application/json' } });
            const data = await res.json();
            setNotifications(data.notifications ?? []);
        } catch { /* csendben elnyeljük — a badge már mutatta a számot */ }

        if (unreadCount > 0) {
            try {
                await fetch(route('nfc-notifications.read'), {
                    method: 'POST',
                    headers: { 'X-CSRF-TOKEN': csrfToken(), Accept: 'application/json' },
                });
                setUnreadCount(0);
            } catch { /* legközelebb újra próbálja */ }
        }
    }

    if (!user) return null;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={toggleOpen}
                aria-label="Értesítések"
                className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold leading-none px-0.5">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-11 z-50 w-80 max-w-[90vw] py-1.5 rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden">
                        <div className="px-3.5 py-2.5 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">NFC beléptetés</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <p className="px-3.5 py-6 text-center text-xs text-slate-400">Nincs még esemény.</p>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} className="px-3.5 py-2.5 border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${TYPE_COLOR[n.type]}`}>{TYPE_LABEL[n.type]}</span>
                                            <span className="text-[11px] text-slate-400 ml-auto">{formatTime(n.occurred_at)}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 mt-1">
                                            <span className="font-semibold">{n.actor_name}</span> — {n.location_name}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {toast && (
                <div className="fixed top-4 right-4 z-[998] pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-3 px-4 py-3.5 bg-white border border-slate-200 shadow-xl rounded-2xl min-w-[280px] max-w-sm animate-slide-in-r">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLOR[toast.type]}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <p className="text-sm text-slate-700 flex-1">
                            <span className="font-semibold">{toast.userName}</span> {TYPE_LABEL[toast.type]} — {toast.locationName}
                        </p>
                        <button onClick={() => setToast(null)} className="text-slate-300 hover:text-slate-500 transition-colors ml-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
