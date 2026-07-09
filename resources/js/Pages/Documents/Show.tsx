import { useOwnLayout } from '../../hooks/useOwnLayout';
import type { DocumentSummary } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    document: DocumentSummary;
}

const TYPE_LABELS: Record<string, string> = {
    feljegyzeses_jegyzokonyv: 'Feljegyzéses jegyzőkönyv',
    gepjarmu_beleptetes: 'Gépjármű beléptető nyilvántartás',
    eszkoz_atadas_atvetel: 'Eszközök átadás-átvétele',
    karfelveteli_jegyzokonyv: 'Kárfelvételi jegyzőkönyv',
    kiuritesi_jegyzokonyv: 'Kiürítési jegyzőkönyv',
    kiuritesi_nyilvantartas: 'Kiürítési nyilvántartás',
    kulcs_kartya_atadas_atvetel: 'Kulcs/Kártya átadás-átvétele',
    talalt_targy_jegyzokonyv: 'Talált tárgy jegyzőkönyv',
    robbantasi_fenyegetes: 'Robbantással fenyegetés',
    tuzkulcs_tuzkazetta_kiadas: 'Tűzkulcs és tűzkazetta kiadás',
};

export default function DocumentsShow({ document }: Props) {
    const label = TYPE_LABELS[document.document_type] ?? document.document_type;
    const Layout = useOwnLayout();

    return (
        <Layout title={label}>
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{label}</h1>
                        <p className="text-sm text-slate-500">
                            #{document.id} &middot; {document.location?.name ?? 'Nincs helyszín megadva'} &middot; {document.created_by?.name}
                        </p>
                    </div>
                    <a
                        href={route('documents.download', document.id)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                    >
                        Letöltés
                    </a>
                </div>

                {document.pdf_path ? (
                    <iframe
                        src={route('documents.preview', document.id)}
                        className="w-full rounded-xl border border-slate-200"
                        style={{ height: '75vh' }}
                        title={label}
                    />
                ) : (
                    <p className="text-sm text-slate-500">A PDF még nincs elkészítve.</p>
                )}
            </div>
        </Layout>
    );
}
