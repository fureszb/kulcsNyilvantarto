import { useForm } from '@inertiajs/react';
import { AlertOctagon } from 'lucide-react';
import FormShell from '../../../Components/Documents/FormShell';
import { Field, TextInput, Textarea, SectionCard, SubmitButton } from '../../../Components/Documents/FormField';
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

interface BombThreatFormData {
    location_id: number | '';
    call_transcript: string;
    caller_gender: string;
    caller_age_group: string;
    speech_style: string;
    voice_tone: string;
    emotional_state: string;
    background_noise: string;
    area_familiarity: string;
    other_remarks: string;
    call_datetime: string;
    caller_phone_number: string;
    receiver_name: string;
    receiver_position: string;
    receiver_birth_date: string;
    receiver_mother_name: string;
    receiver_address: string;
    receiver_id_card_number: string;
    signature_hivast_fogado: string | null;
    [key: string]: unknown;
}

const GENDER_OPTIONS = [['ferfi', 'Férfi'], ['no', 'Nő']];
const AGE_OPTIONS = [['fiatal', 'Fiatal'], ['kozepkoru', 'Középkorú'], ['idos', 'Idős'], ['gyermek_lany', 'Gyermek lány'], ['gyermek_fiu', 'Gyermek fiú']];
const SPEECH_OPTIONS = [
    ['normalis', 'Normális'], ['idegen_akcentus', 'Idegen akcentus'], ['tajszolas', 'Tájszólás'], ['hadaro', 'Hadaró'],
    ['magabiztos', 'Magabiztos'], ['gyors', 'Gyors'], ['lassu', 'Lassú'], ['tagolt', 'Tagolt'],
    ['vontatott', 'Vontatott'], ['posze', 'Pösze'], ['felolvasott', 'Felolvasott'], ['irodalmi', 'Irodalmi'],
];
const VOICE_OPTIONS = [
    ['magas', 'Magas'], ['mely', 'Mély'], ['lagy', 'Lágy'], ['suttogo', 'Suttogó'], ['halk', 'Halk'],
    ['torzitott', 'Torzított'], ['rekedt', 'Rekedt'], ['orrhang', 'Orrhang'], ['hangos', 'Hangos'],
];
const EMOTION_OPTIONS = [
    ['raero', 'Ráérős'], ['izgatott', 'Izgatott'], ['pattogo', 'Pattogó'], ['kiabalo', 'Kiabáló'],
    ['nyugodt', 'Nyugodt'], ['erzelmes', 'Érzelmes'], ['dadogo', 'Dadogó'], ['vidam', 'Vidám'],
    ['tragar', 'Trágár'], ['ittas', 'Ittas'], ['selypito', 'Selypítő'], ['osszefuggestelen', 'Összefüggéstelen'],
];
const NOISE_OPTIONS = [
    ['semmi', 'Semmi'], ['vasutallomas', 'Vasútállomás'], ['tarsasag', 'Társaság'], ['utcai_forgalom', 'Utcai forgalom'],
    ['csorompoles', 'Csörömpölés'], ['zene', 'Zene'], ['gyar_uzem', 'Gyár-üzem'], ['tv', 'TV'],
    ['szorakozohely', 'Szórakozóhely'], ['hivatali_zaj', 'Hivatali zaj'],
];
const AREA_OPTIONS = [['altalanos', 'Általános'], ['szakszeru', 'Szakszerű'], ['helyi_ismeretre_vallo', 'Helyi ismeretre valló']];

function EnumField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
    return (
        <Field label={label} required>
            <SelectField
                value={value}
                placeholder="Válassz…"
                options={options.map(([v, l]) => ({ value: v, label: l }))}
                onChange={onChange}
                surface="card"
            />
        </Field>
    );
}

