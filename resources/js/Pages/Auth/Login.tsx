import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '../../types';

interface Props {
    errors?: Record<string, string>;
}

export default function Login({ errors = {} }: Props) {
    const { tenant, flash } = usePage<PageProps>().props;
    const tenantName = tenant?.name ?? 'KK Nyilvántartó';

    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('login.post'));
    }

    const errorMsg = errors.email ?? errors.password ?? flash.error;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">

            {/* Blobs */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"/>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"/>

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>

            <div className="relative w-full max-w-sm">

                {/* Logo + title */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-900/50">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">{tenantName}</h1>
                    <p className="text-slate-400 text-sm mt-1.5 flex items-center justify-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"/>
                        Kulcs & Kártya Nyilvántartó
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 border border-white/10 p-6">
                    {errorMsg && (
                        <div className="mb-4 flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="email">Email cím</label>
                            <input
                                id="email" type="email" name="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none transition"
                                placeholder="nev@ceg.hu"
                                autoFocus required autoComplete="email"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="password">Jelszó</label>
                            <input
                                id="password" type="password" name="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none transition"
                                placeholder="••••••••"
                                required autoComplete="current-password"
                            />
                        </div>

                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-600">Emlékezz rám</span>
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60 transition-colors shadow-sm shadow-blue-200 mt-2"
                        >
                            {processing ? (
                                <span className="dui-loading dui-loading-spinner dui-loading-sm" />
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                                </svg>
                            )}
                            {processing ? 'Bejelentkezés...' : 'Bejelentkezés'}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-5">
                    <a href={route('landing')} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                        ← Vissza a szervezetválasztóhoz
                    </a>
                </p>

            </div>
        </div>
    );
}
