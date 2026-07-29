import { useEffect, useState } from 'react';
import { getNfcHistory } from '../api/nfc';
import { Card } from '../components/Card';
import type { NfcHistoryEntry } from '../types';

export function NfcHistoryScreen() {
    const [entries, setEntries] = useState<NfcHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNfcHistory().then(setEntries).catch(() => {}).finally(() => setLoading(false));
    }, []);

    return (
        <div className="px-4 py-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-900">NFC előzmények</h1>

            {loading ? (
                <div className="skeleton h-32 w-full" />
            ) : entries.length === 0 ? (
                <p className="text-sm text-slate-500">Még nincs rögzített ellenőrzés.</p>
            ) : (
                <Card className="divide-y divide-slate-100">
                    {entries.map((entry) => {
                        const isDenied = entry.event_type === 'nfc.denied';
                        return (
                            <div key={entry.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                <div>
                                    <div className={`text-sm font-medium ${isDenied ? 'text-red-600' : 'text-slate-800'}`}>
                                        {entry.tag_label ?? (isDenied ? 'Elutasított kísérlet' : 'Ellenőrzés')}
                                    </div>
                                    {entry.location_name && (
                                        <div className="text-xs text-slate-500">{entry.location_name}</div>
                                    )}
                                </div>
                                <span className="text-xs text-slate-400 shrink-0">
                                    {new Date(entry.occurred_at).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })}
                </Card>
            )}
        </div>
    );
}
