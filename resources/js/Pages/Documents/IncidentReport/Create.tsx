import { useForm } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import FormShell from '../../../Components/Documents/FormShell';
import { Field, TextInput, Textarea, SubmitButton } from '../../../Components/Documents/FormField';
import SelectField from '../../../Components/Documents/SelectField';
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

    return (
        <FormShell title="Feljegyzéses jegyzőkönyv" subtitle="Fizikai-biztonsági jegyzőkönyv" icon={FileText}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Rögzítés időpontja" required error={errors.recorded_at}>
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

                <Field label="Helye" required error={errors.location_text}>
                    <TextInput type="text" value={data.location_text} onChange={e => setData('location_text', e.target.value)} required />
                </Field>

                <WorkerMultiSelect
                    label="Jelen vannak (vagyonőrök)"
                    workers={workers}
                    value={data.guard_ids}
                    onChange={ids => setData('guard_ids', ids)}
                />
                {errors.guard_ids && <p className="text-xs text-rose-600">{errors.guard_ids}</p>}

                <Field label="Esemény leírása" required error={errors.event_description}>
                    <Textarea value={data.event_description} onChange={e => setData('event_description', e.target.value)} required rows={5} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SignaturePad label="Jegyzőkönyv vezető aláírása" value={data.signature_jegyzokonyv_vezeto} onChange={v => setData('signature_jegyzokonyv_vezeto', v)} />
                    <SignaturePad label="Tanú aláírása" value={data.signature_tanu} onChange={v => setData('signature_tanu', v)} />
                    <SignaturePad label="Képviselő aláírása" value={data.signature_kepviselo} onChange={v => setData('signature_kepviselo', v)} />
                </div>

                <SubmitButton processing={processing} />
            </form>
        </FormShell>
    );
}
