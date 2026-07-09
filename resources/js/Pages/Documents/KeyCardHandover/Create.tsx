import { useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import FormShell from '../../../Components/Documents/FormShell';
import { Field, TextInput, SectionCard, SubmitButton } from '../../../Components/Documents/FormField';
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

    return (
        <FormShell title="Kulcs/Kártya átadás-átvétele" subtitle="Fizikai-biztonsági jegyzőkönyv" icon={KeyRound}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Irodaház (opcionális)">
                    <SelectField
                        value={data.location_id === '' ? '' : String(data.location_id)}
                        placeholder="Nincs kiválasztva"
                        options={locations.map(l => ({ value: String(l.id), label: l.name }))}
                        onChange={v => setData('location_id', v ? Number(v) : '')}
                    />
                </Field>

                <Field label="Kulcs/Kártya száma/megnevezése" required error={errors.key_card_number_or_name}>
                    <TextInput type="text" value={data.key_card_number_or_name} onChange={e => setData('key_card_number_or_name', e.target.value)} required />
                </Field>

                <Field label="Cégnév/munkavégzés helye" required>
                    <TextInput type="text" value={data.company_or_workplace} onChange={e => setData('company_or_workplace', e.target.value)} required />
                </Field>

                <SectionCard title="Felvétel">
                    <Field label="Felvétel időpontja" required>
                        <TextInput surface="card" type="datetime-local" value={data.issued_at} onChange={e => setData('issued_at', e.target.value)} required />
                    </Field>
                    <Field label="Felvette (név olvashatóan)" required>
                        <TextInput surface="card" type="text" value={data.issued_to_name} onChange={e => setData('issued_to_name', e.target.value)} required />
                    </Field>
                    <Field label="Fényképes igazolvány száma" required>
                        <TextInput surface="card" type="text" value={data.issued_to_id_card_number} onChange={e => setData('issued_to_id_card_number', e.target.value)} required />
                    </Field>
                    <Field label="Biztonsági szolgálat">
                        <TextInput surface="card" type="text" value={data.security_service} onChange={e => setData('security_service', e.target.value)} />
                    </Field>
                </SectionCard>

                <SectionCard title="Leadás (opcionális)">
                    <Field label="Leadás ideje">
                        <TextInput surface="card" type="datetime-local" value={data.returned_at} onChange={e => setData('returned_at', e.target.value)} />
                    </Field>
                    <Field label="Leadta (név)">
                        <TextInput surface="card" type="text" value={data.returned_by_name} onChange={e => setData('returned_by_name', e.target.value)} />
                    </Field>
                </SectionCard>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SignaturePad label="Felvevő aláírása" value={data.signature_felvevo} onChange={v => setData('signature_felvevo', v)} />
                    <SignaturePad label="Leadó aláírása" value={data.signature_leado} onChange={v => setData('signature_leado', v)} />
                    <SignaturePad label="Visszavevő aláírása" value={data.signature_visszavevo} onChange={v => setData('signature_visszavevo', v)} />
                </div>

                <SubmitButton processing={processing} />
            </form>
        </FormShell>
    );
}
