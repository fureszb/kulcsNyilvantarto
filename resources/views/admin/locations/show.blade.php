@extends('layouts.admin')
@section('title', $location->name . ' – Tételek')
@section('header-actions')
    <a href="{{ route('admin.locations.edit', $location) }}" class="btn-secondary text-sm">Helyszín szerkesztése</a>
@endsection

@section('content')
<div x-data="{ addForm: false, addGroupForm: false, editId: null, editGroupId: null }">
    <div class="flex items-center gap-2 mb-5">
        <a href="{{ route('admin.locations.index') }}" class="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Helyszínek
        </a>
        <svg class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <span class="text-sm text-slate-700">{{ $location->name }}</span>
    </div>

    {{-- ── Csoportok kezelése ─────────────────────────────────────────────────── --}}
    <div class="card mb-5">
        <button @click="addGroupForm = !addGroupForm" type="button"
                class="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <span class="flex items-center gap-2">
                <svg class="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                Új csoport hozzáadása
            </span>
            <svg class="w-4 h-4 text-slate-400 transition-transform" :class="addGroupForm ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div x-show="addGroupForm" x-cloak class="border-t border-slate-100 px-5 py-4">
            <form method="POST" action="{{ route('admin.locations.groups.store', $location) }}" class="flex flex-wrap gap-3 items-end">
                @csrf
                <div class="flex-1 min-w-48">
                    <label class="form-label" for="new_group_name">Csoport neve <span class="text-red-500">*</span></label>
                    <input type="text" id="new_group_name" name="name" class="form-input" placeholder="pl. Albemarle" required>
                </div>
                <div class="w-24">
                    <label class="form-label" for="new_group_sort">Sorrend</label>
                    <input type="number" id="new_group_sort" name="sort_order" class="form-input" value="0" min="0">
                </div>
                <button type="submit" class="btn-primary">Hozzáadás</button>
            </form>
        </div>

        @if($groups->isNotEmpty())
        <div class="border-t border-slate-100">
            <div class="px-5 py-3 bg-slate-50 border-b border-slate-100">
                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meglévő csoportok ({{ $groups->count() }})</span>
            </div>
            @foreach($groups as $group)
            <div class="border-b border-slate-100 last:border-0" x-show="editGroupId !== {{ $group->id }}">
                <div class="flex items-center gap-3 px-5 py-3">
                    <span class="w-2 h-2 rounded-full bg-violet-400 shrink-0"></span>
                    <span class="font-medium text-slate-700 flex-1">{{ $group->name }}</span>
                    <span class="text-xs text-slate-400">{{ $group->allItems->count() }} tétel</span>
                    <span class="text-xs text-slate-400">sorrend: {{ $group->sort_order }}</span>
                    <button @click="editGroupId = {{ $group->id }}" type="button" class="text-xs text-blue-700 hover:underline font-medium">Szerk.</button>
                    <form method="POST" action="{{ route('admin.locations.groups.destroy', [$location, $group]) }}"
                          onsubmit="return confirm('A csoport törlésével a tételek csoporton kívülre kerülnek. Folytatod?')">
                        @csrf @method('DELETE')
                        <button type="submit" class="text-xs text-red-500 hover:underline font-medium">Törlés</button>
                    </form>
                </div>
            </div>
            <div x-show="editGroupId === {{ $group->id }}" x-cloak class="border-b border-slate-100 last:border-0 bg-violet-50 px-5 py-3">
                <form method="POST" action="{{ route('admin.locations.groups.update', [$location, $group]) }}" class="flex flex-wrap gap-3 items-end">
                    @csrf @method('PUT')
                    <div class="flex-1 min-w-40">
                        <input type="text" name="name" class="form-input text-sm" value="{{ $group->name }}" required>
                    </div>
                    <div class="w-20">
                        <input type="number" name="sort_order" class="form-input text-sm" value="{{ $group->sort_order }}" min="0">
                    </div>
                    <button type="submit" class="btn-primary text-sm py-2">Mentés</button>
                    <button @click="editGroupId = null" type="button" class="btn-secondary text-sm py-2">Mégse</button>
                </form>
            </div>
            @endforeach
        </div>
        @endif
    </div>

    {{-- ── Új tétel hozzáadása ────────────────────────────────────────────────── --}}
    <div class="card mb-5">
        <button @click="addForm = !addForm" type="button"
                class="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <span class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Új tétel hozzáadása
            </span>
            <svg class="w-4 h-4 text-slate-400 transition-transform" :class="addForm ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div x-show="addForm" x-cloak class="border-t border-slate-100 px-5 py-4">
            <form method="POST" action="{{ route('admin.locations.items.store', $location) }}" class="flex flex-wrap gap-3 items-end">
                @csrf
                <div class="flex-1 min-w-48">
                    <label class="form-label" for="new_name">Megnevezés <span class="text-red-500">*</span></label>
                    <input type="text" id="new_name" name="name" class="form-input" placeholder="pl. Főbejárat kulcs" required>
                </div>
                <div>
                    <label class="form-label" for="new_type">Típus</label>
                    <select id="new_type" name="type" class="form-input">
                        <option value="key">🔑 Kulcs</option>
                        <option value="card">💳 Kártya</option>
                    </select>
                </div>
                @if($groups->isNotEmpty())
                <div class="min-w-36">
                    <label class="form-label" for="new_group">Csoport</label>
                    <select id="new_group" name="group_id" class="form-input">
                        <option value="">– Csoporton kívül –</option>
                        @foreach($groups as $group)
                            <option value="{{ $group->id }}">{{ $group->name }}</option>
                        @endforeach
                    </select>
                </div>
                @endif
                <div class="w-24">
                    <label class="form-label" for="new_sort">Sorrend</label>
                    <input type="number" id="new_sort" name="sort_order" class="form-input" value="0" min="0">
                </div>
                <button type="submit" class="btn-primary">Hozzáadás</button>
            </form>
        </div>
    </div>

    {{-- ── Tételek listája ─────────────────────────────────────────────────────── --}}
    <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="font-bold text-slate-700">Tételek</h2>
            <span class="text-xs text-slate-400">{{ $items->count() }} db</span>
        </div>
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                    <th class="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Megnevezés</th>
                    <th class="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Típus</th>
                    <th class="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Csoport</th>
                    <th class="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sorrend</th>
                    <th class="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Státusz</th>
                    <th class="px-5 py-2.5"></th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse($items as $item)
                <tr class="hover:bg-slate-50 transition-colors" x-show="editId !== {{ $item->id }}">
                    <td class="px-5 py-3 font-medium text-slate-800">{{ $item->name }}</td>
                    <td class="px-5 py-3 text-slate-500">{{ $item->type === 'card' ? '💳 Kártya' : '🔑 Kulcs' }}</td>
                    <td class="px-5 py-3">
                        @if($item->group_id)
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
                                <span class="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                                {{ $item->group?->name ?? '–' }}
                            </span>
                        @else
                            <span class="text-slate-300 text-xs">–</span>
                        @endif
                    </td>
                    <td class="px-5 py-3 text-slate-400 text-xs">{{ $item->sort_order }}</td>
                    <td class="px-5 py-3">
                        @if($item->is_active)
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">Aktív</span>
                        @else
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Inaktív</span>
                        @endif
                    </td>
                    <td class="px-5 py-3">
                        <div class="flex items-center gap-3 justify-end">
                            <button @click="editId = {{ $item->id }}" type="button" class="text-xs text-blue-700 hover:underline font-medium">Szerk.</button>
                            <form method="POST" action="{{ route('admin.locations.items.destroy', [$location, $item]) }}" onsubmit="return confirm('Törlés?')">
                                @csrf @method('DELETE')
                                <button type="submit" class="text-xs text-red-500 hover:underline font-medium">Törlés</button>
                            </form>
                        </div>
                    </td>
                </tr>
                {{-- Inline edit row --}}
                <tr x-show="editId === {{ $item->id }}" x-cloak class="bg-blue-50">
                    <td colspan="6" class="px-5 py-3">
                        <form method="POST" action="{{ route('admin.locations.items.update', [$location, $item]) }}" class="flex flex-wrap gap-3 items-end">
                            @csrf @method('PUT')
                            <div class="flex-1 min-w-40">
                                <input type="text" name="name" class="form-input text-sm" value="{{ $item->name }}" required>
                            </div>
                            <div>
                                <select name="type" class="form-input text-sm">
                                    <option value="key" {{ $item->type === 'key' ? 'selected' : '' }}>🔑 Kulcs</option>
                                    <option value="card" {{ $item->type === 'card' ? 'selected' : '' }}>💳 Kártya</option>
                                </select>
                            </div>
                            @if($groups->isNotEmpty())
                            <div class="min-w-36">
                                <select name="group_id" class="form-input text-sm">
                                    <option value="">– Csoporton kívül –</option>
                                    @foreach($groups as $group)
                                        <option value="{{ $group->id }}" {{ $item->group_id == $group->id ? 'selected' : '' }}>{{ $group->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                            @endif
                            <div class="w-20">
                                <input type="number" name="sort_order" class="form-input text-sm" value="{{ $item->sort_order }}" min="0">
                            </div>
                            <div class="flex items-center gap-2">
                                <input type="checkbox" name="is_active" value="1" id="active_{{ $item->id }}"
                                       class="w-4 h-4 rounded text-blue-600"
                                       {{ $item->is_active ? 'checked' : '' }}>
                                <label for="active_{{ $item->id }}" class="text-xs font-medium text-slate-600">Aktív</label>
                            </div>
                            <button type="submit" class="btn-primary text-sm py-2">Mentés</button>
                            <button @click="editId = null" type="button" class="btn-secondary text-sm py-2">Mégse</button>
                        </form>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="px-5 py-10 text-center text-slate-400 text-sm">
                        Még nincs tétel. Adj hozzá egyet fent!
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
