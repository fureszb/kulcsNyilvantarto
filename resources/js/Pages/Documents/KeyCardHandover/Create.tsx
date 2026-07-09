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

interface KeyCardHandoverFormData {
    location_id: number | '';
    key_card_number_or_name: string;
    company_or_workplace: string;
    issued_at: string;
    issued_to_name: string;
    issued_to_id_card_number: string;
    security_service: string;
    returned_at: string;
    returned_by_name: string;
    signature_felvevo: string | null;
    signature_leado: string | null;
    signature_visszavevo: string | null;
    [key: string]: unknown;
}

export default function KeyCardHandoverCreate({ locations }: Props) {
    const { data, setData, post, processing, errors } = useForm<KeyCardHandoverFormData>({
        location_id: '',
        key_card_number_or_name: '',
        company_or_workplace: '',
        issued_at: '',
        issued_to_name: '',
        issued_to_id_card_number: '',
        security_service: '',
        returned_at: '',
        returned_by_name: '',
        signature_felvevo: null,
        signature_leado: null,
        signature_visszavevo: null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('documents.key-card-handover.store'));
    }

    const Layout = useOwnLayout();
    const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none';

    return (
        <Layout title="Kulcs/Kártya átadás-átvétele">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-slate-800 mb-6">Kulcs/Kártya átadás-átvétele</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Irodaház (opcionális)</label>
                        <select value={data.location_id} onChange={e => setData('location_id', e.target.value ? Number(e.target.value) : '')} className={inputCls}>
                            <option value="">Nincs kiválasztva</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kulcs/Kártya száma/megnevezése</label>
                        <input type="text" value={data.key_card_number_or_name} onChange={e => setData('key_card_number_or_name', e.target.value)} required className={inputCls}/>
                        {errors.key_card_number_or_name && <p className="mt-1 text-xs text-rose-600">{errors.key_card_number_or_name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cégnév/munkavégzés helye</label>
                        <input type="text" value={data.company_or_workplace} onChange={e => setData('company_or_workplace', e.target.value)} required className={inputCls}/>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                        <p className="text-xs font-bold text-slate-500 uppercase">Felvétel</p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Felvétel időpontja</label>
                            <input type="datetime-local" value={data.issued_at} onChange={e => setData('issued_at', e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Felvette (név olvashatóan)</label>
                            <input type="text" value={data.issued_to_name} onChange={e => setData('issued_to_name', e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fényképes igazolvány száma</label>
                            <input type="text" value={data.issued_to_id_card_number} onChange={e => setData('issued_to_id_card_number', e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Biztonsági szolgálat</label>
                            <input type="text" value={data.security_service} onChange={e => setData('security_service', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                        <p className="text-xs font-bold text-slate-500 uppercase">Leadás (opcionális)</p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Leadás ideje</label>
                            <input type="datetime-local" value={data.returned_at} onChange={e => setData('returned_at', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Leadta (név)</label>
                            <input type="text" value={data.returned_by_name} onChange={e => setData('returned_by_name', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SignaturePad label="Felvevő aláírása" value={data.signature_felvevo} onChange={v => setData('signature_felvevo', v)} />
                        <SignaturePad label="Leadó aláírása" value={data.signature_leado} onChange={v => setData('signature_leado', v)} />
                        <SignaturePad label="Visszavevő aláírása" value={data.signature_visszavevo} onChange={v => setData('signature_visszavevo', v)} />
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
