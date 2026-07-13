import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface NfcTag {
    id: number;
    uid: string;
    label?: string;
    is_active: boolean;
    location_id: number;
}

interface IdName { id: number; name: string; }

interface Props {
    tag?: NfcTag | null;
    locations: IdName[];
}

interface FormData {
    uid: string;
    location_id: number | '';
    label: string;
    is_active: boolean;
}

export default function NfcTagForm({ tag, locations }: Props) {
    const isEdit = !!tag;
    const title = isEdit ? 'NFC matrica szerkesztése' : 'Új NFC matrica';

    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        uid: tag?.uid ?? '',
        location_id: tag?.location_id ?? '',
        label: tag?.label ?? '',
        is_active: tag?.is_active ?? true,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.nfc-tags.update', tag.id));
        } else {
            post(route('admin.nfc-tags.store'));
        }
    }

    return (
        <AdminLayout title={title}>
            <div className="max-w-lg">
                <div className="flex items-center gap-2 mb-5">
                    <a href={route('admin.nfc-tags.index')} className="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        NFC matricák
                    </a>
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                    <span className="text-sm text-slate-700">{isEdit ? tag.uid : 'Új matrica'}</span>
                </div>

                <div className="card p-6">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="form-label" htmlFor="uid">Egyedi azonosító (UID) <span className="text-red-500">*</span></label>
                            <input
                                id="uid"
                                type="text"
                                value={data.uid}
                                onChange={(e) => setData('uid', e.target.value)}
                                className="form-input font-mono"
                                placeholder="04:3E:8A:AA:77:72:81"
                                required
                            />
                            {errors.uid && <p className="text-red-500 text-xs mt-1">{errors.uid}</p>}
                        </div>

                        <div>
                            <label className="form-label" htmlFor="location_id">Telephely <span className="text-red-500">*</span></label>
                            <select
                                id="location_id"
                                value={data.location_id}
                                onChange={(e) => setData('location_id', e.target.value ? Number(e.target.value) : '')}
                                className="form-input"
                                required
                            >
                                <option value="">— válasszon —</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                            {errors.location_id && <p className="text-red-500 text-xs mt-1">{errors.location_id}</p>}
                        </div>

                        <div>
                            <label className="form-label" htmlFor="label">Címke (opcionális, pl. hol van felragasztva)</label>
                            <input
                                id="label"
                                type="text"
                                value={data.label}
                                onChange={(e) => setData('label', e.target.value)}
                                className="form-input"
                                placeholder="pl. Bejárati ajtó"
                            />
                            {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label}</p>}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer">Aktív matrica</label>
                        </div>

                        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                            <button type="submit" disabled={processing} className="btn-primary">
                                {isEdit ? 'Mentés' : 'Létrehozás'}
                            </button>
                            <a href={route('admin.nfc-tags.index')} className="btn-secondary">Mégse</a>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
