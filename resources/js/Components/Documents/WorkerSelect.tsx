import type { TenantUserBasic } from '../../types';
import SelectField from './SelectField';

interface Props {
    label: string;
    workers: TenantUserBasic[];
    value: number | '';
    onChange: (id: number | '') => void;
    required?: boolean;
    surface?: 'default' | 'card';
}

/** Szigorú, egyszemélyes dolgozó-választó — valódi TenantUser FK-t igényel
 *  (nem szabadszavas, mint a PersonPicker). */
export default function WorkerSelect({ label, workers, value, onChange, required, surface }: Props) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {label}{required && <span className="text-amber-600 ml-0.5">*</span>}
            </label>
            <SelectField
                value={value === '' ? '' : String(value)}
                placeholder="Válassz…"
                options={workers.map(w => ({ value: String(w.id), label: w.name }))}
                onChange={v => onChange(v ? Number(v) : '')}
                surface={surface}
            />
        </div>
    );
}
