import { useForm } from '@inertiajs/react';
import { useOwnLayout } from '../../../hooks/useOwnLayout';
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

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none">
                <option value="">Válassz…</option>
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
        </div>
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

    const Layout = useOwnLayout();
    const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm focus:outline-none';

    return (
        <Layout title="Robbantással fenyegetés">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-slate-800 mb-6">Robbantással fenyegetés</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Irodaház (opcionális)</label>
                        <select value={data.location_id} onChange={e => setData('location_id', e.target.value ? Number(e.target.value) : '')} className={inputCls}>
                            <option value="">Nincs kiválasztva</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Elhangzott beszélgetés leírása</label>
                        <textarea value={data.call_transcript} onChange={e => setData('call_transcript', e.target.value)} required rows={5} className={inputCls}/>
                        {errors.call_transcript && <p className="mt-1 text-xs text-rose-600">{errors.call_transcript}</p>}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select label="Hívó neme" value={data.caller_gender} onChange={v => setData('caller_gender', v)} options={GENDER_OPTIONS} />
                        <Select label="Életkora" value={data.caller_age_group} onChange={v => setData('caller_age_group', v)} options={AGE_OPTIONS} />
                        <Select label="Beszédstílusa" value={data.speech_style} onChange={v => setData('speech_style', v)} options={SPEECH_OPTIONS} />
                        <Select label="Hangszíne" value={data.voice_tone} onChange={v => setData('voice_tone', v)} options={VOICE_OPTIONS} />
                        <Select label="Érzelmi állapota" value={data.emotional_state} onChange={v => setData('emotional_state', v)} options={EMOTION_OPTIONS} />
                        <Select label="Háttérzaj" value={data.background_noise} onChange={v => setData('background_noise', v)} options={NOISE_OPTIONS} />
                        <Select label="Területi jártasság" value={data.area_familiarity} onChange={v => setData('area_familiarity', v)} options={AREA_OPTIONS} />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Egyéb észrevételek</label>
                        <textarea value={data.other_remarks} onChange={e => setData('other_remarks', e.target.value)} rows={2} className={inputCls}/>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Hívás dátuma</label>
                            <input type="datetime-local" value={data.call_datetime} onChange={e => setData('call_datetime', e.target.value)} required className={inputCls}/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Hívó száma</label>
                            <input type="text" value={data.caller_phone_number} onChange={e => setData('caller_phone_number', e.target.value)} className={inputCls}/>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                        <p className="text-xs font-bold text-slate-500 uppercase">Hívást fogadta</p>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Név</label>
                            <input type="text" value={data.receiver_name} onChange={e => setData('receiver_name', e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Beosztás</label>
                            <input type="text" value={data.receiver_position} onChange={e => setData('receiver_position', e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Születési idő</label>
                            <input type="date" value={data.receiver_birth_date} onChange={e => setData('receiver_birth_date', e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Anyja neve</label>
                            <input type="text" value={data.receiver_mother_name} onChange={e => setData('receiver_mother_name', e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lakcím</label>
                            <input type="text" value={data.receiver_address} onChange={e => setData('receiver_address', e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Szem. ig. szám</label>
                            <input type="text" value={data.receiver_id_card_number} onChange={e => setData('receiver_id_card_number', e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-400 transition text-sm focus:outline-none"/>
                        </div>
                    </div>

                    <SignaturePad label="Hívást fogadó aláírása" value={data.signature_hivast_fogado} onChange={v => setData('signature_hivast_fogado', v)} />

                    <button type="submit" disabled={processing}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer">
                        {processing ? 'Mentés…' : 'Dokumentum létrehozása és PDF generálása'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
