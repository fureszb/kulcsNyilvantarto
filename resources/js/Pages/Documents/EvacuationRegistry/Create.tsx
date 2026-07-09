import { useForm } from '@inertiajs/react';
import { useOwnLayout } from '../../../hooks/useOwnLayout';
import SignaturePad from '../../../Components/Documents/SignaturePad';

declare function route(name: string, params?: unknown): string;

interface LocationOption {
    id: number;
    name: string;
}

interface Props {
    locations: LocationOption[];
}

interface EvacuationRegistryFormData {
    location_id: number | '';
    tenant_name: string;
    remained_in_building: string;
    fire_safety_officer_name: string;
    signature_tuzvedelmi_felelos: string | null;
    [key: string]: unknown;
}

export default function EvacuationRegistryCreate({ locations }: Props) {
    const { data, setData, post, processing, errors } = useForm<EvacuationRegistryFormData>({
        location_id: '',
        tenant_name: '',
        remained_in_building: '',
        fire_safety_officer_name: '',
        signature_tuzvedelmi_felelos: null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('documents.evacuation-registry.store'));
    }

    const Layout = useOwnLayout();
    const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none';

    return (
        <Layout title="Kiürítési nyilvántartás">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-slate-800 mb-6">Kiürítési nyilvántartás</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Irodaház (opcionális)</label>
                        <select value={data.location_id} onChange={e => setData('location_id', e.target.value ? Number(e.target.value) : '')} className={inputCls}>
                            <option value="">Nincs kiválasztva</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bérlő neve</label>
                        <input type="text" value={data.tenant_name} onChange={e => setData('tenant_name', e.target.value)} required className={inputCls}/>
                        {errors.tenant_name && <p className="mt-1 text-xs text-rose-600">{errors.tenant_name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bérleményben maradtak</label>
                        <textarea value={data.remained_in_building} onChange={e => setData('remained_in_building', e.target.value)} rows={3} className={inputCls}/>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tűzvédelmi felelős</label>
                        <input type="text" value={data.fire_safety_officer_name} onChange={e => setData('fire_safety_officer_name', e.target.value)} required className={inputCls}/>
                        {errors.fire_safety_officer_name && <p className="mt-1 text-xs text-rose-600">{errors.fire_safety_officer_name}</p>}
                    </div>

                    <SignaturePad label="Tűzvédelmi felelős aláírása" value={data.signature_tuzvedelmi_felelos} onChange={v => setData('signature_tuzvedelmi_felelos', v)} />

                    <button type="submit" disabled={processing}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer">
                        {processing ? 'Mentés…' : 'Dokumentum létrehozása és PDF generálása'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
