import { useForm, Link } from '@inertiajs/react';
import SuperAdminLayout from '../../../Layouts/SuperAdminLayout';

declare function route(name: string, params?: unknown): string;

interface FormData {
    name: string;
    slug: string;
    [key: string]: unknown;
}

function slugify(str: string): string {
    return str
        .toLowerCase()
        .replace(/[áàäâã]/g, 'a').replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i').replace(/[óòöôőõ]/g, 'o')
        .replace(/[úùüûű]/g, 'u').replace(/[ñ]/g, 'n')
        .replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
        .replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

export default function TenantCreate() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        slug: '',
    });

    function handleNameChange(value: string) {
        setData((prev) => ({
            ...prev,
            name: value,
            slug: slugify(value),
        }));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('super-admin.tenants.store'));
    }

    return (
        <SuperAdminLayout title="Új cég felvétele">
            <div className="max-w-lg">
                <div className="mb-8 flex items-center gap-3">
                    <Link
                        href={route('super-admin.dashboard')}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Új cég felvétele</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Külön adatbázis és URL jön létre automatikusan.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
                    <form onSubmit={submit}>

                        <div className="mb-5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2" htmlFor="name">
                                Cég neve *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                autoFocus
                                value={data.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                className={`w-full rounded-xl border-2 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition text-sm ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
                                placeholder="pl. Liwo Kft."
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                        </div>

                        <div className="mb-7">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2" htmlFor="slug">
                                URL azonosító (slug) *
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-sm font-mono bg-slate-50 border-2 border-slate-200 px-3 py-3 rounded-xl whitespace-nowrap">
                                    {window.location.origin}/
                                </span>
                                <input
                                    type="text"
                                    id="slug"
                                    name="slug"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    className={`flex-1 rounded-xl border-2 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition text-sm font-mono ${errors.slug ? 'border-red-400' : 'border-slate-200'}`}
                                    placeholder="liwo"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5">
                                Csak kisbetű, szám és kötőjel. Pl: <code className="bg-slate-100 px-1 rounded">liwo</code>, <code className="bg-slate-100 px-1 rounded">erste-bank</code>
                            </p>
                            {errors.slug && <p className="text-red-500 text-xs mt-1.5">{errors.slug}</p>}
                        </div>

                        <div className="bg-indigo-50 rounded-xl p-4 mb-6 text-sm text-indigo-800 flex gap-3">
                            <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span>Létrehozáskor a rendszer automatikusan létrehoz egy új, izolált adatbázist és lefuttatja a migrációkat. Az admin jelszót az első bejelentkezéskor kell beállítani.</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm disabled:opacity-60"
                            >
                                {processing ? 'Létrehozás...' : 'Cég létrehozása'}
                            </button>
                            <Link
                                href={route('super-admin.dashboard')}
                                className="flex-1 py-3 text-center border-2 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition text-sm"
                            >
                                Mégse
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
