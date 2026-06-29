import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import FlashMessage from '../../../Components/FlashMessage';

interface Contact {
    id: number;
    category: string;
    name: string;
    phone: string | null;
    note: string | null;
    sort_order: number;
}

interface Props {
    contacts: Contact[];
}

function AddForm({ existingCategories }: { existingCategories: string[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        category: '',
        name: '',
        phone: '',
        note: '',
        sort_order: 0,
    });

    const [showCustomCat, setShowCustomCat] = useState(false);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('admin.emergency-contacts.store'), { onSuccess: () => reset() });
    }

    const catValue = showCustomCat ? data.category : data.category;

    return (
        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Új kapcsolat hozzáadása</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Kategória *</label>
                    {existingCategories.length > 0 && !showCustomCat ? (
                        <div className="flex gap-2">
                            <select
                                value={data.category}
                                onChange={e => {
                                    if (e.target.value === '__new__') { setShowCustomCat(true); setData('category', ''); }
                                    else setData('category', e.target.value);
                                }}
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                            >
                                <option value="">– válasszon –</option>
                                {existingCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                <option value="__new__">+ Új kategória...</option>
                            </select>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={data.category}
                                onChange={e => setData('category', e.target.value)}
                                placeholder="pl. Tűz, Orvosi, Technikai"
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                            />
                            {existingCategories.length > 0 && (
                                <button type="button" onClick={() => { setShowCustomCat(false); setData('category', ''); }}
                                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-1">↩</button>
                            )}
                        </div>
                    )}
                    {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </div>

                {/* Name */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Név *</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        placeholder="Teljes név"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Telefonszám</label>
                    <input
                        type="text"
                        value={data.phone}
                        onChange={e => setData('phone', e.target.value)}
                        placeholder="+36 30 123 4567"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                {/* Sort order */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Sorrend</label>
                    <input
                        type="number"
                        value={data.sort_order}
                        onChange={e => setData('sort_order', parseInt(e.target.value) || 0)}
                        min={0}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    />
                </div>

                {/* Note */}
                <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Megjegyzés</label>
                    <input
                        type="text"
                        value={data.note}
                        onChange={e => setData('note', e.target.value)}
                        placeholder="pl. csak munkanapokon, ügyeleti szám stb."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    />
                    {errors.note && <p className="text-xs text-red-500 mt-1">{errors.note}</p>}
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Hozzáadás
                </button>
            </div>
        </form>
    );
}

function EditRow({ contact, onCancel }: { contact: Contact; onCancel: () => void }) {
    const { data, setData, put, processing, errors } = useForm({
        category: contact.category,
        name: contact.name,
        phone: contact.phone ?? '',
        note: contact.note ?? '',
        sort_order: contact.sort_order,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('admin.emergency-contacts.update', contact.id), { onSuccess: onCancel });
    }

    return (
        <form onSubmit={submit} className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Kategória *</label>
                    <input type="text" value={data.category} onChange={e => setData('category', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"/>
                    {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Név *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"/>
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Telefonszám</label>
                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"/>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Sorrend</label>
                    <input type="number" value={data.sort_order} onChange={e => setData('sort_order', parseInt(e.target.value) || 0)} min={0}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"/>
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Megjegyzés</label>
                    <input type="text" value={data.note} onChange={e => setData('note', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"/>
                </div>
            </div>
            <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={onCancel}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50 transition-colors">
                    Mégse
                </button>
                <button type="submit" disabled={processing}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                    Mentés
                </button>
            </div>
        </form>
    );
}

export default function EmergencyContactsIndex({ contacts }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const categories = [...new Set(contacts.map(c => c.category))].sort();
    const existingCategories = [...new Set(contacts.map(c => c.category))].sort();

    function deleteContact(id: number) {
        router.delete(route('admin.emergency-contacts.destroy', id), { preserveScroll: true });
        setConfirmDelete(null);
    }

    const grouped = categories.map(cat => ({
        category: cat,
        contacts: contacts.filter(c => c.category === cat),
    }));

    return (
        <AdminLayout title="Értesítési lista">
            <div className="space-y-6">
                <FlashMessage />

                <AddForm existingCategories={existingCategories} />

                {contacts.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Még nincs kapcsolat felvéve</p>
                        <p className="text-xs text-slate-400">Adjon hozzá kapcsolatokat a fenti form segítségével.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {grouped.map(({ category, contacts: catContacts }) => (
                            <div key={category} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                    </svg>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{category}</span>
                                    <span className="text-xs text-slate-400">({catContacts.length})</span>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {catContacts.map(contact => (
                                        <div key={contact.id}>
                                            {editingId === contact.id ? (
                                                <div className="p-4">
                                                    <EditRow contact={contact} onCancel={() => setEditingId(null)} />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-800">{contact.name}</p>
                                                        {contact.phone && (
                                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{contact.phone}</p>
                                                        )}
                                                        {contact.note && (
                                                            <p className="text-xs text-slate-400 italic mt-0.5">{contact.note}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => setEditingId(contact.id)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                            title="Szerkesztés"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                                            </svg>
                                                        </button>
                                                        {confirmDelete === contact.id ? (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs text-red-500 font-semibold">Biztos?</span>
                                                                <button onClick={() => deleteContact(contact.id)}
                                                                    className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
                                                                    Igen
                                                                </button>
                                                                <button onClick={() => setConfirmDelete(null)}
                                                                    className="px-2 py-1 rounded-lg bg-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-300 transition-colors">
                                                                    Nem
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setConfirmDelete(contact.id)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                                title="Törlés"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
