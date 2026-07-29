import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface NfcTag {
    id: number;
    uid: string;
    label?: string;
    is_active: boolean;
    location?: { id: number; name: string };
}

interface Props {
    tags: NfcTag[];
}

interface LocationGroup {
    locationId: number | 'none';
    locationName: string;
    tags: NfcTag[];
}

function groupByLocation(tags: NfcTag[]): LocationGroup[] {
    const groups = new Map<number | 'none', LocationGroup>();

    for (const tag of tags) {
        const key = tag.location?.id ?? 'none';
        if (!groups.has(key)) {
            groups.set(key, {
                locationId: key,
                locationName: tag.location?.name ?? 'Nincs telephelyhez rendelve',
                tags: [],
            });
        }
        groups.get(key)!.tags.push(tag);
    }

    return Array.from(groups.values()).sort((a, b) => a.locationName.localeCompare(b.locationName));
}

export default function NfcTagsIndex({ tags }: Props) {
    function handleDelete(tag: NfcTag) {
        if (!window.confirm('Biztosan törli?')) return;
        router.delete(route('admin.nfc-tags.destroy', tag.id));
    }

    const groups = groupByLocation(tags);

    return (
        <AdminLayout
            title="NFC csekkolási pontok"
            headerActions={
                <Link href={route('admin.nfc-tags.create')} className="btn-primary text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Új checkpoint
                </Link>
            }
        >
            <p className="text-sm text-slate-500 mb-5 max-w-2xl">
                A rendszer NEM beléptető/kiléptető kapu — a biztonsági őr a helyszínre felhelyezett
                NFC-matricákat (checkpointokat, pl. "Hátsó ajtó", "Lift") scanneli be a csekkolási
                körön. Az itt megadott <strong>Címke</strong> jelenik meg a mobil appban a
                beolvasáskor, és ez a lista adja az adott irodaház "Mai bejárás" checklistjét.
            </p>

            {tags.length === 0 ? (
                <div className="card px-5 py-12 text-center text-slate-400">
                    Nincs még csekkolási pont felvéve.{' '}
                    <Link href={route('admin.nfc-tags.create')} className="text-blue-700 font-medium hover:underline">
                        Első checkpoint felvétele →
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {groups.map((group) => (
                        <div key={group.locationId} className="card overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-800">{group.locationName}</h3>
                                <span className="text-xs text-slate-500">{group.tags.length} checkpoint</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[520px]">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Címke</th>
                                            <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Azonosító (UID)</th>
                                            <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Státusz</th>
                                            <th className="px-5 py-2.5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {group.tags.map((tag) => (
                                            <tr key={tag.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-5 py-3 text-slate-800 font-medium">{tag.label ?? '–'}</td>
                                                <td className="px-5 py-3 font-mono text-xs text-slate-600">{tag.uid}</td>
                                                <td className="px-5 py-3">
                                                    {tag.is_active ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">Aktív</span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Inaktív</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <Link href={route('admin.nfc-tags.edit', tag.id)} className="text-xs text-slate-600 hover:underline font-medium">Szerk.</Link>
                                                        <button onClick={() => handleDelete(tag)} className="text-xs text-red-500 hover:underline font-medium">Törlés</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
