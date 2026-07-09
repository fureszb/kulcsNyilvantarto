import { useForm } from '@inertiajs/react';
import { DoorOpen } from 'lucide-react';
import FormShell from '../../../Components/Documents/FormShell';
import { Field, TextInput, Textarea, SectionCard, Checkbox, SubmitButton } from '../../../Components/Documents/FormField';
import SelectField from '../../../Components/Documents/SelectField';
import AttachmentInput from '../../../Components/Documents/AttachmentInput';

declare function route(name: string, params?: unknown): string;

interface LocationOption {
    id: number;
    name: string;
}

interface Props {
    locations: LocationOption[];
}

interface EvacuationReportFormData {
    location_id: number | '';
    prepared_by: string;
    prepared_by_position: string;
    location_text: string;
    event_date: string;
    event_description: string;
    alarm_type: string;
    alarm_reason: string;
    evacuation_type: string;
    fire_alarm_control_notes: string;
    deficiencies: string;
    guard_duty_obligations: string;
    tenant_obligations: string;
    had_alarm: boolean;
    fire_what_ignited: string;
    fire_life_in_danger: string;
    fire_extinguished_how: string;
    fire_commander_arrival_time: string;
    fire_reentry_protocol: string;
    fire_cause_responsible: string;
    had_early_warning: boolean;
    delay_before_siren: boolean;
    no_delay_reason: string;
    no_delay_corrective_actions: string;
    delay_reason_not_reacted: string;
    attachment_kiuritesi_nyilvantartas: File | null;
    attachment_hatosagi_jegyzokonyv: File | null;
    attachment_tuzmarshall_jegyzokonyv: File | null;
    [key: string]: unknown;
}

