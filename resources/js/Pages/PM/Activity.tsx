import { Link } from '@inertiajs/react';
import PmLayout from '../../Layouts/PmLayout';
import type { ActivityLog, PaginatedData } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    logs: PaginatedData<ActivityLog>;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('hu-HU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function PmActivity({ logs }: Props) {
    return (
        <PmLayout title="Napló">
            <div className="flex items-center justify-between gap-4 mb-5">
                <p className="text-sm text-slate-500">
                    Összesen: <span className="font-semibold text-slate-700">{logs.total}</span> bejegyzés
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {logs.data.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <p className="text-slate-500 text-sm">Nincs tevékenységnapló bejegyzés.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dátum</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Művelet</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Felhasználó</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Leírás</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap text-xs">
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700 font-medium">
                                            {log.user_name ?? <span className="text-slate-400 italic">Ismeretlen</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                                            {log.description ?? <span className="text-slate-300">–</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {logs.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">{logs.from ?? 0}–{logs.to ?? 0} / {logs.total}</p>
                    <div className="flex items-center gap-1 flex-wrap">
                        {logs.links.map((link, idx) => (
                            link.url ? (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${link.active ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 bg-white border border-slate-200 cursor-default"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                </div>
            )}
        </PmLayout>
    );
}
