import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useOwnLayout } from '../../hooks/useOwnLayout';
import { getEcho } from '../../echo';
import type { PageProps } from '../../types';

interface PresentUser {
    id: number;
    name: string;
    role: string;
    last_entry_at: string;
    last_entry_location_id: number;
    last_entry_location?: { id: number; name: string };
}

interface Props {
    presentUsers: PresentUser[];
}

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    user: 'Dolgozó',
    property_manager: 'Property Manager',
    security_lead: 'Biztonsági vezető',
    area_director: 'Területi igazgató',
};

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

export default function PresenceIndex({ presentUsers }: Props) {
    const Layout = useOwnLayout();
    const { tenant } = usePage<PageProps>().props;

    useEffect(() => {
        if (!tenant?.slug) return;
        try {
            const channel = getEcho(tenant.slug).private(`tenant.${tenant.slug}.presence`);
            channel.listen('.nfc-access', () => {
                router.reload({ only: ['presentUsers'] });
            });
            return () => { channel.stopListening('.nfc-access'); };
        } catch { /* no-op, oldal frissítéssel is aktuális marad */ }
    }, [tenant?.slug]);

    return (
        <Layout title="Ki van bent">
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Név</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Szerepkör</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Telephely</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Belépés</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {presentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                                        Jelenleg senki nincs bent.
                                    </td>
                                </tr>
                            ) : (
                                presentUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3.5 font-semibold text-slate-800">{u.name}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{ROLE_LABELS[u.role] ?? u.role}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{u.last_entry_location?.name ?? '–'}</td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                                {formatTime(u.last_entry_at)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
