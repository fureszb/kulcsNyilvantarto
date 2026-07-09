import { useForm } from '@inertiajs/react';
import { useOwnLayout } from '../../../hooks/useOwnLayout';
import SignaturePad from '../../../Components/Documents/SignaturePad';
import WorkerMultiSelect from '../../../Components/Documents/WorkerMultiSelect';
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

interface IncidentReportFormData {
    location_id: number | '';
    location_text: string;
    recorded_at: string;
    event_description: string;
    guard_ids: number[];
    signature_jegyzokonyv_vezeto: string | null;
    signature_tanu: string | null;
    signature_kepviselo: string | null;
    [key: string]: unknown;
}

export default function IncidentReportCreate({ locations, workers }: Props) {
    const { data, setData, post, processing, errors } = useForm<IncidentReportFormData>({
        location_id: '',
        location_text: '',
        recorded_at: '',
        event_description: '',
        guard_ids: [],
        signature_jegyzokonyv_vezeto: null,
        signature_tanu: null,
        signature_kepviselo: null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('documents.incident-report.store'));
    }

    const Layout = useOwnLayout();

    return (
        <Layout title="Feljegyzéses jegyzőkönyv">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-slate-800 mb-6">Feljegyzéses jegyzőkönyv</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rögzítés időpontja</label>
                        <input
                            type="datetime-local"
                            value={data.recorded_at}
                            onChange={e => setData('recorded_at', e.target.value)}
                            required
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none"
                        />
                        {errors.recorded_at && <p className="mt-1 text-xs text-rose-600">{errors.recorded_at}</p>}
                    </div>

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
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Helye</label>
                        <input
                            type="text"
                            value={data.location_text}
                            onChange={e => setData('location_text', e.target.value)}
                            required
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none"
                        />
                        {errors.location_text && <p className="mt-1 text-xs text-rose-600">{errors.location_text}</p>}
                    </div>

                    <WorkerMultiSelect
                        label="Jelen vannak (vagyonőrök)"
                        workers={workers}
                        value={data.guard_ids}
                        onChange={ids => setData('guard_ids', ids)}
                    />
                    {errors.guard_ids && <p className="text-xs text-rose-600">{errors.guard_ids}</p>}

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Esemény leírása</label>
                        <textarea
                            value={data.event_description}
                            onChange={e => setData('event_description', e.target.value)}
                            required
                            rows={5}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none"
                        />
                        {errors.event_description && <p className="mt-1 text-xs text-rose-600">{errors.event_description}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SignaturePad
                            label="Jegyzőkönyv vezető aláírása"
                            value={data.signature_jegyzokonyv_vezeto}
                            onChange={v => setData('signature_jegyzokonyv_vezeto', v)}
                        />
                        <SignaturePad
                            label="Tanú aláírása"
                            value={data.signature_tanu}
                            onChange={v => setData('signature_tanu', v)}
                        />
                        <SignaturePad
                            label="Képviselő aláírása"
                            value={data.signature_kepviselo}
                            onChange={v => setData('signature_kepviselo', v)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
                    >
                        {processing ? 'Mentés…' : 'Dokumentum létrehozása és PDF generálása'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
