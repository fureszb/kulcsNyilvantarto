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
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Megvolt</th>
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
                <td class="px-5 py-3.5 text-slate-500">{{ $check->created_at->format('Y.m.d H:i') }}</td>
                <td class="px-5 py-3.5">
                    @php $total = $check->check_items_count; $checked = $check->checked_count; @endphp
                    <div class="flex items-center gap-2">
                        <div class="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div class="h-full rounded-full {{ $checked === $total ? 'bg-green-500' : 'bg-blue-500' }}"
                                 style="width: {{ $total > 0 ? round(($checked / $total) * 100) : 0 }}%"></div>
                        </div>
                        <span class="text-xs font-semibold {{ $checked === $total ? 'text-green-700' : 'text-slate-600' }}">
                            {{ $checked }}/{{ $total }}
                        </span>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="5" class="px-5 py-12 text-center text-slate-400">
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
