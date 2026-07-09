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

interface EquipmentHandoverFormData {
    location_id: number | '';
    equipment_name: string;
    issued_at: string;
    issued_to_name: string;
    issuer_security_service: string;
    returned_at: string;
    returned_by_name: string;
    receiver_security_service: string;
    [key: string]: unknown;
}

export default function EquipmentHandoverCreate({ locations }: Props) {
    const { data, setData, post, processing, errors } = useForm<EquipmentHandoverFormData>({
        location_id: '',
        equipment_name: '',
        issued_at: '',
        issued_to_name: '',
        issuer_security_service: '',
        returned_at: '',
        returned_by_name: '',
        receiver_security_service: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('documents.equipment-handover.store'));
    }

    const Layout = useOwnLayout();

    return (
        <Layout title="Eszközök átadás-átvétele">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-slate-800 mb-6">Eszközök átadás-átvétele</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Irodaház (opcionális)</label>
                        <select value={data.location_id} onChange={e => setData('location_id', e.target.value ? Number(e.target.value) : '')}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none">
                            <option value="">Nincs kiválasztva</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Eszköz megnevezése</label>
                        <input type="text" value={data.equipment_name} onChange={e => setData('equipment_name', e.target.value)} required
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none"/>
                        {errors.equipment_name && <p className="mt-1 text-xs text-rose-600">{errors.equipment_name}</p>}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                        <p className="text-xs font-bold text-slate-500 uppercase">Kiadás</p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kiadás időpontja</label>
                            <input type="datetime-local" value={data.issued_at} onChange={e => setData('issued_at', e.target.value)} required
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Felvette (Név)</label>
                            <input type="text" value={data.issued_to_name} onChange={e => setData('issued_to_name', e.target.value)} required
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bizt. szolg.</label>
                            <input type="text" value={data.issuer_security_service} onChange={e => setData('issuer_security_service', e.target.value)} required
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                        <p className="text-xs font-bold text-slate-500 uppercase">Visszavétel (opcionális)</p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Visszavétel időpontja</label>
                            <input type="datetime-local" value={data.returned_at} onChange={e => setData('returned_at', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Leadta (név)</label>
                            <input type="text" value={data.returned_by_name} onChange={e => setData('returned_by_name', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bizt. szolg.</label>
                            <input type="text" value={data.receiver_security_service} onChange={e => setData('receiver_security_service', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
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
