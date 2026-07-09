import { useForm } from '@inertiajs/react';
import { useOwnLayout } from '../../../hooks/useOwnLayout';
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

    const Layout = useOwnLayout();
    const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none';
    const taCls = inputCls;

    return (
        <Layout title="Kiürítési jegyzőkönyv">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-slate-800 mb-6">Kiürítési jegyzőkönyv</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Készítette</label>
                            <input type="text" value={data.prepared_by} onChange={e => setData('prepared_by', e.target.value)} required className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Beosztása</label>
                            <input type="text" value={data.prepared_by_position} onChange={e => setData('prepared_by_position', e.target.value)} required className={inputCls}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Irodaház (opcionális)</label>
                        <select value={data.location_id} onChange={e => setData('location_id', e.target.value ? Number(e.target.value) : '')} className={inputCls}>
                            <option value="">Nincs kiválasztva</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Helyszín</label>
                            <input type="text" value={data.location_text} onChange={e => setData('location_text', e.target.value)} required className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dátum</label>
                            <input type="date" value={data.event_date} onChange={e => setData('event_date', e.target.value)} required className={inputCls}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Esemény leírása</label>
                        <textarea value={data.event_description} onChange={e => setData('event_description', e.target.value)} required rows={4} className={taCls}/>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Riasztás típusa</label>
                            <input type="text" value={data.alarm_type} onChange={e => setData('alarm_type', e.target.value)} required className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kiürítés típusa</label>
                            <input type="text" value={data.evacuation_type} onChange={e => setData('evacuation_type', e.target.value)} required className={inputCls}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Riasztás oka</label>
                        <textarea value={data.alarm_reason} onChange={e => setData('alarm_reason', e.target.value)} required rows={2} className={taCls}/>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">A tűzjelző berendezések vezérlései</label>
                        <textarea value={data.fire_alarm_control_notes} onChange={e => setData('fire_alarm_control_notes', e.target.value)} required rows={3} className={taCls}/>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Hiányosságok</label>
                        <textarea value={data.deficiencies} onChange={e => setData('deficiencies', e.target.value)} rows={2} className={taCls}/>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Őrszolgálati kötelezettségek</label>
                        <textarea value={data.guard_duty_obligations} onChange={e => setData('guard_duty_obligations', e.target.value)} rows={2} className={taCls}/>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bérlői kötelezettségek</label>
                        <textarea value={data.tenant_obligations} onChange={e => setData('tenant_obligations', e.target.value)} rows={2} className={taCls}/>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={data.had_alarm} onChange={e => setData('had_alarm', e.target.checked)} className="w-4 h-4 rounded border-slate-300"/>
                        Volt tűzjelzés/riasztás
                    </label>

                    {data.had_alarm ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                            <p className="text-xs font-bold text-slate-500 uppercase">Tűzjelzés részletei</p>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mi gyulladt ki?</label>
                                <input type="text" value={data.fire_what_ignited} onChange={e => setData('fire_what_ignited', e.target.value)} className={inputCls}/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Volt-e emberélet veszélyben?</label>
                                <input type="text" value={data.fire_life_in_danger} onChange={e => setData('fire_life_in_danger', e.target.value)} className={inputCls}/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ki milyen módon oltotta el?</label>
                                <input type="text" value={data.fire_extinguished_how} onChange={e => setData('fire_extinguished_how', e.target.value)} className={inputCls}/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mikor érkezett meg a tűzoltóparancsnok?</label>
                                <input type="datetime-local" value={data.fire_commander_arrival_time} onChange={e => setData('fire_commander_arrival_time', e.target.value)} className={inputCls}/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Milyen visszaengedési protokollt határozott meg?</label>
                                <input type="text" value={data.fire_reentry_protocol} onChange={e => setData('fire_reentry_protocol', e.target.value)} className={inputCls}/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ki a felelőse a tűz kialakulásának?</label>
                                <input type="text" value={data.fire_cause_responsible} onChange={e => setData('fire_cause_responsible', e.target.value)} className={inputCls}/>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                            <p className="text-xs font-bold text-slate-500 uppercase">Riasztás hiányának részletei</p>
                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input type="checkbox" checked={data.had_early_warning} onChange={e => setData('had_early_warning', e.target.checked)} className="w-4 h-4 rounded border-slate-300"/>
                                Volt előjelzés
                            </label>

                            {data.had_early_warning && (
                                <>
                                    <label className="flex items-center gap-2 text-sm text-slate-700">
                                        <input type="checkbox" checked={data.delay_before_siren} onChange={e => setData('delay_before_siren', e.target.checked)} className="w-4 h-4 rounded border-slate-300"/>
                                        A késleltetés a sziréna megszólalása előtt volt
                                    </label>

                                    {!data.delay_before_siren ? (
                                        <>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mi az oka?</label>
                                                <input type="text" value={data.no_delay_reason} onChange={e => setData('no_delay_reason', e.target.value)} className={inputCls}/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Milyen intézkedések történtek a hiba elhárítására?</label>
                                                <input type="text" value={data.no_delay_corrective_actions} onChange={e => setData('no_delay_corrective_actions', e.target.value)} className={inputCls}/>
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Miért nem tudtunk időben reagálni?</label>
                                            <input type="text" value={data.delay_reason_not_reacted} onChange={e => setData('delay_reason_not_reacted', e.target.value)} className={inputCls}/>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
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

                    <button type="submit" disabled={processing}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer">
                        {processing ? 'Mentés…' : 'Dokumentum létrehozása és PDF generálása'}
                    </button>
                    {Object.keys(errors).length > 0 && (
                        <p className="text-xs text-rose-600">Néhány mező kitöltése kötelező vagy hibás.</p>
                    )}
                </form>
            </div>
        </Layout>
    );
}
