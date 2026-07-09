import { router } from '@inertiajs/react';
import { useOwnLayout } from '../../hooks/useOwnLayout';
import type { DocumentSummary, PaginatedData } from '../../types';

declare function route(name: string, params?: unknown): string;

interface LocationOption {
    id: number;
    name: string;
}

interface Props {
    documents: PaginatedData<DocumentSummary>;
    locations: LocationOption[];
    documentType: string;
    locationId: number | string | null;
    canCreate: boolean;
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

/** Típusonként a "Create" route neve — ahogy egy típus implementációja elkészül,
 *  ide kerül be, hogy megjelenjen az "Új dokumentum" listában. */
const CREATE_ROUTES: Record<string, string> = {
    feljegyzeses_jegyzokonyv: 'documents.incident-report.create',
    gepjarmu_beleptetes: 'documents.vehicle-entry.create',
    eszkoz_atadas_atvetel: 'documents.equipment-handover.create',
    karfelveteli_jegyzokonyv: 'documents.damage-report.create',
    kiuritesi_jegyzokonyv: 'documents.evacuation-report.create',
    kiuritesi_nyilvantartas: 'documents.evacuation-registry.create',
    kulcs_kartya_atadas_atvetel: 'documents.key-card-handover.create',
    talalt_targy_jegyzokonyv: 'documents.lost-found-report.create',
    robbantasi_fenyegetes: 'documents.bomb-threat.create',
    tuzkulcs_tuzkazetta_kiadas: 'documents.fire-key-issuance.create',
};

export default function DocumentsIndex({ documents, locations, documentType, locationId, canCreate }: Props) {
    function applyFilter(nextType: string, nextLocation: string) {
        router.get(route('documents.index'), { document_type: nextType, location_id: nextLocation }, { preserveState: true });
    }

    const Layout = useOwnLayout();

    return (
        <Layout title="Dokumentumok">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold text-slate-800">Dokumentumok</h1>
                </div>

                {canCreate && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {Object.entries(CREATE_ROUTES).map(([type, routeName]) => (
                            <a
                                key={type}
                                href={route(routeName)}
                                className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                            >
                                + {TYPE_LABELS[type]}
                            </a>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap gap-3 mb-4">
                    <select
                        value={documentType}
                        onChange={e => applyFilter(e.target.value, String(locationId ?? ''))}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                    >
                        <option value="">Összes típus</option>
                        {Object.entries(TYPE_LABELS).map(([type, label]) => (
                            <option key={type} value={type}>{label}</option>
                        ))}
                    </select>
                    <select
                        value={locationId ?? ''}
                        onChange={e => applyFilter(documentType, e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                    >
                        <option value="">Összes helyszín</option>
                        {locations.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    {documents.data.map(doc => (
                        <a
                            key={doc.id}
                            href={route('documents.show', doc.id)}
                            className="block p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{TYPE_LABELS[doc.document_type] ?? doc.document_type}</p>
                                    <p className="text-xs text-slate-500">
                                        {doc.location?.name ?? 'Nincs helyszín'} &middot; {doc.created_by?.name} &middot; {new Date(doc.created_at).toLocaleString('hu-HU')}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${doc.status === 'finalized' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {doc.status === 'finalized' ? 'Kész' : 'Vázlat'}
                                </span>
                            </div>
                        </a>
                    ))}
                    {documents.data.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-8">Nincs még dokumentum.</p>
                    )}
                </div>

                {documents.links.length > 3 && (
                    <div className="mt-6 flex flex-wrap gap-1">
                        {documents.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${link.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'} disabled:opacity-40`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
