import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { setAppConfig } from '../storage/appConfig';

/** Első indításkor kért szerver-URL + tenant slug — a rendszer több
 *  önálló céget (tenantot) szolgál ki ugyanazon a backendem, path-prefixes
 *  URL-mintával (`/{tenant}/...`, lásd TenantMiddleware), ezért a natív
 *  kliensnek is tudnia kell, melyik szerverhez és melyik tenanthoz kapcsolódjon. */
export function ServerSetupScreen() {
    const { onServerConfigured } = useAuth();
    const [serverUrl, setServerUrl] = useState('');
    const [tenantSlug, setTenantSlug] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        const trimmedUrl = serverUrl.trim().replace(/\/+$/, '');
        const trimmedSlug = tenantSlug.trim().toLowerCase();

        if (!/^https?:\/\/.+/.test(trimmedUrl)) {
            setError('Adjon meg egy érvényes szerver-címet (pl. https://cegem.pelda.hu).');
            return;
        }
        if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
            setError('A cég-azonosító csak kisbetűket, számokat és kötőjelet tartalmazhat.');
            return;
        }

        setBusy(true);
        try {
            await setAppConfig({ serverUrl: trimmedUrl, tenantSlug: trimmedSlug });
            onServerConfigured({ serverUrl: trimmedUrl, tenantSlug: trimmedSlug });
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="min-h-full flex flex-col justify-center px-6 py-10 safe-top safe-bottom bg-brand-chrome">
            <div className="mx-auto w-full max-w-sm">
                <h1 className="text-2xl font-bold text-white mb-1">KK Nyilvántartó</h1>
                <p className="text-sm text-white/60 mb-8">Adja meg a cége szerverét és azonosítóját a bejelentkezéshez.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-white/80 mb-1.5">Szerver-cím</label>
                        <input
                            type="url"
                            inputMode="url"
                            autoCapitalize="none"
                            autoCorrect="off"
                            placeholder="https://cegem.pelda.hu"
                            value={serverUrl}
                            onChange={(e) => setServerUrl(e.target.value)}
                            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/40 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-white/80 mb-1.5">Cég-azonosító</label>
                        <input
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            placeholder="pl. h2o-offices"
                            value={tenantSlug}
                            onChange={(e) => setTenantSlug(e.target.value)}
                            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/40 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                        />
                    </div>

                    {error && <p className="text-sm text-red-300">{error}</p>}

                    <button
                        type="submit"
                        disabled={busy}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-xl shadow-sm transition-colors"
                    >
                        {busy ? 'Mentés…' : 'Tovább'}
                    </button>
                </form>
            </div>
        </div>
    );
}