export default function EvacuationReportCreate({ locations }: Props) {
    const { data, setData, post, processing, errors } = useForm<EvacuationReportFormData>({
        location_id: '',
        prepared_by: '',
        prepared_by_position: '',
        location_text: '',
        event_date: '',
        event_description: '',
        alarm_type: '',
        alarm_reason: '',
        evacuation_type: '',
        fire_alarm_control_notes: '',
        deficiencies: '',
        guard_duty_obligations: '',
        tenant_obligations: '',
        had_alarm: true,
        fire_what_ignited: '',
        fire_life_in_danger: '',
        fire_extinguished_how: '',
        fire_commander_arrival_time: '',
        fire_reentry_protocol: '',
        fire_cause_responsible: '',
        had_early_warning: false,
        delay_before_siren: false,
        no_delay_reason: '',
        no_delay_corrective_actions: '',
        delay_reason_not_reacted: '',
        attachment_kiuritesi_nyilvantartas: null,
        attachment_hatosagi_jegyzokonyv: null,
        attachment_tuzmarshall_jegyzokonyv: null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('documents.evacuation-report.store'), { forceFormData: true });
    }

    return (
        <FormShell title="Kiürítési jegyzőkönyv" subtitle="Fizikai-biztonsági jegyzőkönyv" icon={DoorOpen}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Készítette" required>
                        <TextInput type="text" value={data.prepared_by} onChange={e => setData('prepared_by', e.target.value)} required />
                    </Field>
                    <Field label="Beosztása" required>
                        <TextInput type="text" value={data.prepared_by_position} onChange={e => setData('prepared_by_position', e.target.value)} required />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Helyszín" required>
                        <TextInput type="text" value={data.location_text} onChange={e => setData('location_text', e.target.value)} required />
                    </Field>
                    <Field label="Dátum" required>
                        <TextInput type="date" value={data.event_date} onChange={e => setData('event_date', e.target.value)} required />
                    </Field>
                </div>

                <Field label="Esemény leírása" required>
                    <Textarea value={data.event_description} onChange={e => setData('event_description', e.target.value)} required rows={4} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Riasztás típusa" required>
                        <TextInput type="text" value={data.alarm_type} onChange={e => setData('alarm_type', e.target.value)} required />
                    </Field>
                    <Field label="Kiürítés típusa" required>
                        <TextInput type="text" value={data.evacuation_type} onChange={e => setData('evacuation_type', e.target.value)} required />
                    </Field>
                </div>

                <Field label="Riasztás oka" required>
                    <Textarea value={data.alarm_reason} onChange={e => setData('alarm_reason', e.target.value)} required rows={2} />
                </Field>

                <Field label="A tűzjelző berendezések vezérlései" required>
                    <Textarea value={data.fire_alarm_control_notes} onChange={e => setData('fire_alarm_control_notes', e.target.value)} required rows={3} />
                </Field>

                <Field label="Hiányosságok">
                    <Textarea value={data.deficiencies} onChange={e => setData('deficiencies', e.target.value)} rows={2} />
                </Field>

                <Field label="Őrszolgálati kötelezettségek">
                    <Textarea value={data.guard_duty_obligations} onChange={e => setData('guard_duty_obligations', e.target.value)} rows={2} />
                </Field>

                <Field label="Bérlői kötelezettségek">
                    <Textarea value={data.tenant_obligations} onChange={e => setData('tenant_obligations', e.target.value)} rows={2} />
                </Field>

                <Checkbox label="Volt tűzjelzés/riasztás" checked={data.had_alarm} onChange={v => setData('had_alarm', v)} />

                {data.had_alarm ? (
                    <SectionCard title="Tűzjelzés részletei">
                        <Field label="Mi gyulladt ki?">
                            <TextInput surface="card" type="text" value={data.fire_what_ignited} onChange={e => setData('fire_what_ignited', e.target.value)} />
                        </Field>
                        <Field label="Volt-e emberélet veszélyben?">
                            <TextInput surface="card" type="text" value={data.fire_life_in_danger} onChange={e => setData('fire_life_in_danger', e.target.value)} />
                        </Field>
                        <Field label="Ki milyen módon oltotta el?">
                            <TextInput surface="card" type="text" value={data.fire_extinguished_how} onChange={e => setData('fire_extinguished_how', e.target.value)} />
                        </Field>
                        <Field label="Mikor érkezett meg a tűzoltóparancsnok?">
                            <TextInput surface="card" type="datetime-local" value={data.fire_commander_arrival_time} onChange={e => setData('fire_commander_arrival_time', e.target.value)} />
                        </Field>
                        <Field label="Milyen visszaengedési protokollt határozott meg?">
                            <TextInput surface="card" type="text" value={data.fire_reentry_protocol} onChange={e => setData('fire_reentry_protocol', e.target.value)} />
                        </Field>
                        <Field label="Ki a felelőse a tűz kialakulásának?">
                            <TextInput surface="card" type="text" value={data.fire_cause_responsible} onChange={e => setData('fire_cause_responsible', e.target.value)} />
                        </Field>
                    </SectionCard>
                ) : (
                    <SectionCard title="Riasztás hiányának részletei">
                        <Checkbox label="Volt előjelzés" checked={data.had_early_warning} onChange={v => setData('had_early_warning', v)} />

                        {data.had_early_warning && (
                            <>
                                <Checkbox label="A késleltetés a sziréna megszólalása előtt volt" checked={data.delay_before_siren} onChange={v => setData('delay_before_siren', v)} />

                                {!data.delay_before_siren ? (
                                    <>
                                        <Field label="Mi az oka?">
                                            <TextInput surface="card" type="text" value={data.no_delay_reason} onChange={e => setData('no_delay_reason', e.target.value)} />
                                        </Field>
                                        <Field label="Milyen intézkedések történtek a hiba elhárítására?">
                                            <TextInput surface="card" type="text" value={data.no_delay_corrective_actions} onChange={e => setData('no_delay_corrective_actions', e.target.value)} />
                                        </Field>
                                    </>
                                ) : (
                                    <Field label="Miért nem tudtunk időben reagálni?">
                                        <TextInput surface="card" type="text" value={data.delay_reason_not_reacted} onChange={e => setData('delay_reason_not_reacted', e.target.value)} />
                                    </Field>
                                )}
                            </>
                        )}
                    </SectionCard>
                )}

                <AttachmentInput
                    fields={[
                        { key: 'kiuritesi_nyilvantartas', label: 'Kiürítési nyilvántartás csatolása' },
                        { key: 'hatosagi_jegyzokonyv', label: 'Hatósági jegyzőkönyv csatolása' },
                        { key: 'tuzmarshall_jegyzokonyv', label: 'Tűzmarshall jegyzőkönyv csatolása' },
                    ]}
                    values={{
                        kiuritesi_nyilvantartas: data.attachment_kiuritesi_nyilvantartas,
                        hatosagi_jegyzokonyv: data.attachment_hatosagi_jegyzokonyv,
                        tuzmarshall_jegyzokonyv: data.attachment_tuzmarshall_jegyzokonyv,
                    }}
                    onChange={(key, file) => setData(prev => ({ ...prev, [`attachment_${key}`]: file }))}
                />

                <SubmitButton processing={processing} />
                {Object.keys(errors).length > 0 && (
                    <p className="text-xs text-rose-600">Néhány mező kitöltése kötelező vagy hibás.</p>
                )}
            </form>
        </FormShell>
    );
}
