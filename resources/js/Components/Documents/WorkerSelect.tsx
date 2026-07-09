import type { TenantUserBasic } from '../../types';

interface Props {
    label: string;
    workers: TenantUserBasic[];
    value: number | '';
    onChange: (id: number | '') => void;
    required?: boolean;
}

/** Szigorú, natív <select>-alapú egyszemélyes dolgozó-választó — valódi
 *  TenantUser FK-t igényel (nem szabadszavas, mint a PersonPicker). */
export default function WorkerSelect({ label, workers, value, onChange, required }: Props) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
            <select
                value={value}
                onChange={e => onChange(e.target.value ? Number(e.target.value) : '')}
                required={required}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition text-sm text-slate-700 focus:outline-none"
            >
                <option value="">Válassz…</option>
                {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                ))}
            </select>
        </div>
    );
}
