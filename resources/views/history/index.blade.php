@extends('layouts.app')
@section('title', 'Ellenőrzési előzmények')

@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Előzmények</h1>
        <p class="text-slate-500 text-sm mt-0.5">Korábbi ellenőrzések listája</p>
    </div>
    <a href="{{ route('history.export', request()->only('location_id')) }}"
       class="btn-secondary text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        CSV export
    </a>
</div>

{{-- Filter --}}
<form method="GET" class="card p-4 mb-6 flex flex-wrap gap-3 items-end">
    <div class="flex-1 min-w-48">
        <label class="form-label" for="location_id">Helyszín szűrő</label>
        <select name="location_id" id="location_id" class="form-input">
            <option value="">Összes helyszín</option>
            @foreach($locations as $loc)
                <option value="{{ $loc->id }}" {{ request('location_id') == $loc->id ? 'selected' : '' }}>{{ $loc->name }}</option>
            @endforeach
        </select>
    </div>
    <div class="flex-1 min-w-48">
        <label class="form-label" for="search">Ellenőrző neve</label>
        <input type="text" name="search" id="search" class="form-input" placeholder="Keresés..." value="{{ request('search') }}">
    </div>
    <button type="submit" class="btn-primary">Szűrés</button>
    @if(request()->hasAny(['location_id', 'search']))
        <a href="{{ route('history.index') }}" class="btn-secondary">Törlés</a>
    @endif
</form>

{{-- Table --}}
<div class="card overflow-x-auto">
    <table class="w-full text-sm">
        <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Helyszín</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ellenőrző</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dátum</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Állapot</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Megjegyzés</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse($checks as $check)
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-5 py-3.5 text-slate-400 font-mono text-xs">#{{ $check->id }}</td>
                <td class="px-5 py-3.5">
                    <span class="font-semibold text-slate-800">{{ $check->location->name ?? '–' }}</span>
                </td>
                <td class="px-5 py-3.5 text-slate-700">{{ $check->checked_by }}</td>
                <td class="px-5 py-3.5 text-slate-500 whitespace-nowrap">{{ $check->created_at->format('Y.m.d H:i') }}</td>
                <td class="px-5 py-3.5">
                    @php $total = $check->check_items_count; $checked = $check->checked_count; $complete = $total > 0 && $checked === $total; @endphp
                    <div class="flex items-center gap-2.5">
                        @if($complete)
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                Teljes
                            </span>
                        @else
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                Hiányos
                            </span>
                        @endif
                        <span class="text-xs text-slate-400">{{ $checked }}/{{ $total }}</span>
                    </div>
                </td>
                <td class="px-5 py-3.5">
                    @if($check->notes)
                        <span title="{{ $check->notes }}" class="inline-flex items-center gap-1 text-xs text-slate-500 cursor-help border-b border-dashed border-slate-300 max-w-32 truncate">
                            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
                            {{ Str::limit($check->notes, 30) }}
                        </span>
                    @else
                        <span class="text-slate-300">—</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="px-5 py-12 text-center text-slate-400">
                    Nincsenek ellenőrzési bejegyzések.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

@if($checks->hasPages())
    <div class="mt-5">{{ $checks->links() }}</div>
@endif
@endsection
