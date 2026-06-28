import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface Item {
    id: number;
    name: string;
    description?: string;
    group_id?: number;
    location_id: number;
}

interface ItemGroup {
    id: number;
    name: string;
    location_id: number;
    items?: Item[];
}

interface Location {
    id: number;
    name: string;
    description?: string;
    responsible_person?: string;
    email?: string;
    icon?: string;
    logo_path?: string;
    is_active: boolean;
    items_count?: number;
    items?: Item[];
    groups?: ItemGroup[];
}

interface Props {
    location: Location;
}

interface FormData {
    name: string;
    description: string;
    responsible_person: string;
    email: string;
    icon: string;
    is_active: boolean;
    [key: string]: unknown;
}

export default function LocationEdit({ location }: Props) {
    const hasLogo = !!location.logo_path;
    const [iconTab, setIconTab] = useState<'emoji' | 'logo'>(hasLogo ? 'logo' : 'emoji');
    const [removeLogo, setRemoveLogo] = useState(false);

    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: location.name,
        description: location.description ?? '',
        responsible_person: location.responsible_person ?? '',
        email: location.email ?? '',
        icon: location.icon ?? '',
        is_active: location.is_active,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('admin.locations.update', location.id));
    }

    function switchTab(tab: 'emoji' | 'logo') {
        setIconTab(tab);
        if (tab !== 'emoji') {
            setData('icon', '');
        }
    }

    const tabActive = 'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors bg-blue-50 border-blue-300 text-blue-700';
    const tabInactive = 'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors border-slate-200 text-slate-500 hover:bg-slate-50';

    return (
        <AdminLayout title="Helyszín szerkesztése">
            <div className="max-w-xl">
                <a href={route('admin.locations.index')} className="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1 mb-5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Vissza
                </a>

                <div className="card p-6">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="form-label" htmlFor="name">Helyszín neve <span className="text-red-500">*</span></label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="form-label" htmlFor="description">Leírás <span className="text-xs text-slate-400">(opcionális – megjelenik a kártya modalban)</span></label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="form-input resize-none"
                                rows={4}
                                placeholder="Helyszín leírása, fontos tudnivalók, elérési útmutató..."
                                maxLength={2000}
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>

                        <div>
                            <label className="form-label">Ikon <span className="text-xs text-slate-400">(opcionális)</span></label>
                            <div className="flex gap-2 mb-3">
                                <button type="button" onClick={() => switchTab('emoji')} className={iconTab === 'emoji' ? tabActive : tabInactive}>
                                    Emoji
                                </button>
                                <button type="button" onClick={() => switchTab('logo')} className={iconTab === 'logo' ? tabActive : tabInactive}>
                                    Logó feltöltése
                                </button>
                            </div>

                            {iconTab === 'emoji' && (
                                <div>
                                    <input
                                        id="icon"
                                        type="text"
                                        value={data.icon}
                                        onChange={(e) => setData('icon', e.target.value)}
                                        className="form-input text-xl w-32"
                                        placeholder="🏢"
                                        maxLength={10}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Illesszen be egy emojit (Win+. vagy ⌘+Ctrl+Space)</p>
                                </div>
                            )}

                            {iconTab === 'logo' && (
                                <div>
                                    {location.logo_path && (
                                        <div className="flex items-center gap-3 mb-2">
                                            <img
                                                src={`/storage/${location.logo_path}`}
                                                className="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-white p-1"
                                                alt="Logo"
                                            />
                                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={removeLogo}
                                                    onChange={(e) => setRemoveLogo(e.target.checked)}
                                                    className="w-4 h-4 rounded border-slate-300"
                                                />
                                                Logó törlése
                                            </label>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        name="logo"
                                        accept="image/*"
                                        className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo as string}</p>}
                                    <p className="text-xs text-slate-400 mt-1">Max. 1 MB, PNG/JPG/SVG/WebP</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="form-label" htmlFor="responsible_person">Felelős személy</label>
                            <input
                                id="responsible_person"
                                type="text"
                                value={data.responsible_person}
                                onChange={(e) => setData('responsible_person', e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="form-label" htmlFor="email">Email cím</label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`form-input ${errors.email ? 'border-red-400' : ''}`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Aktív</label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={processing} className="btn-primary">
                                {processing ? 'Mentés...' : 'Mentés'}
                            </button>
                            <a href={route('admin.locations.index')} className="btn-secondary">Mégse</a>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
