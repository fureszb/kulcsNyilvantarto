import { useForm } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import FormShell from '../../../Components/Documents/FormShell';
import { Field, TextInput, Textarea, SubmitButton } from '../../../Components/Documents/FormField';
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

interface EvacuationRegistryFormData {
    location_id: number | '';
    tenant_name: string;
    remained_in_building: string;
    fire_safety_officer_name: string;
    signature_tuzvedelmi_felelos: string | null;
    [key: string]: unknown;
}

export default function EvacuationRegistryCreate({ locations }: Props) {
    const { data, setData, post, processing, errors } = useForm<EvacuationRegistryFormData>({
        location_id: '',
        tenant_name: '',
        remained_in_building: '',
        fire_safety_officer_name: '',
        signature_tuzvedelmi_felelos: null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('documents.evacuation-registry.store'));
    }

    return (
        <FormShell title="Kiürítési nyilvántartás" subtitle="Fizikai-biztonsági nyilvántartás" icon={ClipboardList}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Irodaház (opcionális)">
                    <SelectField
                        value={data.location_id === '' ? '' : String(data.location_id)}
                        placeholder="Nincs kiválasztva"
                        options={locations.map(l => ({ value: String(l.id), label: l.name }))}
                        onChange={v => setData('location_id', v ? Number(v) : '')}
                    />
                </Field>

                <Field label="Bérlő neve" required error={errors.tenant_name}>
                    <TextInput type="text" value={data.tenant_name} onChange={e => setData('tenant_name', e.target.value)} required />
                </Field>

                <Field label="Bérleményben maradtak">
                    <Textarea value={data.remained_in_building} onChange={e => setData('remained_in_building', e.target.value)} rows={3} />
                </Field>

                <Field label="Tűzvédelmi felelős" required error={errors.fire_safety_officer_name}>
                    <TextInput type="text" value={data.fire_safety_officer_name} onChange={e => setData('fire_safety_officer_name', e.target.value)} required />
                </Field>

                <SignaturePad label="Tűzvédelmi felelős aláírása" value={data.signature_tuzvedelmi_felelos} onChange={v => setData('signature_tuzvedelmi_felelos', v)} />

                <SubmitButton processing={processing} />
            </form>
        </FormShell>
    );
}
