import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { scanNfcTag, cancelNfcScan, type NfcScanResult } from '../native/nfc';
import { getQueueLength } from '../native/offlineQueue';
import { onOfflineQueueChanged } from '../native/offlineSync';

/** Csak natív Capacitor WebView-ban jelenik meg (böngészőben nincs NFC-
 *  hozzáférés) — a fejlécben elérhető gyors NFC-checkpoint-beolvasás,
 *  bárhonnan a natív appból. A jobb felső pöttyben a még szinkronizálásra
 *  váró (offline, hálózat nélkül rögzített) beolvasások száma látszik. */
export default function NativeNfcScanButton() {
    const [state, setState] = useState<'idle' | 'scanning'>('idle');
    const [result, setResult] = useState<NfcScanResult | null>(null);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
        setPendingCount(getQueueLength());
        onOfflineQueueChanged(() => setPendingCount(getQueueLength()));
    }, []);

    if (!Capacitor.isNativePlatform()) return null;

    async function startScan() {
        setResult(null);
        setState('scanning');
        const outcome = await scanNfcTag();
        setState('idle');
        setResult(outcome);
        setPendingCount(getQueueLength());
    }

    async function cancel() {
        await cancelNfcScan();
        setState('idle');
    }

    return (
        <>
            <button
                onClick={startScan}
                title={pendingCount > 0 ? `NFC beolvasás (${pendingCount} szinkronizálásra vár)` : 'NFC beolvasás'}
                aria-label="NFC beolvasás"
                className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                {pendingCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-amber-500 text-white text-[9px] font-bold leading-none px-0.5">
                        {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                )}
            </button>

            {(state === 'scanning' || result) && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 px-6" onClick={() => { if (state === 'idle') setResult(null); }}>
                    <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center" onClick={(e) => e.stopPropagation()}>
                        {state === 'scanning' ? (
                            <>
                                <div className="w-10 h-10 mx-auto mb-3 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                                <p className="text-sm font-medium text-slate-700">Közelítse a telefont az NFC-matricához…</p>
                                <button onClick={cancel} className="mt-4 text-xs text-slate-500 hover:text-slate-700">Mégse</button>
                            </>
                        ) : result && (
                            <>
                                <p className={`text-sm font-semibold ${
                                    result.status === 'checked' ? 'text-emerald-600'
                                        : result.status === 'queued' ? 'text-amber-600'
                                        : 'text-red-600'
                                }`}>
                                    {result.status === 'checked' && `Ellenőrizve — ${result.tagLabel ?? ''} (${result.locationName ?? ''})`}
                                    {result.status === 'queued' && 'Nincs internet — a beolvasás mentve, automatikusan szinkronizálódik, ha visszajön a net.'}
                                    {(result.status === 'denied' || result.status === 'error') && (result.message ?? 'Sikertelen beolvasás.')}
                                </p>
                                <button onClick={() => setResult(null)} className="mt-4 text-xs text-slate-500 hover:text-slate-700">Bezár</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
