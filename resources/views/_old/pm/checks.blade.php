@extends('layouts.pm')
@section('title', 'Kulcsellenőrzések')

@section('content')
<div class="max-w-6xl mx-auto">

    {{-- ─── HERO ──────────────────────────────────────────────────────────────── --}}
    <div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div class="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
             style="background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:32px 32px;"></div>
        <div class="relative px-8 py-8 flex items-center justify-between gap-6">
            <div>
                <p class="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Property Manager · Kulcsnyilvántartó</p>
                <h1 class="text-3xl font-extrabold text-white tracking-tight">Kulcsellenőrzések</h1>
                <p class="text-slate-400 mt-1 text-sm">Összes leadott kulcs &amp; kártya ellenőrzés – {{ $checks->total() }} db</p>
            </div>
            <div class="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                <svg class="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>
        </div>
    </div>

    {{-- ─── SZŰRŐK ─────────────────────────────────────────────────────────────── --}}
    @php $hasFilter = request()->hasAny(['location_id','user_id','date_from','date_to']); @endphp
    <form method="GET" action="{{ route('pm.checks') }}" class="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-5 mb-6">
        <div class="flex flex-wrap items-end gap-4">
            <div class="flex-1 min-w-[160px]">
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Helyszín</label>
                <select name="location_id"
                        class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none transition">
                    <option value="">— Összes —</option>
                    @foreach($locations as $loc)
                    <option value="{{ $loc->id }}" {{ request('location_id') == $loc->id ? 'selected' : '' }}>{{ $loc->name }}</option>
                    @endforeach
                </select>
            </div>
            <div class="flex-1 min-w-[160px]">
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ellenőrző</label>
                <select name="user_id"
                        class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none transition">
                    <option value="">— Mindenki —</option>
                    @foreach($users as $u)
                    <option value="{{ $u->id }}" {{ request('user_id') == $u->id ? 'selected' : '' }}>{{ $u->name }}</option>
                    @endforeach
                </select>
            </div>
            <div class="flex-1 min-w-[140px]">
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dátumtól</label>
                <input type="date" name="date_from" value="{{ request('date_from') }}"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none transition">
            </div>
            <div class="flex-1 min-w-[140px]">
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dátumig</label>
                <input type="date" name="date_to" value="{{ request('date_to') }}"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none transition">
            </div>
            <div class="flex items-center gap-2 pb-0.5">
                <button type="submit"
                        class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/></svg>
                    Szűrés
                </button>
                @if($hasFilter)
                <a href="{{ route('pm.checks') }}"
                   class="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    Törlés
                </a>
                @endif
            </div>
        </div>
    </form>

    {{-- ─── LISTA ──────────────────────────────────────────────────────────────── --}}
    @if($checks->isEmpty())
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-16 text-center">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
        </div>
        <p class="text-base font-semibold text-slate-600">Nincs találat</p>
        <p class="text-sm text-slate-400 mt-1">A szűrési feltételeknek megfelelő ellenőrzés nem található.</p>
    </div>
    @else

    {{-- Táblázat --}}
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table class="w-full text-sm">
            <thead>
                <tr class="border-b border-slate-100 bg-slate-50/60">
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dátum &amp; Idő</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Helyszín</th>
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ellenőrizte</th>
                    <th class="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Eredmény</th>
                    <th class="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                @foreach($checks as $check)
                @php
                    $total   = $check->checkItems->count();
                    $checked = $check->checkItems->where('is_checked', true)->count();
                    $pct     = $total > 0 ? round($checked / $total * 100) : 0;
                    $allOk   = $pct === 100;
                    $noneOk  = $pct === 0 && $total > 0;
                    $loc     = $locationMap->get($check->location_id);
                @endphp
                <tr class="hover:bg-slate-50/60 transition-colors">
                    {{-- Dátum --}}
                    <td class="px-5 py-3.5 whitespace-nowrap">
                        <p class="font-semibold text-slate-800">{{ $check->created_at->locale('hu')->translatedFormat('Y. M j.') }}</p>
                        <p class="text-xs text-slate-400 mt-0.5">{{ $check->created_at->format('H:i') }}</p>
                    </td>
                    {{-- Helyszín --}}
                    <td class="px-5 py-3.5">
                        @if($loc)
                        <div class="flex items-center gap-2.5">
                            <div class="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                                @if($loc->logo_path)
                                    <img src="{{ Storage::url($loc->logo_path) }}" class="w-full h-full object-contain p-0.5">
                                @elseif($loc->icon)
                                    <span class="text-sm leading-none">{{ $loc->icon }}</span>
                                @else
                                    <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                @endif
                            </div>
                            <span class="font-medium text-slate-700 truncate max-w-[160px]">{{ $loc->name }}</span>
                        </div>
                        @else
                        <span class="text-slate-400 italic text-xs">Törölt helyszín</span>
                        @endif
                    </td>
                    {{-- Ellenőrizte --}}
                    <td class="px-5 py-3.5">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                                <span class="text-[10px] font-bold text-amber-600">{{ mb_substr($check->checked_by, 0, 1) }}</span>
                            </div>
                            <span class="text-slate-700 text-sm truncate max-w-[140px]">{{ $check->checked_by }}</span>
                        </div>
                    </td>
                    {{-- Eredmény --}}
                    <td class="px-5 py-3.5">
                        <div class="flex flex-col items-center gap-1">
                            <div class="flex items-center gap-1.5">
                                <span class="text-xs font-bold {{ $allOk ? 'text-emerald-600' : ($noneOk ? 'text-slate-400' : 'text-amber-600') }}">
                                    {{ $checked }}/{{ $total }}
                                </span>
                                @if($allOk)
                                <span class="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">100%</span>
                                @elseif($noneOk)
                                <span class="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">0%</span>
                                @else
                                <span class="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{{ $pct }}%</span>
                                @endif
                            </div>
                            <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div class="h-full rounded-full {{ $allOk ? 'bg-emerald-500' : ($noneOk ? 'bg-slate-200' : 'bg-amber-400') }}"
                                     style="width:{{ $pct }}%"></div>
                            </div>
                        </div>
                    </td>
                    {{-- Akció --}}
                    <td class="px-5 py-3.5 text-right">
                        <a href="{{ route('checks.show', $check) }}"
                           class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 text-slate-500 hover:text-blue-700 text-xs font-semibold transition-colors whitespace-nowrap">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            Megtekintés
                        </a>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    {{-- Pagináció --}}
    @if($checks->hasPages())
    <div class="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between gap-4">
        <span class="text-sm text-slate-400">{{ $checks->firstItem() }}–{{ $checks->lastItem() }} / {{ $checks->total() }}</span>
        {{ $checks->links() }}
    </div>
    @endif

    @endif

</div>
@endsection
