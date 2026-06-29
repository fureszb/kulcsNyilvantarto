import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

declare function route(name: string, params?: unknown): string;

interface Item {
    id: number;
    name: string;
    description?: string;
    type: 'key' | 'card';
    group_id?: number;
    location_id: number;
    group?: ItemGroup;
}

interface ItemGroup {
    id: number;
    name: string;
    location_id: number;
    items?: Item[];
}

interface Location {
    id: number;
    name: string;
    description?: string;
    responsible_person?: string;
    email?: string;
    icon?: string;
    logo_path?: string;
    is_active: boolean;
    items_count?: number;
    items?: Item[];
    groups?: ItemGroup[];
}

interface Props {
    location: Location;
}

interface GroupFormData {
    name: string;
    [key: string]: unknown;
}

interface ItemFormData {
    name: string;
    type: string;
    description: string;
    group_id: string;
    [key: string]: unknown;
}

function AddGroupForm({ locationId, onCancel }: { locationId: number; onCancel: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm<GroupFormData>({ name: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('admin.locations.groups.store', [locationId]), {
            onSuccess: () => { reset(); onCancel(); },
        });
    }

    return (
        <form onSubmit={submit} className="flex items-start gap-2 mt-3">
            <div className="flex-1">
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Csoport neve"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    autoFocus
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <button
                type="submit"
                disabled={processing}
                className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
                Mentés
            </button>
            <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
                Mégse
            </button>
        </form>
    );
}

function EditGroupForm({ locationId, group, onCancel }: { locationId: number; group: ItemGroup; onCancel: () => void }) {
    const { data, setData, put, processing, errors } = useForm<GroupFormData>({ name: group.name });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('admin.locations.groups.update', [locationId, group.id]), {
            onSuccess: () => onCancel(),
        });
    }

    return (
        <form onSubmit={submit} className="flex items-start gap-2">
            <div className="flex-1">
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    autoFocus
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <button
                type="submit"
                disabled={processing}
                className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
                Mentés
            </button>
            <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
                Mégse
            </button>
        </form>
    );
}

