import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, router, Link } from '@inertiajs/react';
import PmLayout from '../../Layouts/PmLayout';
import type { PmMessage, PmMessageReply, TenantUser, PaginatedData } from '../../types';

interface Props {
    messages: PaginatedData<PmMessage>;
    workers: TenantUser[];
    filters?: { date_from?: string; date_to?: string; user_id?: string };
}

interface NewMessageFormData {
    content: string;
    send_to_all: boolean;
    user_ids: number[];
    [key: string]: unknown;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('hu-HU', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });
}

function DeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
                <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 mr-3">
                        <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Üzenet törlése</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Ez a művelet nem visszavonható.</p>
                    </div>
                </div>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">Biztosan törlöd ezt az üzenetet? A törlés után a címzettjeknél is eltűnik.</p>
                <div className="flex gap-2.5">
                    <button type="button" onClick={onCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors">
                        Mégse
                    </button>
                    <button type="button" onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-colors shadow-sm">
                        Törlés
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

interface EditFormData {
    content: string;
    send_to_all: boolean;
    user_ids: number[];
    [key: string]: unknown;
}

function InlineEditForm({ message, workers, onCancel }: { message: PmMessage; workers: TenantUser[]; onCancel: () => void }) {
    const existingIds = (message.recipients ?? []).map(r => r.user_id);
    const [search, setSearch] = useState('');
    const { data, setData, put, processing, errors } = useForm<EditFormData>({
        content: message.content,
        send_to_all: message.send_to_all,
        user_ids: existingIds,
    });

    // Meglévő recipients beolvasztása a listába, ha már nem aktívak
    const existingUsers = (message.recipients ?? [])
        .map(r => r.user)
        .filter((u): u is TenantUser => u !== undefined);
    const allWorkers = [
        ...workers,
        ...existingUsers.filter(u => !workers.some(w => w.id === u.id)),
    ];

    const filtered = search.trim()
        ? allWorkers.filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
        : allWorkers;

    function toggleRecipient(id: number) {
        setData('user_ids', data.user_ids.includes(id)
            ? data.user_ids.filter(r => r !== id)
            : [...data.user_ids, id]);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('pm.messages.update', message.id));
    }

    return (
        <form onSubmit={submit} className="px-5 py-4 space-y-4 border-t border-amber-100 bg-amber-50/30">
            {/* Content */}
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Üzenet szövege</label>
                <textarea
                    value={data.content}
                    onChange={e => setData('content', e.target.value)}
                    rows={4}
                    required
                    maxLength={2000}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 focus:border-amber-400 focus:outline-none transition resize-none"
                />
                {errors.content && <p className="text-xs text-rose-500 mt-1">{errors.content}</p>}
            </div>

            {/* Target selection */}
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kinek szól?</label>
                <div className="flex gap-3 flex-wrap">
                    <label className={`flex items-center gap-2 cursor-pointer px-3.5 py-2 rounded-xl border transition-colors text-sm ${data.send_to_all ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50'}`}>
                        <input type="radio" name={`sta_${message.id}`} checked={data.send_to_all} onChange={() => setData('send_to_all', true)} className="text-amber-600 cursor-pointer" />
                        <span className="font-semibold text-slate-800">Mindenkinek</span>
                    </label>
                    <label className={`flex items-center gap-2 cursor-pointer px-3.5 py-2 rounded-xl border transition-colors text-sm ${!data.send_to_all ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50'}`}>
                        <input type="radio" name={`sta_${message.id}`} checked={!data.send_to_all} onChange={() => setData('send_to_all', false)} className="text-amber-600 cursor-pointer" />
                        <span className="font-semibold text-slate-800">Kiválasztottaknak</span>
                    </label>
                </div>
            </div>

            {/* User picker */}
            {!data.send_to_all && (
                <div>
                    <div className="flex items-center gap-2 px-3 rounded-xl border border-slate-200 bg-white focus-within:border-amber-400 transition mb-2">
                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Keresés névre…"
                            className="flex-1 py-2.5 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none" />
                        {search && (
                            <button type="button" onClick={() => setSearch('')} className="text-slate-300 hover:text-slate-500 transition shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        )}
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
                        {filtered.map(w => (
                            <label key={w.id} className="flex items-center gap-3 px-4 py-2 border-b border-slate-100 bg-white cursor-pointer hover:bg-amber-50 transition-colors last:border-b-0">
                                <input type="checkbox" checked={data.user_ids.includes(w.id)} onChange={() => toggleRecipient(w.id)}
                                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer" />
                                <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">
                                    {w.name.charAt(0).toUpperCase()}
                                </span>
                                <span className="text-sm font-medium text-slate-800 flex-1 truncate">{w.name}</span>
                            </label>
                        ))}
                        {filtered.length === 0 && (
                            <div className="px-4 py-3 text-sm text-slate-400 text-center">Nincs találat.</div>
                        )}
                    </div>
                    {errors.user_ids && <p className="text-xs text-rose-500 mt-1">{errors.user_ids as string}</p>}
                </div>
            )}

            <div className="flex items-center gap-2.5">
                <button type="submit" disabled={processing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-60 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                    {processing ? 'Mentés...' : 'Mentés'}
                </button>
                <button type="button" onClick={onCancel}
                    className="inline-flex items-center px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer">
                    Mégse
                </button>
            </div>
        </form>
    );
}

export default function PmMessages({ messages, workers, filters }: Props) {
    const [sendToAll, setSendToAll] = useState(true);
    const [search, setSearch]       = useState('');
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo]     = useState(filters?.date_to   ?? '');
    const [userId, setUserId]     = useState(filters?.user_id   ?? '');
    const hasFilter = !!(filters?.date_from || filters?.date_to || filters?.user_id);

    const { data, setData, post, processing, errors, reset } = useForm<NewMessageFormData>({
        content: '',
        send_to_all: true,
        user_ids: [],
    });

    const filteredWorkers = search.trim()
        ? workers.filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
        : workers;

    function toggleRecipient(id: number) {
        const ids = data.user_ids.includes(id)
            ? data.user_ids.filter(r => r !== id)
            : [...data.user_ids, id];
        setData('user_ids', ids);
    }

    function handleSendToAllChange(val: boolean) {
        setSendToAll(val);
        setData('send_to_all', val);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('pm.messages.store'), { onSuccess: () => { reset(); setSendToAll(true); } });
    }

    function submitFilter(e: React.FormEvent) {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo)   params.date_to   = dateTo;
        if (userId)   params.user_id   = userId;
        router.get(route('pm.messages'), params, { preserveState: true });
    }

    function clearFilter() {
        setDateFrom(''); setDateTo(''); setUserId('');
        router.get(route('pm.messages'), {}, { preserveState: false });
    }

    function confirmDelete() {
        if (deleteTargetId === null) return;
        router.delete(route('pm.messages.destroy', deleteTargetId), {
            onSuccess: () => setDeleteTargetId(null),
        });
    }

    return (
        <PmLayout title="Üzenetek">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
                    <div className="relative px-8 py-8 flex items-center justify-between gap-6">
                        <div>
                            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Property Manager · Kommunikáció</p>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">Üzenetek</h1>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                    {messages.total} elküldött üzenet
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    {workers.length} aktív felhasználó
                                </span>
                            </div>
                        </div>
                        <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        </div>
                    </div>
                </div>

                {/* New message form */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </div>
                        <h2 className="font-bold text-slate-800">Új üzenet küldése</h2>
                    </div>
                    <form onSubmit={submit} className="p-6 space-y-5">
                        {/* Target selection */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kinek szól?</label>
                            <div className="flex gap-4 flex-wrap">
                                <label className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors ${sendToAll ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-amber-200 hover:bg-amber-50'}`}>
                                    <input type="radio" name="send_to_all" checked={sendToAll} onChange={() => handleSendToAllChange(true)} className="text-amber-600 cursor-pointer" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Mindenkinek</p>
                                        <p className="text-xs text-slate-400">{workers.length} fő</p>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors ${!sendToAll ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-amber-200 hover:bg-amber-50'}`}>
                                    <input type="radio" name="send_to_all" checked={!sendToAll} onChange={() => handleSendToAllChange(false)} className="text-amber-600 cursor-pointer" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Kiválasztott felhasználóknak</p>
                                        <p className="text-xs text-slate-400">Egyéni kiválasztás</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* User picker */}
                        {!sendToAll && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Felhasználók kiválasztása</label>
                                {workers.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic">Nincs aktív felhasználó.</p>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-amber-400 focus-within:bg-white transition mb-0">
                                            <svg className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Keresés névre…" autoComplete="off"
                                                className="flex-1 py-2.5 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none" />
                                            {search.length > 0 && (
                                                <button type="button" onClick={() => setSearch('')} className="text-slate-300 hover:text-slate-500 transition shrink-0 cursor-pointer">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                                </button>
                                            )}
                                        </div>
                                        <div className="px-3 py-1.5 border-x border-t border-slate-200 bg-slate-50 flex items-center justify-between mt-2 rounded-t-xl">
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{search ? 'Találatok' : 'Összes felhasználó'}</span>
                                            <span className="text-[10px] text-slate-400">{filteredWorkers.length} fő</span>
                                        </div>
                                        <div className="border border-slate-200 rounded-b-xl overflow-hidden max-h-56 overflow-y-auto">
                                            {filteredWorkers.map(w => (
                                                <label key={w.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-white cursor-pointer hover:bg-amber-50 transition-colors last:border-b-0">
                                                    <input type="checkbox" checked={data.user_ids.includes(w.id)} onChange={() => toggleRecipient(w.id)}
                                                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer" />
                                                    <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">
                                                        {w.name.charAt(0).toUpperCase()}
                                                    </span>
                                                    <span className="text-sm font-medium text-slate-800 flex-1 truncate">{w.name}</span>
                                                </label>
                                            ))}
                                            {filteredWorkers.length === 0 && (
                                                <div className="px-4 py-3 text-sm text-slate-400 text-center">
                                                    Nincs találat: „<span className="font-medium text-slate-600">{search}</span>"
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                                {errors.user_ids && <p className="text-xs text-rose-500 mt-1.5">{errors.user_ids as string}</p>}
                            </div>
                        )}

                        {/* Message content */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Üzenet szövege</label>
                            <textarea name="content" value={data.content} onChange={e => setData('content', e.target.value)}
                                rows={4} required maxLength={2000}
                                placeholder="Pl. Kérem hogy pénteken mindenki 30 perccel korábban érjen be az éves ellenőrzés miatt..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition resize-none"
                            />
                            {errors.content && <p className="text-xs text-rose-500 mt-1">{errors.content}</p>}
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-60 cursor-pointer">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                                {processing ? 'Küldés...' : 'Üzenet küldése'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
                        Elküldött üzenetek
                        {messages.total > 0 && (
                            <span className="ml-1.5 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{messages.total}</span>
                        )}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Filter */}
                <form onSubmit={submitFilter} className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-1 min-w-[140px]">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dátumtól</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition" />
                        </div>
                        <div className="flex flex-col gap-1 min-w-[140px]">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dátumig</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition" />
                        </div>
                        <div className="flex flex-col gap-1 min-w-[180px]">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Címzett</label>
                            <select value={userId} onChange={e => setUserId(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition">
                                <option value="">— Mindenki —</option>
                                {workers.map(w => (
                                    <option key={w.id} value={String(w.id)}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 pb-0.5">
                            <button type="submit"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/></svg>
                                Szűrés
                            </button>
                            {hasFilter && (
                                <button type="button" onClick={clearFilter}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-sm font-semibold rounded-xl transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                    Törlés
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Message list */}
                {messages.data.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-14 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        </div>
                        <p className="text-base font-semibold text-slate-600">Még nem küldtél üzenetet</p>
                        <p className="text-sm text-slate-400 mt-1">Az elküldött üzenetek itt jelennek meg.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.data.map(msg => {
                            const recipientNames = !msg.send_to_all && msg.recipients
                                ? msg.recipients.map(r => r.user?.name).filter(Boolean)
                                : [];
                            return (
                                <div key={msg.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Header bar */}
                                    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3 flex-wrap">
                                        {msg.send_to_all ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                Mindenkinek
                                            </span>
                                        ) : (
                                            <>
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                                    {msg.recipients?.length ?? 0} felhasználónak
                                                </span>
                                                {recipientNames.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {recipientNames.map((name, i) => (
                                                            <span key={i} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">{name}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <span className="ml-auto text-xs text-slate-400 flex items-center gap-1 shrink-0">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                            {formatDate(msg.created_at)}
                                        </span>
                                    </div>
                                    {editingId === msg.id ? (
                                        <InlineEditForm
                                            message={msg}
                                            workers={workers}
                                            onCancel={() => setEditingId(null)}
                                        />
                                    ) : (
                                        <>
                                            {/* Content */}
                                            <div className="px-5 py-4">
                                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{msg.content}</p>
                                                {(msg.replies?.length ?? 0) > 0 && (
                                                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Válaszok ({msg.replies!.length})</p>
                                                        {msg.replies!.map((r: PmMessageReply) => (
                                                            <div key={r.id} className="flex items-start gap-2.5">
                                                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                                                    <span className="text-[10px] font-bold text-blue-600">{r.sender_name.charAt(0).toUpperCase()}</span>
                                                                </div>
                                                                <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs font-semibold text-slate-700">{r.sender_name}</span>
                                                                        <span className="text-[10px] text-slate-400">
                                                                            {new Date(r.created_at).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{r.content}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Action footer */}
                                            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(msg.id)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-200 text-slate-600 hover:text-amber-700 text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                    Szerkesztés
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTargetId(msg.id)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                    Törlés
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {messages.last_page > 1 && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-400">{messages.from ?? 0}–{messages.to ?? 0} / {messages.total}</span>
                        <div className="flex items-center gap-1 flex-wrap">
                            {messages.links.map((link, i) => (
                                link.url ? (
                                    <Link key={i} href={link.url} className={`min-w-[2.25rem] h-9 px-3 flex items-center justify-center rounded-xl text-sm font-medium border transition-colors ${link.active ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <span key={i} className="min-w-[2.25rem] h-9 px-3 flex items-center justify-center rounded-xl text-sm font-medium border border-slate-100 text-slate-300 bg-white" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete modal */}
            {deleteTargetId !== null && (
                <DeleteModal onConfirm={confirmDelete} onCancel={() => setDeleteTargetId(null)} />
            )}
        </PmLayout>
    );
}