export default function BombThreatCreate({ locations }: Props) {
    const { data, setData, post, processing, errors } = useForm<BombThreatFormData>({
        location_id: '',
        call_transcript: '',
        caller_gender: '',
        caller_age_group: '',
        speech_style: '',
        voice_tone: '',
        emotional_state: '',
        background_noise: '',
        area_familiarity: '',
        other_remarks: '',
        call_datetime: '',
        caller_phone_number: '',
        receiver_name: '',
        receiver_position: '',
        receiver_birth_date: '',
        receiver_mother_name: '',
        receiver_address: '',
        receiver_id_card_number: '',
        signature_hivast_fogado: null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('documents.bomb-threat.store'));
    }

    return (
        <FormShell title="Robbantással fenyegetés" subtitle="Fizikai-biztonsági jegyzőkönyv" icon={AlertOctagon}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Irodaház (opcionális)">
                    <SelectField
                        value={data.location_id === '' ? '' : String(data.location_id)}
                        placeholder="Nincs kiválasztva"
                        options={locations.map(l => ({ value: String(l.id), label: l.name }))}
                        onChange={v => setData('location_id', v ? Number(v) : '')}
                    />
                </Field>

                <Field label="Elhangzott beszélgetés leírása" required error={errors.call_transcript}>
                    <Textarea value={data.call_transcript} onChange={e => setData('call_transcript', e.target.value)} required rows={5} />
                </Field>

                <SectionCard title="A hívó jellemzői">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <EnumField label="Hívó neme" value={data.caller_gender} onChange={v => setData('caller_gender', v)} options={GENDER_OPTIONS} />
                        <EnumField label="Életkora" value={data.caller_age_group} onChange={v => setData('caller_age_group', v)} options={AGE_OPTIONS} />
                        <EnumField label="Beszédstílusa" value={data.speech_style} onChange={v => setData('speech_style', v)} options={SPEECH_OPTIONS} />
                        <EnumField label="Hangszíne" value={data.voice_tone} onChange={v => setData('voice_tone', v)} options={VOICE_OPTIONS} />
                        <EnumField label="Érzelmi állapota" value={data.emotional_state} onChange={v => setData('emotional_state', v)} options={EMOTION_OPTIONS} />
                        <EnumField label="Háttérzaj" value={data.background_noise} onChange={v => setData('background_noise', v)} options={NOISE_OPTIONS} />
                        <EnumField label="Területi jártasság" value={data.area_familiarity} onChange={v => setData('area_familiarity', v)} options={AREA_OPTIONS} />
                    </div>
                </SectionCard>

                <Field label="Egyéb észrevételek">
                    <Textarea value={data.other_remarks} onChange={e => setData('other_remarks', e.target.value)} rows={2} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Hívás dátuma" required>
                        <TextInput type="datetime-local" value={data.call_datetime} onChange={e => setData('call_datetime', e.target.value)} required />
                    </Field>
                    <Field label="Hívó száma">
                        <TextInput type="text" value={data.caller_phone_number} onChange={e => setData('caller_phone_number', e.target.value)} />
                    </Field>
                </div>

                <SectionCard title="Hívást fogadta">
                    <Field label="Név" required>
                        <TextInput surface="card" type="text" value={data.receiver_name} onChange={e => setData('receiver_name', e.target.value)} required />
                    </Field>
                    <Field label="Beosztás" required>
                        <TextInput surface="card" type="text" value={data.receiver_position} onChange={e => setData('receiver_position', e.target.value)} required />
                    </Field>
                    <Field label="Születési idő" required>
                        <TextInput surface="card" type="date" value={data.receiver_birth_date} onChange={e => setData('receiver_birth_date', e.target.value)} required />
                    </Field>
                    <Field label="Anyja neve" required>
                        <TextInput surface="card" type="text" value={data.receiver_mother_name} onChange={e => setData('receiver_mother_name', e.target.value)} required />
                    </Field>
                    <Field label="Lakcím" required>
                        <TextInput surface="card" type="text" value={data.receiver_address} onChange={e => setData('receiver_address', e.target.value)} required />
                    </Field>
                    <Field label="Szem. ig. szám" required>
                        <TextInput surface="card" type="text" value={data.receiver_id_card_number} onChange={e => setData('receiver_id_card_number', e.target.value)} required />
                    </Field>
                </SectionCard>

                <SignaturePad label="Hívást fogadó aláírása" value={data.signature_hivast_fogado} onChange={v => setData('signature_hivast_fogado', v)} />

                <SubmitButton processing={processing} />
            </form>
        </FormShell>
    );
}
