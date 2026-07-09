import { useForm } from '@inertiajs/react';
import { Package } from 'lucide-react';
import FormShell from '../../../Components/Documents/FormShell';
import { Field, TextInput, SectionCard, SubmitButton } from '../../../Components/Documents/FormField';
import SelectField from '../../../Components/Documents/SelectField';

declare function route(name: string, params?: unknown): string;

interface LocationOption {
    id: number;
    name: string;
}

interface Props {
    locations: LocationOption[];
}

interface EquipmentHandoverFormData {
    location_id: number | '';
    equipment_name: string;
    issued_at: string;
    issued_to_name: string;
    issuer_security_service: string;
    returned_at: string;
    returned_by_name: string;
    receiver_security_service: string;
    [key: string]: unknown;
}

export default function EquipmentHandoverCreate({ locations }: Props) {
    const { data, setData, post, processing, errors } = useForm<EquipmentHandoverFormData>({
        location_id: '',
        equipment_name: '',
        issued_at: '',
        issued_to_name: '',
        issuer_security_service: '',
        returned_at: '',
        returned_by_name: '',
        receiver_security_service: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('documents.equipment-handover.store'));
    }

    return (
        <FormShell title="Eszközök átadás-átvétele" subtitle="Fizikai-biztonsági jegyzőkönyv" icon={Package}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Irodaház (opcionális)">
                    <SelectField
                        value={data.location_id === '' ? '' : String(data.location_id)}
                        placeholder="Nincs kiválasztva"
                        options={locations.map(l => ({ value: String(l.id), label: l.name }))}
                        onChange={v => setData('location_id', v ? Number(v) : '')}
                    />
                </Field>

                <Field label="Eszköz megnevezése" required error={errors.equipment_name}>
                    <TextInput type="text" value={data.equipment_name} onChange={e => setData('equipment_name', e.target.value)} required />
                </Field>

                <SectionCard title="Kiadás">
                    <Field label="Kiadás időpontja" required>
                        <TextInput surface="card" type="datetime-local" value={data.issued_at} onChange={e => setData('issued_at', e.target.value)} required />
                    </Field>
                    <Field label="Felvette (Név)" required>
                        <TextInput surface="card" type="text" value={data.issued_to_name} onChange={e => setData('issued_to_name', e.target.value)} required />
                    </Field>
                    <Field label="Bizt. szolg." required>
                        <TextInput surface="card" type="text" value={data.issuer_security_service} onChange={e => setData('issuer_security_service', e.target.value)} required />
                    </Field>
                </SectionCard>

                <SectionCard title="Visszavétel (opcionális)">
                    <Field label="Visszavétel időpontja">
                        <TextInput surface="card" type="datetime-local" value={data.returned_at} onChange={e => setData('returned_at', e.target.value)} />
                    </Field>
                    <Field label="Leadta (név)">
                        <TextInput surface="card" type="text" value={data.returned_by_name} onChange={e => setData('returned_by_name', e.target.value)} />
                    </Field>
                    <Field label="Bizt. szolg.">
                        <TextInput surface="card" type="text" value={data.receiver_security_service} onChange={e => setData('receiver_security_service', e.target.value)} />
                    </Field>
                </SectionCard>

                <SubmitButton processing={processing} />
            </form>
        </FormShell>
    );
}
