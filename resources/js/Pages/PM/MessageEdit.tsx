import { useForm, Link } from '@inertiajs/react';
import PmLayout from '../../Layouts/PmLayout';
import type { PmMessage, TenantUser } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    message: PmMessage;
    workers: TenantUser[];
}

interface FormData {
    content: string;
    user_ids: number[];
    send_to_all: boolean;
    [key: string]: unknown;
}

export default function PmMessageEdit({ message, workers }: Props) {
    const existingRecipientIds = (message.recipients ?? []).map((r) => r.user_id);

    const { data, setData, put, processing, errors } = useForm<FormData>({
        content: message.content,
        user_ids: existingRecipientIds,
        send_to_all: message.send_to_all,
    });

    function toggleRecipient(id: number) {
        const ids = data.user_ids.includes(id)
            ? data.user_ids.filter((r) => r !== id)
            : [...data.user_ids, id];
        setData('user_ids', ids);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('pm.messages.update', message.id));
    }

    return (
        <PmLayout title="Üzenet szerkesztése">
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                <Link href={route('pm.messages')} className="text-amber-600 hover:underline">Üzenetek</Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                <span>Szerkesztés</span>
            </div>

            <div className="max-w-2xl">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-5">Üzenet szerkesztése</h2>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="content">Üzenet szövege</label>
                            <textarea
                                id="content"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                rows={5}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                                required
                            />
                            {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content}</p>}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 mb-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.send_to_all}
                                    onChange={(e) => setData('send_to_all', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-sm font-medium text-slate-700">Küldés mindenkinek</span>
                            </label>

                            {!data.send_to_all && (
                                <>
                                    <p className="block text-sm font-medium text-slate-700 mb-2">Címzettek</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                        {workers.map((w) => (
                                            <label key={w.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={data.user_ids.includes(w.id)}
                                                    onChange={() => toggleRecipient(w.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                                />
                                                <span className="text-sm font-medium text-slate-700 truncate">{w.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}
                            {errors.user_ids && <p className="mt-1 text-xs text-red-600">{errors.user_ids as string}</p>}
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-60 transition-colors"
                            >
                                {processing ? 'Mentés...' : 'Mentés'}
                            </button>
                            <Link
                                href={route('pm.messages')}
                                className="inline-flex items-center px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Mégse
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </PmLayout>
    );
}
