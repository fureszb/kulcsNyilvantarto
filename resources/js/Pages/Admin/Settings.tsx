import { useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface Settings {
    global_email?: string;
    training_notification_email?: string;
    security_notification_email?: string;
    admin_password_hint?: string;
}

interface Props {
    globalEmail?: string;
    trainingNotificationEmail?: string;
    securityNotificationEmail?: string;
}

interface FormData {
    global_email: string;
    training_notification_email: string;
    security_notification_email: string;
    new_password: string;
    new_password_confirmation: string;
    [key: string]: unknown;
}

export default function SettingsPage({ globalEmail, trainingNotificationEmail, securityNotificationEmail }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        global_email: globalEmail ?? '',
        training_notification_email: trainingNotificationEmail ?? '',
        security_notification_email: securityNotificationEmail ?? '',
        new_password: '',
        new_password_confirmation: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('admin.settings.update'));
    }

    return (
        <AdminLayout title="Beállítások">
            <div className="max-w-2xl space-y-6">

                {/* Email & jelszó kártya */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800">Általános beállítások</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Email értesítések és admin hozzáférés</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="px-6 py-6 space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="global_email">
                                Kulcsnyilvántartó – értesítési email
                            </label>
                            <input
                                type="email"
                                id="global_email"
                                value={data.global_email}
                                onChange={(e) => setData('global_email', e.target.value)}
                                placeholder="iroda@pelda.hu"
                                className={`w-full px-4 py-2.5 rounded-xl border ${errors.global_email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'} text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors`}
                            />
                            <p className="text-xs text-slate-400 mt-1.5">Minden ellenőrzés után erre az email-re is megy értesítés (a helyszín emailje mellett).</p>
                            {errors.global_email && <p className="text-red-500 text-xs mt-1">{errors.global_email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="training_notification_email">
                                Oktatások – felelős email
                            </label>
                            <input
                                type="email"
                                id="training_notification_email"
                                value={data.training_notification_email}
                                onChange={(e) => setData('training_notification_email', e.target.value)}
                                placeholder="oktatas@pelda.hu"
                                className={`w-full px-4 py-2.5 rounded-xl border ${errors.training_notification_email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'} text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors`}
                            />
                            <p className="text-xs text-slate-400 mt-1.5">Minden elvégzett oktatás eredménye automatikusan erre a címre kerül elküldésre.</p>
                            {errors.training_notification_email && <p className="text-red-500 text-xs mt-1">{errors.training_notification_email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="security_notification_email">
                                Napi Jelentés – értesítési email(ek)
                            </label>
                            <input
                                type="text"
                                id="security_notification_email"
                                value={data.security_notification_email}
                                onChange={(e) => setData('security_notification_email', e.target.value)}
                                placeholder="biztonsag@pelda.hu, vezeto@pelda.hu"
                                className={`w-full px-4 py-2.5 rounded-xl border ${errors.security_notification_email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'} text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors`}
                            />
                            <p className="text-xs text-slate-400 mt-1.5">Vesszővel elválasztva több email-cím is megadható. Minden új napi jelentés automatikusan kiküldésre kerül.</p>
                            {errors.security_notification_email && <p className="text-red-500 text-xs mt-1">{errors.security_notification_email}</p>}
                        </div>

                        <div className="border-t border-slate-100 pt-5">
                            <div className="flex items-center gap-2 mb-4">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                </svg>
                                <h3 className="text-sm font-bold text-slate-700">Admin jelszó módosítása</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="new_password">Új jelszó</label>
                                    <input
                                        type="password"
                                        id="new_password"
                                        value={data.new_password}
                                        onChange={(e) => setData('new_password', e.target.value)}
                                        placeholder="Legalább 6 karakter"
                                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.new_password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'} text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors`}
                                    />
                                    {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="new_password_confirmation">Jelszó megerősítése</label>
                                    <input
                                        type="password"
                                        id="new_password_confirmation"
                                        value={data.new_password_confirmation}
                                        onChange={(e) => setData('new_password_confirmation', e.target.value)}
                                        placeholder="Jelszó ismét"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">Hagyja üresen, ha nem szeretné megváltoztatni a jelszót.</p>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                Beállítások mentése
                            </button>
                        </div>
                    </form>
                </div>

                {/* SMTP info kártya */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800">Email konfiguráció</h2>
                            <p className="text-xs text-slate-500 mt-0.5">SMTP beállítások a szerver <code className="font-mono bg-slate-100 px-1 rounded">.env</code> fájljában</p>
                        </div>
                    </div>
                    <div className="px-6 py-5">
                        <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed">{`MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=app_specific_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your@gmail.com
MAIL_FROM_NAME="Kulcs Nyilvántartó"`}</pre>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
