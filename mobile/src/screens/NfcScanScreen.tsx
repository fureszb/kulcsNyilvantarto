import { Haptics, NotificationType } from '@capacitor/haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CapacitorNfc, type NfcEvent, type PluginListenerHandle } from '@capgo/capacitor-nfc';
import { formatTagUid, scanTag } from '../api/nfc';
import { Card } from '../components/Card';
import type { NfcScanResponse } from '../types';

type ScreenState = 'idle' | 'unsupported' | 'scanning' | 'submitting';

export function NfcScanScreen() {
    const [state, setState] = useState<ScreenState>('idle');
    const [result, setResult] = useState<NfcScanResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const listenerRef = useRef<PluginListenerHandle | null>(null);

    useEffect(() => {
        CapacitorNfc.isSupported()
            .then(({ supported }) => { if (!supported) setState('unsupported'); })
            .catch(() => setState('unsupported'));

        return () => {
            listenerRef.current?.remove();
            CapacitorNfc.stopScanning().catch(() => {});
        };
    }, []);

    const handleTag = useCallback(async (event: NfcEvent) => {
        const idBytes = event.tag.id;
        if (!idBytes || idBytes.length === 0) return;

        const tagUid = formatTagUid(idBytes);
        setState('submitting');
        setError(null);

        try {
            const response = await scanTag(tagUid);
            setResult(response);
            await Haptics.notification({
                type: response.status === 'checked' ? NotificationType.Success : NotificationType.Warning,
            }).catch(() => {});
        } catch {
            setError('Az ellenőrzés rögzítése sikertelen — próbálja újra.');
        } finally {
            setState('idle');
            await CapacitorNfc.stopScanning().catch(() => {});
        }
    }, []);

    async function startScan() {
        setError(null);
        setResult(null);
        try {
            listenerRef.current?.remove();
            listenerRef.current = await CapacitorNfc.addListener('nfcEvent', handleTag);
            // iosSessionType: 'tag' kell a nyers (nem-NDEF) matrica-UID olvasásához —
            // ez iOS-en a `Near Field Communication Tag Reader Session Formats`
            // entitlementet igényli az Xcode projektben, enélkül a session NFC_OK
            // helyett hibával tér vissza. A testvér Kotlin appban az iOS NFC-olvasó
            // jelenleg is placeholder ugyanezen okból (lásd docs/api-contract/nfc.md).
            await CapacitorNfc.startScanning({ iosSessionType: 'tag', invalidateAfterFirstRead: true });
            setState('scanning');
        } catch {
            setError('Az NFC-olvasó indítása sikertelen. Ellenőrizze, hogy az NFC be van-e kapcsolva.');
        }
    }

    async function cancelScan() {
        await CapacitorNfc.stopScanning().catch(() => {});
        setState('idle');
    }

    return (
        <div className="px-4 py-6 space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900">NFC ellenőrzés</h1>
                <Link to="/nfc/history" className="text-sm font-medium text-brand-accent">Előzmények</Link>
            </div>

            {state === 'unsupported' && (
                <Card className="p-4 text-sm text-slate-600">
                    Ez az eszköz nem támogatja az NFC-t, vagy jelenleg ki van kapcsolva.
                </Card>
            )}

            {state !== 'unsupported' && (
                <div className="flex flex-col items-center gap-4 py-8">
                    <button
                        onClick={state === 'scanning' ? cancelScan : startScan}
                        disabled={state === 'submitting'}
                        className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                            state === 'scanning' ? 'bg-amber-500' : 'bg-brand-accent'
                        } disabled:opacity-50`}
                    >
                        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.5 8.5a5 5 0 017 7M6 6a9 9 0 0112 12M12 12a1 1 0 100 2 1 1 0 000-2z" />
                        </svg>
                    </button>
                    <p className="text-sm text-slate-500">
                        {state === 'scanning' ? 'Közelítse a telefont a matricához… (koppintás a leállításhoz)'
                            : state === 'submitting' ? 'Feldolgozás…'
                            : 'Koppintson az olvasás indításához'}
                    </p>
                </div>
            )}

            {error && <Card className="p-4 text-sm text-red-600 border-red-200">{error}</Card>}

            {result && (
                <Card className={`p-4 ${result.status === 'checked' ? 'border-emerald-200' : 'border-red-200'}`}>
                    <div className={`text-sm font-semibold ${result.status === 'checked' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {result.tag?.label ?? (result.status === 'checked' ? 'Ellenőrizve' : 'Elutasítva')}
                    </div>
                    {result.location && <div className="text-xs text-slate-500 mt-1">{result.location.name}</div>}
                    {result.message && <div className="text-xs text-slate-500 mt-1">{result.message}</div>}
                </Card>
            )}
        </div>
    );
}
