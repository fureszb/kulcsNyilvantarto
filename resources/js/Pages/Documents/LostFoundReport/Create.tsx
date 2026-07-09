import { useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import FormShell from '../../../Components/Documents/FormShell';
import { Field, TextInput, Textarea, SectionCard, SubmitButton } from '../../../Components/Documents/FormField';
import SelectField from '../../../Components/Documents/SelectField';
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

    return (
        <FormShell title="Talált tárgy jegyzőkönyv" subtitle="Fizikai-biztonsági jegyzőkönyv" icon={Search}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Tárgy" required error={errors.subject}>
                    <TextInput type="text" value={data.subject} onChange={e => setData('subject', e.target.value)} required />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Rögzítés időpontja" required>
                        <TextInput type="datetime-local" value={data.recorded_at} onChange={e => setData('recorded_at', e.target.value)} required />
                    </Field>
                    <Field label="Irodaház (opcionális)">
                        <SelectField
                            value={data.location_id === '' ? '' : String(data.location_id)}
                            placeholder="Nincs kiválasztva"
                            options={locations.map(l => ({ value: String(l.id), label: l.name }))}
                            onChange={v => setData('location_id', v ? Number(v) : '')}
                        />
                    </Field>
                </div>

                <Field label="Helye" required>
                    <TextInput type="text" value={data.location_text} onChange={e => setData('location_text', e.target.value)} required />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <WorkerSelect label="Képviselő" workers={workers} value={data.representative_user_id} onChange={v => setData('representative_user_id', v)} />
                    <WorkerSelect label="Tanú" workers={workers} value={data.witness_user_id} onChange={v => setData('witness_user_id', v)} />
                    <WorkerSelect label="Biztonsági őr" workers={workers} value={data.guard_user_id} onChange={v => setData('guard_user_id', v)} />
                </div>

                <Field label="A talált tárgy mit tartalmaz" required>
                    <Textarea value={data.content_description} onChange={e => setData('content_description', e.target.value)} required rows={4} />
                </Field>

                <SectionCard title="Átvétel">
                    <Field label="Átvétel időpontja">
                        <TextInput surface="card" type="datetime-local" value={data.handed_over_at} onChange={e => setData('handed_over_at', e.target.value)} />
                    </Field>
                    <Field label="Név" required>
                        <TextInput surface="card" type="text" value={data.recipient_name} onChange={e => setData('recipient_name', e.target.value)} required />
                    </Field>
                    <Field label="Fényképes igazolvány száma" required>
                        <TextInput surface="card" type="text" value={data.recipient_id_card_number} onChange={e => setData('recipient_id_card_number', e.target.value)} required />
                    </Field>
                    <Field label="Lakcím" required>
                        <TextInput surface="card" type="text" value={data.recipient_address} onChange={e => setData('recipient_address', e.target.value)} required />
                    </Field>
                </SectionCard>

                <SignaturePad label="Átvevő aláírása" value={data.signature_atvevo} onChange={v => setData('signature_atvevo', v)} />

                <SubmitButton processing={processing} />
            </form>
        </FormShell>
    );
}
