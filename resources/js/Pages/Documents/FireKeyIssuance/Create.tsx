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

interface FireKeyIssuanceFormData {
    location_id: number | '';
    seal_number: string;
    seal_removed: boolean;
    seal_applied: boolean;
    issued_at: string;
    issue_reason: string;
    closed_at: string;
    signature_felvette: string | null;
    signature_leadta: string | null;
    [key: string]: unknown;
}

export default function FireKeyIssuanceCreate({ locations }: Props) {
    const { data, setData, post, processing, errors } = useForm<FireKeyIssuanceFormData>({
        location_id: '',
        seal_number: '',
        seal_removed: false,
        seal_applied: false,
        issued_at: '',
        issue_reason: '',
        closed_at: '',
        signature_felvette: null,
        signature_leadta: null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('documents.fire-key-issuance.store'));
    }

    const Layout = useOwnLayout();
    const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none';

    return (
        <Layout title="Tűzkulcs és tűzkazetta kiadás">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-slate-800 mb-6">Tűzkulcs és tűzkazetta kiadás</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Irodaház (opcionális)</label>
                        <select value={data.location_id} onChange={e => setData('location_id', e.target.value ? Number(e.target.value) : '')} className={inputCls}>
                            <option value="">Nincs kiválasztva</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Plomba szám/matrica szám</label>
                        <input type="text" value={data.seal_number} onChange={e => setData('seal_number', e.target.value)} required className={inputCls}/>
                        {errors.seal_number && <p className="mt-1 text-xs text-rose-600">{errors.seal_number}</p>}
                    </div>

                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={data.seal_removed} onChange={e => setData('seal_removed', e.target.checked)} className="w-4 h-4 rounded border-slate-300"/>
                            Levett
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={data.seal_applied} onChange={e => setData('seal_applied', e.target.checked)} className="w-4 h-4 rounded border-slate-300"/>
                            Felhelyezett
                        </label>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kiadás időpontja</label>
                        <input type="datetime-local" value={data.issued_at} onChange={e => setData('issued_at', e.target.value)} required className={inputCls}/>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Felvétel oka</label>
                        <textarea value={data.issue_reason} onChange={e => setData('issue_reason', e.target.value)} required rows={3} className={inputCls}/>
                    </div>

                    <SignaturePad label="Felvette (aláírás)" value={data.signature_felvette} onChange={v => setData('signature_felvette', v)} />

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                        <p className="text-xs font-bold text-slate-500 uppercase">Zárás (opcionális, ha a kulcs már visszakerült)</p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Zárás időpontja</label>
                            <input type="datetime-local" value={data.closed_at} onChange={e => setData('closed_at', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        {data.closed_at && (
                            <SignaturePad label="Leadta (aláírás)" value={data.signature_leadta} onChange={v => setData('signature_leadta', v)} />
                        )}
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
