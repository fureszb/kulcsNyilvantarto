import { useForm } from '@inertiajs/react';
import { useOwnLayout } from '../../../hooks/useOwnLayout';

declare function route(name: string, params?: unknown): string;

interface LocationOption {
    id: number;
    name: string;
}

interface Props {
    locations: LocationOption[];
}

interface VehicleEntryFormData {
    location_id: number | '';
    license_plate: string;
    company_or_name: string;
    entry_date: string;
    entry_time: string;
    exit_time: string;
    notes: string;
    [key: string]: unknown;
}

export default function VehicleEntryCreate({ locations }: Props) {
    const { data, setData, post, processing, errors } = useForm<VehicleEntryFormData>({
        location_id: '',
        license_plate: '',
        company_or_name: '',
        entry_date: '',
        entry_time: '',
        exit_time: '',
        notes: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('documents.vehicle-entry.store'));
    }

    const Layout = useOwnLayout();

    return (
        <Layout title="Gépjármű beléptető nyilvántartás">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-slate-800 mb-6">Gépjármű beléptető nyilvántartás</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Irodaház (opcionális)</label>
                        <select
                            value={data.location_id}
                            onChange={e => setData('location_id', e.target.value ? Number(e.target.value) : '')}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none"
                        >
                            <option value="">Nincs kiválasztva</option>
                            {locations.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rendszám</label>
                        <input type="text" value={data.license_plate} onChange={e => setData('license_plate', e.target.value)} required
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none"/>
                        {errors.license_plate && <p className="mt-1 text-xs text-rose-600">{errors.license_plate}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cégnév/név</label>
                        <input type="text" value={data.company_or_name} onChange={e => setData('company_or_name', e.target.value)} required
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none"/>
                        {errors.company_or_name && <p className="mt-1 text-xs text-rose-600">{errors.company_or_name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dátum</label>
                            <input type="date" value={data.entry_date} onChange={e => setData('entry_date', e.target.value)} required
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Belépési idő</label>
                            <input type="time" value={data.entry_time} onChange={e => setData('entry_time', e.target.value)} required
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kilépési idő</label>
                            <input type="time" value={data.exit_time} onChange={e => setData('exit_time', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Megjegyzés</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none"/>
                    </div>

                    <button type="submit" disabled={processing}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer">
                        {processing ? 'Mentés…' : 'Dokumentum létrehozása és PDF generálása'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
