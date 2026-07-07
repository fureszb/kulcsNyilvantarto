import { useForm, Link } from '@inertiajs/react';
import { useOwnLayout } from '../../hooks/useOwnLayout';

declare function route(name: string, params?: unknown): string;

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
    };
}

function InputField({ label, id, type = 'text', value, onChange, error, required, autoComplete }: {
    label: string;
    id: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    required?: boolean;
    autoComplete?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor={id}>
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
                type={type}
                id={id}
                value={value}
                onChange={e => onChange(e.target.value)}
                required={required}
                autoComplete={autoComplete}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none transition"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

export default function ProfileEdit({ user }: Props) {
    const Layout = useOwnLayout();
    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('profile.update'), {
            onSuccess: () => reset('current_password', 'password', 'password_confirmation'),
        });
    }

    return (
        <Layout title="Profilom">

            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"/>
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"/>
                <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                <div className="relative px-8 sm:px-10 py-8 sm:py-10 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30 shrink-0">
                        <span className="text-2xl font-extrabold text-white">{(user.name ?? 'U').charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"/>
                            Fiók beállítások
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">{user.name}</h1>
                        <p className="text-slate-400 text-sm mt-0.5">{user.email}</p>
                    </div>
                    <div className="ml-auto hidden sm:block">
                        <Link
                            href={route('home')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-sm text-slate-300 hover:bg-white/15 hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Vissza a főoldalra
                        </Link>
                    </div>
                </div>
            </div>

            {/* Success notice */}
            {recentlySuccessful && (
                <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Profil sikeresen mentve!
                </div>
            )}

            {/* Form - two columns on lg */}
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Basic info */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                                Alapadatok
                            </p>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <InputField label="Teljes név" id="name" value={data.name} onChange={v => setData('name', v)} required error={errors.name}/>
                            <InputField label="Email cím" id="email" type="email" value={data.email} onChange={v => setData('email', v)} required error={errors.email}/>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                </svg>
                                Jelszóváltoztatás
                            </p>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <p className="text-xs text-slate-400">Csak akkor töltse ki, ha jelszavát meg kívánja változtatni.</p>
                            <InputField label="Jelenlegi jelszó" id="current_password" type="password" value={data.current_password} onChange={v => setData('current_password', v)} error={errors.current_password} autoComplete="current-password"/>
                            <InputField label="Új jelszó" id="password" type="password" value={data.password} onChange={v => setData('password', v)} error={errors.password} autoComplete="new-password"/>
                            <InputField label="Új jelszó megerősítése" id="password_confirmation" type="password" value={data.password_confirmation} onChange={v => setData('password_confirmation', v)} autoComplete="new-password"/>
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
                    >
                        {processing ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                        )}
                        Mentés
                    </button>
                </div>
            </form>

        </Layout>
    );
}
