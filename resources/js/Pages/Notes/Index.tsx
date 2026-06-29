import { useState, useEffect } from 'react';
import { router, useForm, Link, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { getEcho } from '../../echo';
import type { ShiftNote, AuthUser, PaginatedData, PageProps } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    notes: PaginatedData<ShiftNote>;
    user: AuthUser;
    filterDate: string;
}

interface NewNoteFormData {
    content: string;
    [key: string]: unknown;
}

function getTodayString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getFilterLabel(filterDate: string): string {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    if (filterDate === today) return 'Ma';
    if (filterDate === yesterday) return 'Tegnap';
    return new Date(filterDate + 'T12:00:00').toLocaleDateString('hu-HU', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    });
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

function formatClock(d: Date): string {
    return (
        d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) +
        ' · ' +
        d.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })
    );
}

function silentReload() {
    (window as Window & { __silentReload?: boolean }).__silentReload = true;
    router.reload({ only: ['notes'], preserveScroll: true });
}

export default function NotesIndex({ notes, user, filterDate }: Props) {
    const { props: { tenant } } = usePage<PageProps>();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editNoteDate, setEditNoteDate] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [clock, setClock] = useState(new Date());
    const [pollingEnabled, setPollingEnabled] = useState<boolean>(() => {
        try { return localStorage.getItem('notes_polling_enabled') !== 'false'; } catch { return true; }
    });

    function togglePolling() {
        const next = !pollingEnabled;
        setPollingEnabled(next);
        try { localStorage.setItem('notes_polling_enabled', String(next)); } catch {}
    }

    useEffect(() => {
        const id = setInterval(() => setClock(new Date()), 10000);
        return () => clearInterval(id);
    }, []);

    // WebSocket
    useEffect(() => {
        if (!tenant?.slug) return;
        try {
            const channel = getEcho(tenant.slug).private(`tenant.${tenant.slug}`);
            channel.listen('.new-shift-note', () => silentReload());
            return () => { channel.stopListening('.new-shift-note'); };
        } catch { /* polling fallback */ }
    }, [tenant?.slug]);

    // Polling fallback
    useEffect(() => {
        if (!pollingEnabled) return;
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') silentReload();
        }, 5000);
        return () => clearInterval(id);
    }, [pollingEnabled]);

    const { data, setData, post, processing, reset, errors } = useForm<NewNoteFormData>({ content: '' });

    const today = getTodayString();
    const yesterday = getYesterdayString();
    const filterLabel = getFilterLabel(filterDate);
    const isFilterToday = filterDate === today;
    const isFilterYesterday = filterDate === yesterday;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('notes.store'), { onSuccess: () => reset() });
    }

    function startEdit(note: ShiftNote) {
        setEditingId(note.id);
        setEditContent(note.content);
        setEditNoteDate(note.note_date ? note.note_date.slice(0, 10) : today);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditContent('');
        setEditNoteDate('');
    }

    function saveEdit(noteId: number) {
        router.put(route('notes.update', noteId), { content: editContent, note_date: editNoteDate }, {
            onSuccess: () => cancelEdit(),
        });
    }

    function confirmDelete(noteId: number) {
        router.delete(route('notes.destroy', noteId), {
            onFinish: () => setDeletingId(null),
        });
    }

    return (
        <AppLayout title="Váltóüzenetek">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"/>
                    <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-cyan-700/10 rounded-full blur-3xl pointer-events-none"/>
                    <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
                         style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                    <div className="relative px-4 py-6 sm:px-8 sm:py-8 flex items-start justify-between gap-6 flex-wrap">
                        <div>
                            <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-1.5">Privát csatorna · Csak kollégák</p>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">Váltóüzenetek</h1>
                            <button
                                type="button"
                                onClick={togglePolling}
                                className={`mt-2.5 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${pollingEnabled ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pollingEnabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                {pollingEnabled ? 'Auto-frissítés: BE' : 'Auto-frissítés: KI'}
                            </button>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                                    </svg>
                                    {notes.total} bejegyzés összesen
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                    </svg>
                                    <span className="text-rose-400 font-semibold">PM nem látja</span>
                                </span>
                            </div>
                        </div>
                        <Link
                            href={route('home')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                            </svg>
                            Vissza
                        </Link>
                    </div>
                </div>

                {/* New note form */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </div>
                        <h2 className="font-bold text-slate-800">Bejegyzés rögzítése</h2>
                        <span className="ml-auto text-xs text-slate-400">{data.content.length} / 1000</span>
                    </div>
                    <form onSubmit={handleSubmit} className="p-5">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-700 mb-1.5">{user.name}</p>
                                <textarea
                                    name="content"
                                    rows={3}
                                    required
                                    maxLength={1000}
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                    placeholder="Mit szeretnél átadni a következő műszaknak?"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-teal-400 focus:bg-white focus:outline-none transition resize-none leading-relaxed"
                                />
                                {errors.content && <p className="text-xs text-rose-500 mt-1">{errors.content}</p>}
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 pl-12">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <span>{formatClock(clock)}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={processing || !data.content.trim()}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-sm font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                            >
                                {processing ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                                    </svg>
                                )}
                                Közzététel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Date filter */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-3.5 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                        <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
                        </svg>
                        <label htmlFor="date-filter" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dátum szűrő</label>
                    </div>
                    <input
                        type="date"
                        id="date-filter"
                        defaultValue={filterDate}
                        onChange={e => router.get(route('notes.index'), { date: e.target.value }, { preserveState: false })}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 focus:border-teal-400 focus:bg-white focus:outline-none transition cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('notes.index')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                isFilterToday
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-slate-100 text-slate-500 hover:bg-teal-50 hover:text-teal-700'
                            }`}
                        >
                            Ma
                        </Link>
                        <Link
                            href={route('notes.index', { date: yesterday })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                isFilterYesterday
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-slate-100 text-slate-500 hover:bg-teal-50 hover:text-teal-700'
                            }`}
                        >
                            Tegnap
                        </Link>
                    </div>
                    <span className="ml-auto text-xs text-slate-400">
                        <span className="font-semibold text-slate-600">{notes.total}</span> bejegyzés · {filterLabel}
                    </span>
                </div>

                {/* Notes feed */}
                {notes.data.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                            </svg>
                        </div>
                        <p className="text-base font-semibold text-slate-600">Nincs bejegyzés erre a napra</p>
                        <p className="text-sm text-slate-400 mt-1">{filterLabel} · {filterDate}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notes.data.map((note, i) => {
                            const isOwn = note.user_id === user.id;
                            const isEditing = editingId === note.id;
                            const isDeleting = deletingId === note.id;
                            const authorName = note.user?.name ?? 'Ismeretlen';
                            const authorIsAdmin = note.user?.is_admin === true;

                            return (
                                <div
                                    key={note.id}
                                    style={{ animationDelay: `${i * 45}ms` }}
                                    className={`group animate-page-enter bg-white border rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                                        isOwn ? 'border-teal-200' : 'border-slate-200'
                                    }`}
                                >
                                    {/* View mode */}
                                    {!isEditing && (
                                        <div className="px-5 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                                    isOwn ? 'bg-teal-600 text-white' : 'bg-slate-100 border border-slate-200 text-slate-600'
                                                }`}>
                                                    {authorName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                        <span className="text-sm font-semibold text-slate-800">{authorName}</span>
                                                        {isOwn && (
                                                            <span className="text-[10px] font-bold bg-teal-100 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Te</span>
                                                        )}
                                                        {authorIsAdmin && (
                                                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Admin</span>
                                                        )}
                                                        <span className="text-xs text-slate-400 ml-auto">{formatTime(note.created_at)}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{note.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Edit mode (own only) */}
                                    {isEditing && isOwn && (
                                        <div className="px-5 py-4">
                                            <textarea
                                                rows={4}
                                                required
                                                maxLength={1000}
                                                value={editContent}
                                                onChange={e => setEditContent(e.target.value)}
                                                className="w-full rounded-xl border border-teal-200 bg-teal-50/30 px-3.5 py-2.5 text-sm text-slate-700 focus:border-teal-400 focus:bg-white focus:outline-none transition resize-none leading-relaxed mb-3"
                                                autoFocus
                                            />
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dátum</label>
                                                    <input
                                                        type="date"
                                                        value={editNoteDate}
                                                        onChange={e => setEditNoteDate(e.target.value)}
                                                        required
                                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-teal-400 focus:outline-none transition"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={cancelEdit}
                                                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                                                    >
                                                        Mégse
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => saveEdit(note.id)}
                                                        disabled={!editContent.trim()}
                                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                                        </svg>
                                                        Mentés
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action bar - own note */}
                                    {isOwn && !isEditing && (
                                        <div className="px-5 py-2.5 border-t border-teal-100 bg-teal-50/40 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isDeleting ? (
                                                <>
                                                    <span className="text-xs text-slate-500 mr-1">Biztosan törlöd?</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingId(null)}
                                                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                                    >
                                                        Nem
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(note.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                        </svg>
                                                        Törlés
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(note)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                                        </svg>
                                                        Szerkesztés
                                                    </button>
                                                    <span className="text-slate-200">|</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingId(note.id)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                        </svg>
                                                        Törlés
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Action bar - admin delete others' notes */}
                                    {!isOwn && user.is_admin && !isEditing && (
                                        <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isDeleting ? (
                                                <>
                                                    <span className="text-xs text-slate-500 mr-2">Biztosan törlöd?</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingId(null)}
                                                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors mr-1"
                                                    >
                                                        Nem
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(note.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors"
                                                    >
                                                        Törlés
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setDeletingId(note.id)}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                    </svg>
                                                    Törlés (admin)
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {notes.last_page > 1 && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-400">
                            {notes.from}–{notes.to} / {notes.total} bejegyzés
                        </span>
                        <div className="flex items-center gap-1">
                            {notes.links.map((link, idx) => (
                                link.url ? (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'bg-teal-600 text-white'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
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

            </div>
        </AppLayout>
    );
}
