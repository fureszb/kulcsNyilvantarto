interface AttachmentField {
    key: string;
    label: string;
}

interface Props {
    fields: AttachmentField[];
    values: Record<string, File | null>;
    onChange: (key: string, file: File | null) => void;
}

/** 3 (vagy tetszőleges számú) fájlcsatolmány-mező egy card-ban, címkézve.
 *  A submitnál a `router.post(url, data, { forceFormData: true })` mintát kell
 *  használni, hogy a File-ok multipart-encode-olódjanak. */
export default function AttachmentInput({ fields, values, onChange }: Props) {
    return (
        <div className="space-y-3">
            {fields.map(f => (
                <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
                    <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={e => onChange(f.key, e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {values[f.key] && (
                        <p className="mt-1 text-xs text-slate-400">{values[f.key]?.name}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
