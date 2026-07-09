import { useForm } from '@inertiajs/react';
import { Flame } from 'lucide-react';
import FormShell from '../../../Components/Documents/FormShell';
import { Field, TextInput, Textarea, SectionCard, Checkbox, SubmitButton } from '../../../Components/Documents/FormField';
import SelectField from '../../../Components/Documents/SelectField';
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

    return (
        <FormShell title="Tűzkulcs és tűzkazetta kiadás" subtitle="Fizikai-biztonsági jegyzőkönyv" icon={Flame}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Irodaház (opcionális)">
                    <SelectField
                        value={data.location_id === '' ? '' : String(data.location_id)}
                        placeholder="Nincs kiválasztva"
                        options={locations.map(l => ({ value: String(l.id), label: l.name }))}
                        onChange={v => setData('location_id', v ? Number(v) : '')}
                    />
                </Field>

                <Field label="Plomba szám/matrica szám" required error={errors.seal_number}>
                    <TextInput type="text" value={data.seal_number} onChange={e => setData('seal_number', e.target.value)} required />
                </Field>

                <div className="flex gap-6">
                    <Checkbox label="Levett" checked={data.seal_removed} onChange={v => setData('seal_removed', v)} />
                    <Checkbox label="Felhelyezett" checked={data.seal_applied} onChange={v => setData('seal_applied', v)} />
                </div>

                <Field label="Kiadás időpontja" required>
                    <TextInput type="datetime-local" value={data.issued_at} onChange={e => setData('issued_at', e.target.value)} required />
                </Field>

                <Field label="Felvétel oka" required>
                    <Textarea value={data.issue_reason} onChange={e => setData('issue_reason', e.target.value)} required rows={3} />
                </Field>

                <SignaturePad label="Felvette (aláírás)" value={data.signature_felvette} onChange={v => setData('signature_felvette', v)} />

                <SectionCard title="Zárás (opcionális, ha a kulcs már visszakerült)">
                    <Field label="Zárás időpontja">
                        <TextInput surface="card" type="datetime-local" value={data.closed_at} onChange={e => setData('closed_at', e.target.value)} />
                    </Field>
                    {data.closed_at && (
                        <SignaturePad label="Leadta (aláírás)" value={data.signature_leadta} onChange={v => setData('signature_leadta', v)} />
                    )}
                </SectionCard>

                <SubmitButton processing={processing} />
            </form>
        </FormShell>
    );
}
