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

export default function NfcTagsIndex({ tags }: Props) {
    function handleDelete(tag: NfcTag) {
        if (!window.confirm('Biztosan törli?')) return;
        router.delete(route('admin.nfc-tags.destroy', tag.id));
    }

    return (
        <AdminLayout
            title="NFC matricák"
            headerActions={
                <Link href={route('admin.nfc-tags.create')} className="btn-primary text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Új NFC matrica
                </Link>
            }
        >
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[560px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Azonosító (UID)</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Címke</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Telephely</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Státusz</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tags.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                                        Nincs még NFC matrica felvéve.{' '}
                                        <Link href={route('admin.nfc-tags.create')} className="text-blue-700 font-medium hover:underline">
                                            Első matrica felvétele →
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                tags.map((tag) => (
                                    <tr key={tag.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3.5 font-mono text-xs text-slate-800">{tag.uid}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{tag.label ?? '–'}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{tag.location?.name ?? '–'}</td>
                                        <td className="px-5 py-3.5">
                                            {tag.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">Aktív</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Inaktív</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2 justify-end">
                                                <Link href={route('admin.nfc-tags.edit', tag.id)} className="text-xs text-slate-600 hover:underline font-medium">Szerk.</Link>
                                                <button onClick={() => handleDelete(tag)} className="text-xs text-red-500 hover:underline font-medium">Törlés</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
