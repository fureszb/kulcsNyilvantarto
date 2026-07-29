import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../components/Card';
import { disableNativePush, enableNativePush } from '../native/push';
import { isGeofenceTrackingActive, startGeofenceTracking, stopGeofenceTracking } from '../native/geofence';

function ToggleRow({
    label, description, checked, busy, onChange,
}: { label: string; description: string; checked: boolean; busy: boolean; onChange: (next: boolean) => void }) {
    return (
        <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div>
                <div className="text-sm font-medium text-slate-800">{label}</div>
                <div className="text-xs text-slate-500">{description}</div>
            </div>
            <button
                role="switch"
                aria-checked={checked}
                disabled={busy}
                onClick={() => onChange(!checked)}
                className={`w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-brand-accent' : 'bg-slate-200'} disabled:opacity-50`}
            >
                <span className={`block w-5 h-5 rounded-full bg-white shadow transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
        </div>
    );
}

export function ProfileScreen() {
    const { user, logout } = useAuth();
    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushBusy, setPushBusy] = useState(false);
    const [geofenceEnabled, setGeofenceEnabled] = useState(() => isGeofenceTrackingActive());
    const [geofenceBusy, setGeofenceBusy] = useState(false);
    const [pushError, setPushError] = useState<string | null>(null);
    const [geofenceError, setGeofenceError] = useState<string | null>(null);

    async function handlePushToggle(next: boolean) {
        setPushError(null);
        setPushBusy(true);
        try {
            if (next) {
                const ok = await enableNativePush();
                setPushEnabled(ok);
                if (!ok) setPushError('Az értesítések engedélyezése sikertelen.');
            } else {
                await disableNativePush();
                setPushEnabled(false);
            }
        } finally {
            setPushBusy(false);
        }
    }

    async function handleGeofenceToggle(next: boolean) {
        setGeofenceError(null);
        setGeofenceBusy(true);
        try {
            if (next) {
                const ok = await startGeofenceTracking();
                setGeofenceEnabled(ok);
                if (!ok) setGeofenceError('A helymeghatározás engedélyezése sikertelen.');
            } else {
                await stopGeofenceTracking();
                setGeofenceEnabled(false);
            }
        } finally {
            setGeofenceBusy(false);
        }
    }

    return (
        <div className="px-4 py-6 space-y-5">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-chrome flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-white">{user?.name.charAt(0)}</span>
                </div>
                <div>
                    <div className="text-lg font-bold text-slate-900">{user?.name}</div>
                    <div className="text-sm text-slate-500">{user?.email}</div>
                </div>
            </div>

            <div>
                <h2 className="text-sm font-semibold text-slate-700 mb-2">Beállítások</h2>
                <Card className="divide-y divide-slate-100">
                    <ToggleRow
                        label="Push értesítések"
                        description="NFC-elutasítás és geofencing riasztások"
                        checked={pushEnabled}
                        busy={pushBusy}
                        onChange={handlePushToggle}
                    />
                    <ToggleRow
                        label="Helymeghatározás (geofencing)"
                        description="Élő pozíció küldése, amíg az app előtérben fut"
                        checked={geofenceEnabled}
                        busy={geofenceBusy}
                        onChange={handleGeofenceToggle}
                    />
                </Card>
                {pushError && <p className="text-xs text-red-600 mt-2">{pushError}</p>}
                {geofenceError && <p className="text-xs text-red-600 mt-2">{geofenceError}</p>}
            </div>

            <Card>
                <Link to="/nfc/history" className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">NFC előzmények</span>
                    <span className="text-slate-400">›</span>
                </Link>
            </Card>

            <button
                onClick={() => logout()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-sm transition-colors"
            >
                Kilépés
            </button>
        </div>
    );
}
