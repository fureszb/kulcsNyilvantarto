import { useForm } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import FormShell from '../../../Components/Documents/FormShell';
import { Field, TextInput, Textarea, SectionCard, Checkbox, SubmitButton } from '../../../Components/Documents/FormField';
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

    return (
        <FormShell title="Kárfelvételi jegyzőkönyv" subtitle="Fizikai-biztonsági jegyzőkönyv" icon={AlertTriangle}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Rögzítés időpontja (tól)" required>
                        <TextInput type="datetime-local" value={data.recorded_from} onChange={e => setData('recorded_from', e.target.value)} required />
                    </Field>
                    <Field label="Rögzítés időpontja (ig)" required error={errors.recorded_to}>
                        <TextInput type="datetime-local" value={data.recorded_to} onChange={e => setData('recorded_to', e.target.value)} required />
                    </Field>
                </div>

                <Field label="Irodaház (opcionális)">
                    <SelectField
                        value={data.location_id === '' ? '' : String(data.location_id)}
                        placeholder="Nincs kiválasztva"
                        options={locations.map(l => ({ value: String(l.id), label: l.name }))}
                        onChange={v => setData('location_id', v ? Number(v) : '')}
                    />
                </Field>

                <Field label="Helye" required>
                    <TextInput type="text" value={data.location_text} onChange={e => setData('location_text', e.target.value)} required />
                </Field>

                <Field label="Tárgy" required>
                    <TextInput type="text" value={data.subject} onChange={e => setData('subject', e.target.value)} required />
                </Field>

                <SectionCard title="Károkozó adatai">
                    <Field label="Neve" required>
                        <TextInput surface="card" type="text" value={data.perpetrator_name} onChange={e => setData('perpetrator_name', e.target.value)} required />
                    </Field>
                    <Field label="Szig. szám" required>
                        <TextInput surface="card" type="text" value={data.perpetrator_id_card_number} onChange={e => setData('perpetrator_id_card_number', e.target.value)} required />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Szül. hely" required>
                            <TextInput surface="card" type="text" value={data.perpetrator_birth_place} onChange={e => setData('perpetrator_birth_place', e.target.value)} required />
                        </Field>
                        <Field label="Szül. idő" required>
                            <TextInput surface="card" type="date" value={data.perpetrator_birth_date} onChange={e => setData('perpetrator_birth_date', e.target.value)} required />
                        </Field>
                    </div>
                    <Field label="Anyja neve" required>
                        <TextInput surface="card" type="text" value={data.perpetrator_mother_name} onChange={e => setData('perpetrator_mother_name', e.target.value)} required />
                    </Field>
                    <Field label="Lakcím" required>
                        <TextInput surface="card" type="text" value={data.perpetrator_address} onChange={e => setData('perpetrator_address', e.target.value)} required />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Telefon">
                            <TextInput surface="card" type="text" value={data.perpetrator_phone} onChange={e => setData('perpetrator_phone', e.target.value)} />
                        </Field>
                        <Field label="Email">
                            <TextInput surface="card" type="email" value={data.perpetrator_email} onChange={e => setData('perpetrator_email', e.target.value)} />
                        </Field>
                    </div>
                </SectionCard>

                <WorkerSelect label="Vagyonőr" workers={workers} value={data.guard_user_id} onChange={v => setData('guard_user_id', v)} />
                <WorkerSelect label="Tanú" workers={workers} value={data.witness_user_id} onChange={v => setData('witness_user_id', v)} />

                <Field label="Esemény" required>
                    <Textarea value={data.event_description} onChange={e => setData('event_description', e.target.value)} required rows={5} />
                </Field>

                <Checkbox label="A károkozó elismerte a károkozást" checked={data.perpetrator_admitted} onChange={v => setData('perpetrator_admitted', v)} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SignaturePad label="Károkozó aláírása" value={data.signature_karokozo} onChange={v => setData('signature_karokozo', v)} />
                    <SignaturePad label="Bizt. szolg. aláírása" value={data.signature_biztonsagi_szolgalat} onChange={v => setData('signature_biztonsagi_szolgalat', v)} />
                    <SignaturePad label="Képviselő aláírása" value={data.signature_kepviselo} onChange={v => setData('signature_kepviselo', v)} />
                </div>

                <SubmitButton processing={processing} />
            </form>
        </FormShell>
    );
}