function AddItemForm({ locationId, groups, onCancel }: { locationId: number; groups: ItemGroup[]; onCancel: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm<ItemFormData>({
        name: '',
        type: 'key',
        description: '',
        group_id: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('admin.locations.items.store', [locationId]), {
            onSuccess: () => { reset(); onCancel(); },
        });
    }

    return (
        <form onSubmit={submit} className="flex items-start gap-2 mt-3 flex-wrap">
            <div className="flex-1 min-w-40">
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Elem neve"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    autoFocus
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div className="min-w-28">
                <select
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                >
                    <option value="key">Kulcs</option>
                    <option value="card">Kártya</option>
                </select>
                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
            </div>
            <div className="min-w-36">
                <select
                    value={data.group_id}
                    onChange={(e) => setData('group_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Nincs csoport</option>
                    {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                disabled={processing}
                className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
                Mentés
            </button>
            <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
                Mégse
            </button>
        </form>
    );
}

function EditItemForm({ locationId, item, groups, onCancel }: { locationId: number; item: Item; groups: ItemGroup[]; onCancel: () => void }) {
    const { data, setData, put, processing, errors } = useForm<ItemFormData>({
        name: item.name,
        type: item.type ?? 'key',
        description: item.description ?? '',
        group_id: item.group_id ? String(item.group_id) : '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('admin.locations.items.update', [locationId, item.id]), {
            onSuccess: () => onCancel(),
        });
    }

    return (
        <form onSubmit={submit} className="flex items-start gap-2 flex-wrap">
            <div className="flex-1 min-w-40">
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    autoFocus
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div className="min-w-28">
                <select
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                >
                    <option value="key">Kulcs</option>
                    <option value="card">Kártya</option>
                </select>
                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
            </div>
            <div className="min-w-36">
                <select
                    value={data.group_id}
                    onChange={(e) => setData('group_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Nincs csoport</option>
                    {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                disabled={processing}
                className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
                Mentés
            </button>
            <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
                Mégse
            </button>
        </form>
    );
}

export default function LocationShow({ location }: Props) {
    const groups = location.groups ?? [];
    const items = location.items ?? [];

    const [addingGroup, setAddingGroup] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
    const [addingItem, setAddingItem] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);

    function handleDeleteGroup(group: ItemGroup) {
        if (!window.confirm(`Biztosan törlöd "${group.name}" csoportot?`)) return;
        router.delete(route('admin.locations.groups.destroy', [location.id, group.id]));
    }

    function handleDeleteItem(item: Item) {
        if (!window.confirm(`Biztosan törlöd "${item.name}" elemet?`)) return;
        router.delete(route('admin.locations.items.destroy', [location.id, item.id]));
    }

    return (
        <AdminLayout
            title={location.name}
            headerActions={
                <Link
                    href={route('admin.locations.edit', location.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Szerkeszt
                </Link>
            }
        >
            <div className="space-y-6 max-w-3xl">
                {/* Details */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Adatok</h2>
                    <dl className="space-y-3">
                        <div className="flex gap-4">
                            <dt className="text-sm text-slate-500 w-36 shrink-0">Név</dt>
                            <dd className="text-sm font-medium text-slate-800 flex items-center gap-2">
                                {location.icon && <span>{location.icon}</span>}
                                {location.name}
                            </dd>
                        </div>
                        {location.responsible_person && (
                            <div className="flex gap-4">
                                <dt className="text-sm text-slate-500 w-36 shrink-0">Felelős</dt>
                                <dd className="text-sm text-slate-800">{location.responsible_person}</dd>
                            </div>
                        )}
                        {location.email && (
                            <div className="flex gap-4">
                                <dt className="text-sm text-slate-500 w-36 shrink-0">Email</dt>
                                <dd className="text-sm text-slate-800">{location.email}</dd>
                            </div>
                        )}
                        {location.description && (
                            <div className="flex gap-4">
                                <dt className="text-sm text-slate-500 w-36 shrink-0">Leírás</dt>
                                <dd className="text-sm text-slate-800">{location.description}</dd>
                            </div>
                        )}
                        <div className="flex gap-4">
                            <dt className="text-sm text-slate-500 w-36 shrink-0">Státusz</dt>
                            <dd>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${location.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {location.is_active ? 'Aktív' : 'Inaktív'}
                                </span>
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Groups */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Csoportok</h2>
                        {!addingGroup && (
                            <button
                                onClick={() => setAddingGroup(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                                </svg>
                                Új csoport
                            </button>
                        )}
                    </div>

                    {groups.length === 0 && !addingGroup && (
                        <p className="text-sm text-slate-400">Nincsenek csoportok.</p>
                    )}

                    <div className="divide-y divide-slate-50">
                        {groups.map((group) => (
                            <div key={group.id} className="py-3 first:pt-0">
                                {editingGroupId === group.id ? (
                                    <EditGroupForm
                                        locationId={location.id}
                                        group={group}
                                        onCancel={() => setEditingGroupId(null)}
                                    />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <span className="flex-1 text-sm font-medium text-slate-800">{group.name}</span>
                                        <span className="text-xs text-slate-400">{group.items?.length ?? 0} elem</span>
                                        <button
                                            onClick={() => setEditingGroupId(group.id)}
                                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors"
                                        >
                                            Szerkeszt
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGroup(group)}
                                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
                                        >
                                            Töröl
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {addingGroup && (
                        <AddGroupForm
                            locationId={location.id}
                            onCancel={() => setAddingGroup(false)}
                        />
                    )}
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Elemek</h2>
                        {!addingItem && (
                            <button
                                onClick={() => setAddingItem(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                                </svg>
                                Új elem
                            </button>
                        )}
                    </div>

                    {items.length === 0 && !addingItem && (
                        <p className="text-sm text-slate-400">Nincsenek elemek.</p>
                    )}

                    <div className="divide-y divide-slate-50">
                        {items.map((item) => (
                            <div key={item.id} className="py-3 first:pt-0">
                                {editingItemId === item.id ? (
                                    <EditItemForm
                                        locationId={location.id}
                                        item={item}
                                        groups={groups}
                                        onCancel={() => setEditingItemId(null)}
                                    />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <span className="flex-1 text-sm font-medium text-slate-800">{item.name}</span>
                                        {item.group && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{item.group.name}</span>
                                        )}
                                        <button
                                            onClick={() => setEditingItemId(item.id)}
                                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors"
                                        >
                                            Szerkeszt
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item)}
                                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
                                        >
                                            Töröl
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {addingItem && (
                        <AddItemForm
                            locationId={location.id}
                            groups={groups}
                            onCancel={() => setAddingItem(false)}
                        />
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
