import { useForm } from '@inertiajs/react';
import { useOwnLayout } from '../../../hooks/useOwnLayout';
import SignaturePad from '../../../Components/Documents/SignaturePad';
import WorkerSelect from '../../../Components/Documents/WorkerSelect';
import type { TenantUserBasic } from '../../../types';

declare function route(name: string, params?: unknown): string;

interface LocationOption {
    id: number;
    name: string;
}

interface Props {
    locations: LocationOption[];
    workers: TenantUserBasic[];
}

interface DamageReportFormData {
    location_id: number | '';
    recorded_from: string;
    recorded_to: string;
    location_text: string;
    subject: string;
    perpetrator_name: string;
    perpetrator_id_card_number: string;
    perpetrator_birth_place: string;
    perpetrator_birth_date: string;
    perpetrator_mother_name: string;
    perpetrator_address: string;
    perpetrator_phone: string;
    perpetrator_email: string;
    guard_user_id: number | '';
    witness_user_id: number | '';
    event_description: string;
    perpetrator_admitted: boolean;
    signature_karokozo: string | null;
    signature_biztonsagi_szolgalat: string | null;
    signature_kepviselo: string | null;
    [key: string]: unknown;
}

export default function DamageReportCreate({ locations, workers }: Props) {
    const { data, setData, post, processing, errors } = useForm<DamageReportFormData>({
        location_id: '',
        recorded_from: '',
        recorded_to: '',
        location_text: '',
        subject: '',
        perpetrator_name: '',
        perpetrator_id_card_number: '',
        perpetrator_birth_place: '',
        perpetrator_birth_date: '',
        perpetrator_mother_name: '',
        perpetrator_address: '',
        perpetrator_phone: '',
        perpetrator_email: '',
        guard_user_id: '',
        witness_user_id: '',
        event_description: '',
        perpetrator_admitted: false,
        signature_karokozo: null,
        signature_biztonsagi_szolgalat: null,
        signature_kepviselo: null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('documents.damage-report.store'));
    }

    const Layout = useOwnLayout();
    const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none';

    return (
        <Layout title="Kárfelvételi jegyzőkönyv">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-slate-800 mb-6">Kárfelvételi jegyzőkönyv</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rögzítés időpontja (tól)</label>
                            <input type="datetime-local" value={data.recorded_from} onChange={e => setData('recorded_from', e.target.value)} required className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rögzítés időpontja (ig)</label>
                            <input type="datetime-local" value={data.recorded_to} onChange={e => setData('recorded_to', e.target.value)} required className={inputCls}/>
                        </div>
                    </div>
                    {errors.recorded_to && <p className="text-xs text-rose-600">{errors.recorded_to}</p>}

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Irodaház (opcionális)</label>
                        <select value={data.location_id} onChange={e => setData('location_id', e.target.value ? Number(e.target.value) : '')} className={inputCls}>
                            <option value="">Nincs kiválasztva</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Helye</label>
                        <input type="text" value={data.location_text} onChange={e => setData('location_text', e.target.value)} required className={inputCls}/>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tárgy</label>
                        <input type="text" value={data.subject} onChange={e => setData('subject', e.target.value)} required className={inputCls}/>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                        <p className="text-xs font-bold text-slate-500 uppercase">Károkozó adatai</p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Neve</label>
                            <input type="text" value={data.perpetrator_name} onChange={e => setData('perpetrator_name', e.target.value)} required className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Szig. szám</label>
                            <input type="text" value={data.perpetrator_id_card_number} onChange={e => setData('perpetrator_id_card_number', e.target.value)} required className={inputCls}/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Szül. hely</label>
                                <input type="text" value={data.perpetrator_birth_place} onChange={e => setData('perpetrator_birth_place', e.target.value)} required className={inputCls}/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Szül. idő</label>
                                <input type="date" value={data.perpetrator_birth_date} onChange={e => setData('perpetrator_birth_date', e.target.value)} required className={inputCls}/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Anyja neve</label>
                            <input type="text" value={data.perpetrator_mother_name} onChange={e => setData('perpetrator_mother_name', e.target.value)} required className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lakcím</label>
                            <input type="text" value={data.perpetrator_address} onChange={e => setData('perpetrator_address', e.target.value)} required className={inputCls}/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Telefon</label>
                                <input type="text" value={data.perpetrator_phone} onChange={e => setData('perpetrator_phone', e.target.value)} className={inputCls}/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                                <input type="email" value={data.perpetrator_email} onChange={e => setData('perpetrator_email', e.target.value)} className={inputCls}/>
                            </div>
                        </div>
                    </div>

                    <WorkerSelect label="Vagyonőr" workers={workers} value={data.guard_user_id} onChange={v => setData('guard_user_id', v)} />
                    <WorkerSelect label="Tanú" workers={workers} value={data.witness_user_id} onChange={v => setData('witness_user_id', v)} />

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Esemény</label>
                        <textarea value={data.event_description} onChange={e => setData('event_description', e.target.value)} required rows={5} className={inputCls}/>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={data.perpetrator_admitted} onChange={e => setData('perpetrator_admitted', e.target.checked)} className="w-4 h-4 rounded border-slate-300"/>
                        A károkozó elismerte a károkozást
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SignaturePad label="Károkozó aláírása" value={data.signature_karokozo} onChange={v => setData('signature_karokozo', v)} />
                        <SignaturePad label="Bizt. szolg. aláírása" value={data.signature_biztonsagi_szolgalat} onChange={v => setData('signature_biztonsagi_szolgalat', v)} />
                        <SignaturePad label="Képviselő aláírása" value={data.signature_kepviselo} onChange={v => setData('signature_kepviselo', v)} />
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
