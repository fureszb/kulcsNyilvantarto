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

interface LostFoundReportFormData {
    location_id: number | '';
    subject: string;
    recorded_at: string;
    location_text: string;
    representative_user_id: number | '';
    witness_user_id: number | '';
    guard_user_id: number | '';
    content_description: string;
    handed_over_at: string;
    recipient_name: string;
    recipient_id_card_number: string;
    recipient_address: string;
    signature_atvevo: string | null;
    [key: string]: unknown;
}

export default function LostFoundReportCreate({ locations, workers }: Props) {
    const { data, setData, post, processing, errors } = useForm<LostFoundReportFormData>({
        location_id: '',
        subject: '',
        recorded_at: '',
        location_text: '',
        representative_user_id: '',
        witness_user_id: '',
        guard_user_id: '',
        content_description: '',
        handed_over_at: '',
        recipient_name: '',
        recipient_id_card_number: '',
        recipient_address: '',
        signature_atvevo: null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('documents.lost-found-report.store'));
    }

    const Layout = useOwnLayout();
    const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none';

    return (
        <Layout title="Talált tárgy jegyzőkönyv">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-slate-800 mb-6">Talált tárgy jegyzőkönyv</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tárgy</label>
                        <input type="text" value={data.subject} onChange={e => setData('subject', e.target.value)} required className={inputCls}/>
                        {errors.subject && <p className="mt-1 text-xs text-rose-600">{errors.subject}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rögzítés időpontja</label>
                            <input type="datetime-local" value={data.recorded_at} onChange={e => setData('recorded_at', e.target.value)} required className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Irodaház (opcionális)</label>
                            <select value={data.location_id} onChange={e => setData('location_id', e.target.value ? Number(e.target.value) : '')} className={inputCls}>
                                <option value="">Nincs kiválasztva</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Helye</label>
                        <input type="text" value={data.location_text} onChange={e => setData('location_text', e.target.value)} required className={inputCls}/>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <WorkerSelect label="Képviselő" workers={workers} value={data.representative_user_id} onChange={v => setData('representative_user_id', v)} />
                        <WorkerSelect label="Tanú" workers={workers} value={data.witness_user_id} onChange={v => setData('witness_user_id', v)} />
                        <WorkerSelect label="Biztonsági őr" workers={workers} value={data.guard_user_id} onChange={v => setData('guard_user_id', v)} />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">A talált tárgy mit tartalmaz</label>
                        <textarea value={data.content_description} onChange={e => setData('content_description', e.target.value)} required rows={4} className={inputCls}/>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                        <p className="text-xs font-bold text-slate-500 uppercase">Átvétel</p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Átvétel időpontja</label>
                            <input type="datetime-local" value={data.handed_over_at} onChange={e => setData('handed_over_at', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Név</label>
                            <input type="text" value={data.recipient_name} onChange={e => setData('recipient_name', e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fényképes igazolvány száma</label>
                            <input type="text" value={data.recipient_id_card_number} onChange={e => setData('recipient_id_card_number', e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lakcím</label>
                            <input type="text" value={data.recipient_address} onChange={e => setData('recipient_address', e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                    </div>

                    <SignaturePad label="Átvevő aláírása" value={data.signature_atvevo} onChange={v => setData('signature_atvevo', v)} />

                    <button type="submit" disabled={processing}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer">
                        {processing ? 'Mentés…' : 'Dokumentum létrehozása és PDF generálása'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
