@extends('layouts.app')
@section('title', 'Ellenőrzési előzmények')

@section('content')

{{-- Hero --}}
<div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
    <div class="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
         style="background-image: linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px); background-size: 32px 32px;"></div>
    <div class="relative px-8 sm:px-10 py-10 flex items-center justify-between gap-6">
        <div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">Előzmények</h1>
            <p class="text-slate-400 mt-2 text-sm">Korábbi ellenőrzések listája</p>
        </div>
        <a href="{{ route('history.export', request()->only('location_id')) }}"
           class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20
                  text-white text-sm font-semibold transition-all duration-200 shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            CSV export
        </a>
    </div>
</div>

{{-- Filter --}}
<form method="GET" class="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
        </svg>
        Szűrők
    </p>
    <div class="flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-48">
            <label class="block text-xs font-semibold text-slate-500 mb-1.5" for="location_id">Helyszín</label>
            <select name="location_id" id="location_id"
                    class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none transition">
                <option value="">Összes helyszín</option>
                @foreach($locations as $loc)
                    <option value="{{ $loc->id }}" {{ request('location_id') == $loc->id ? 'selected' : '' }}>{{ $loc->name }}</option>
                @endforeach
            </select>
        </div>
        <div class="flex-1 min-w-48">
            <label class="block text-xs font-semibold text-slate-500 mb-1.5" for="search">Ellenőrző neve</label>
            <input type="text" name="search" id="search"
                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none transition"
                   placeholder="Keresés..." value="{{ request('search') }}">
        </div>
        <div class="flex items-center gap-2">
            <button type="submit"
                    class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Szűrés
            </button>
            @if(request()->hasAny(['location_id', 'search']))
                <a href="{{ route('history.index') }}"
                   class="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-xl transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Törlés
                </a>
            @endif
        </div>
    </div>
</form>

{{-- Table --}}
<div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
    <table class="w-full text-sm min-w-[640px]">
        <thead>
            <tr class="border-b border-slate-100 bg-slate-50">
                <th class="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                <th class="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Helyszín</th>
                <th class="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ellenőrző</th>
                <th class="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Dátum</th>
                <th class="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Állapot</th>
                <th class="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Megjegyzés</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
            @forelse($checks as $check)
            <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="px-5 py-4 text-slate-300 font-mono text-xs">#{{ $check->id }}</td>
                <td class="px-5 py-4">
                    <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </div>
                        <span class="font-semibold text-slate-800">{{ $check->location->name ?? '–' }}</span>
                    </div>
                </td>
                <td class="px-5 py-4">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <span class="text-xs font-bold text-slate-500">{{ strtoupper(substr($check->checked_by, 0, 1)) }}</span>
                        </div>
                        <span class="text-slate-700">{{ $check->checked_by }}</span>
                    </div>
                </td>
                <td class="px-5 py-4 text-slate-500 whitespace-nowrap text-xs">{{ $check->created_at->format('Y.m.d H:i') }}</td>
                <td class="px-5 py-4">
                    @php $total = $check->check_items_count; $checked = $check->checked_count; $complete = $total > 0 && $checked === $total; @endphp
                    <div class="flex items-center gap-2">
                        @if($complete)
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                Teljes
                            </span>
                        @else
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                Hiányos
                            </span>
                        @endif
                        <span class="text-xs text-slate-400 font-medium">{{ $checked }}/{{ $total }}</span>
                    </div>
                </td>
                <td class="px-5 py-4">
                    @if($check->notes)
                        <span title="{{ $check->notes }}"
                              class="inline-flex items-center gap-1.5 text-xs text-slate-500 cursor-help max-w-[8rem] truncate">
                            <svg class="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
                            {{ Str::limit($check->notes, 30) }}
                        </span>
                    @else
                        <span class="text-slate-200">—</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="px-5 py-16 text-center">
                    <svg class="w-10 h-10 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p class="text-slate-400 text-sm">Nincsenek ellenőrzési bejegyzések.</p>
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
    </div>
</div>

@if($checks->hasPages())
    <div class="mt-5">{{ $checks->links() }}</div>
@endif
@endsection
