import { useForm, usePage } from '@inertiajs/react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
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

            {/* Animált aurora blob-ok (app.css-ben már definiált keyframe-ek) */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none aurora-blob-1"/>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none aurora-blob-2"/>
            <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none aurora-blob-3"/>

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>

            <div className="relative w-full max-w-sm">

                {/* Logo + title */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="text-center mb-8"
                >
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
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
                    className="bg-white rounded-2xl shadow-2xl shadow-black/30 border border-white/10 p-6"
                >
                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-4 flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"
                        >
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                            {errorMsg}
                        </motion.div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="email">Email cím</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    id="email" type="email" name="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                                    placeholder="nev@ceg.hu"
                                    autoFocus required autoComplete="email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="password">Jelszó</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    id="password" type="password" name="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                                    placeholder="••••••••"
                                    required autoComplete="current-password"
                                />
                            </div>
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

                        <motion.button
                            type="submit"
                            disabled={processing}
                            whileHover={processing ? undefined : { scale: 1.015 }}
                            whileTap={processing ? undefined : { scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60 transition-colors shadow-sm shadow-blue-200 mt-2"
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ArrowRight className="w-4 h-4" />
                            )}
                            {processing ? 'Bejelentkezés...' : 'Bejelentkezés'}
                        </motion.button>
                    </form>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className="text-center mt-5"
                >
                    <a href={route('landing')} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                        ← Vissza a szervezetválasztóhoz
                    </a>
                </motion.p>

            </div>
        </div>
    );
}
