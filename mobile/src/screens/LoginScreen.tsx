import axios from 'axios';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { clearAppConfig } from '../storage/appConfig';
import type { ApiValidationError } from '../types';

export function LoginScreen() {
    const { login, appConfig, clearServerConfig } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
            await login(email.trim(), password);
        } catch (err) {
            if (axios.isAxiosError<ApiValidationError>(err) && err.response) {
                setError(err.response.data.message ?? 'Bejelentkezés sikertelen.');
            } else {
                setError('Nem sikerült kapcsolódni a szerverhez.');
            }
        } finally {
            setBusy(false);
        }
    }

    async function handleChangeServer() {
        await clearAppConfig();
        // Az AuthContext appConfig state-je null-ra vált, az App gyökér-router
        // ekkor visszaküld a ServerSetupScreen-re.
        clearServerConfig();
    }

    return (
        <div className="min-h-full flex flex-col justify-center px-6 py-10 safe-top safe-bottom bg-brand-chrome">
            <div className="mx-auto w-full max-w-sm">
                <h1 className="text-2xl font-bold text-white mb-1">Bejelentkezés</h1>
                <p className="text-sm text-white/60 mb-8">{appConfig?.tenantSlug}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-white/80 mb-1.5">Email</label>
                        <input
                            type="email"
                            inputMode="email"
                            autoCapitalize="none"
                            autoCorrect="off"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/40 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-white/80 mb-1.5">Jelszó</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/40 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                        />
                    </div>

                    {error && <p className="text-sm text-red-300">{error}</p>}

                    <button
                        type="submit"
                        disabled={busy}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-xl shadow-sm transition-colors"
                    >
                        {busy ? 'Bejelentkezés…' : 'Bejelentkezés'}
                    </button>

                    <button
                        type="button"
                        onClick={handleChangeServer}
                        className="w-full text-center text-sm text-white/50 hover:text-white/80 transition-colors"
                    >
                        Másik cég / szerver megadása
                    </button>
                </form>
            </div>
        </div>
    );
}
