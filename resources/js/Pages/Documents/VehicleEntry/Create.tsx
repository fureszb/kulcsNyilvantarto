import { useForm } from '@inertiajs/react';
import { Car } from 'lucide-react';
import FormShell from '../../../Components/Documents/FormShell';
import { Field, TextInput, Textarea, SubmitButton } from '../../../Components/Documents/FormField';
import SelectField from '../../../Components/Documents/SelectField';

declare function route(name: string, params?: unknown): string;

interface LocationOption {
    id: number;
    name: string;
}

interface Props {
    locations: LocationOption[];
}

interface VehicleEntryFormData {
    location_id: number | '';
    license_plate: string;
    company_or_name: string;
    entry_date: string;
    entry_time: string;
    exit_time: string;
    notes: string;
    [key: string]: unknown;
}

export default function VehicleEntryCreate({ locations }: Props) {
    const { data, setData, post, processing, errors } = useForm<VehicleEntryFormData>({
        location_id: '',
        license_plate: '',
        company_or_name: '',
        entry_date: '',
        entry_time: '',
        exit_time: '',
        notes: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('documents.vehicle-entry.store'));
    }

    return (
        <FormShell title="Gépjármű beléptető nyilvántartás" subtitle="Fizikai-biztonsági nyilvántartás" icon={Car}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Irodaház (opcionális)">
                    <SelectField
                        value={data.location_id === '' ? '' : String(data.location_id)}
                        placeholder="Nincs kiválasztva"
                        options={locations.map(l => ({ value: String(l.id), label: l.name }))}
                        onChange={v => setData('location_id', v ? Number(v) : '')}
                    />
                </Field>

                <Field label="Rendszám" required error={errors.license_plate}>
                    <TextInput type="text" value={data.license_plate} onChange={e => setData('license_plate', e.target.value)} required />
                </Field>

                <Field label="Cégnév/név" required error={errors.company_or_name}>
                    <TextInput type="text" value={data.company_or_name} onChange={e => setData('company_or_name', e.target.value)} required />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Dátum" required>
                        <TextInput type="date" value={data.entry_date} onChange={e => setData('entry_date', e.target.value)} required />
                    </Field>
                    <Field label="Belépési idő" required>
                        <TextInput type="time" value={data.entry_time} onChange={e => setData('entry_time', e.target.value)} required />
                    </Field>
                    <Field label="Kilépési idő">
                        <TextInput type="time" value={data.exit_time} onChange={e => setData('exit_time', e.target.value)} />
                    </Field>
                </div>

                <Field label="Megjegyzés">
                    <Textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3} />
                </Field>

                <SubmitButton processing={processing} />
            </form>
        </FormShell>
    );
}
