@extends(auth('tenant')->user()->isPropertyManager() ? 'layouts.pm' : 'layouts.app')
@section('title', 'Napi Jelentés – ' . $report->report_date->format('Y. m. d.'))

@section('content')
<div class="max-w-7xl mx-auto">

    {{-- ─── HERO ──────────────────────────────────────────────────────────────── --}}
    <div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div class="absolute -top-16 -right-16 w-56 h-56 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -left-12 w-40 h-40 bg-rose-800/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
             style="background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:32px 32px;"></div>
        <div class="relative px-4 py-6 sm:px-8 sm:py-8 flex items-start justify-between gap-6 flex-wrap">
            <div>
                <p class="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Biztonsági Szolgálat</p>
                <h1 class="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">Napi Jelentés</h1>
                <div class="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-400">
                    <span class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        {{ $report->report_date->locale('hu')->translatedFormat('Y. F j., l') }}
                    </span>
                    <span class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        Készítette: <strong class="text-slate-300 ml-0.5">{{ $report->prepared_by }}</strong>
                    </span>
                </div>
            </div>
            <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
                <a href="{{ auth('tenant')->user()->isPropertyManager() ? route('pm.security') : route('security.index') }}"
                   class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    Vissza
                </a>
                @if($isCreator)
                <a href="{{ route('security.edit', $report) }}"
                   class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-sm font-medium transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Szerkesztés
                </a>
                @endif
                <button onclick="window.print()"
                        class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 012-2h6a2 2 0 012 2v2"/>
                    </svg>
                    Nyomtatás
                </button>
            </div>
        </div>
    </div>

    {{-- ─── SZEKCIÓK ────────────────────────────────────────────────────────────── --}}
    <div class="space-y-5" id="print-area">

        {{-- Átadás-átvétel banner --}}
        @if($report->taken_over_from || $report->handover_time || !empty($report->previous_shift_members))
        <div class="bg-white border border-rose-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-rose-100 flex items-center gap-2.5 bg-rose-50/40">
                <div class="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                </div>
                <h3 class="font-bold text-slate-800">Átadás-átvétel</h3>
            </div>
            <div class="px-4 py-4 sm:px-6 sm:py-5 flex flex-wrap items-center gap-6">
                @if($report->taken_over_from)
                <div class="flex items-center gap-3">
                    <div class="flex flex-col items-center">
                        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Átadó</span>
                        <span class="px-3 py-1.5 rounded-lg bg-slate-100 text-sm font-bold text-slate-700">{{ $report->taken_over_from }}</span>
                    </div>
                    <svg class="w-5 h-5 text-rose-400 shrink-0 mt-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    <div class="flex flex-col items-center">
                        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Átvevő</span>
                        <span class="px-3 py-1.5 rounded-lg bg-rose-100 text-sm font-bold text-rose-700">{{ $report->prepared_by }}</span>
                    </div>
                </div>
                @endif
                @if($report->handover_time)
                <div class="flex flex-col items-center">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Időpont</span>
                    <span class="px-3 py-1.5 rounded-lg bg-slate-100 font-mono text-sm font-bold text-slate-700">{{ $report->handover_time }}</span>
                </div>
                @endif
            </div>
            {{-- Tegnapi csapat --}}
            @if(!empty($report->previous_shift_members))
            <div class="border-t border-rose-100 overflow-x-auto">
                <div class="px-6 py-3 bg-rose-50/30">
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tegnapi csapat (átadók)</p>
                </div>
                <table class="w-full text-sm">
                    <thead><tr class="bg-slate-50 border-b border-slate-100">
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Beosztás</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Név</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Munkaidő</th>
                    </tr></thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($report->previous_shift_members as $row)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="px-5 py-3.5 text-slate-500 text-sm">{{ $row['beosztás'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 font-semibold text-slate-800">{{ $row['nev'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 font-mono text-slate-400 text-xs">{{ ($row['idő_tól'] ?? '') }} – {{ ($row['idő_ig'] ?? '') }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @endif
        </div>
        @endif

        {{-- Napi Szolgálat tagjai --}}
        @if(!empty($report->service_members))
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <h3 class="font-bold text-slate-800">Napi Szolgálat tagjai</h3>
                <span class="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{{ count($report->service_members) }} fő</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead><tr class="bg-slate-50 border-b border-slate-100">
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Beosztás</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Név</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Munkaidő</th>
                    </tr></thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($report->service_members as $row)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="px-5 py-3.5 text-slate-500 text-sm">{{ $row['beosztás'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 font-semibold text-slate-800">{{ $row['nev'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 font-mono text-slate-400 text-xs">{{ ($row['idő_tól'] ?? '') }} – {{ ($row['idő_ig'] ?? '') }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
        @endif

        {{-- Eszközök --}}
        @if(!empty($report->equipment))
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
                </div>
                <h3 class="font-bold text-slate-800">Eszközök átadása / átvétele</h3>
                <span class="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{{ count($report->equipment) }} tétel</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead><tr class="bg-slate-50 border-b border-slate-100">
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Megnevezés</th>
                        <th class="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Darabszám</th>
                    </tr></thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($report->equipment as $row)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="px-5 py-3.5 text-slate-700">{{ $row['megnevezés'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 text-center">
                                <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">{{ $row['darabszám'] ?? '–' }}</span>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
        @endif

        {{-- Ellenőrzést végző személyek --}}
        @if(!empty($report->inspectors))
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <h3 class="font-bold text-slate-800">Ellenőrzést végző személyek</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead><tr class="bg-slate-50 border-b border-slate-100">
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Neve</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Időtartam</th>
                    </tr></thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($report->inspectors as $row)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="px-5 py-3.5 font-semibold text-slate-800">{{ $row['neve'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 font-mono text-slate-400 text-xs">{{ ($row['idő_tól'] ?? '') }} – {{ ($row['idő_ig'] ?? '') }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
        @endif

        {{-- Járőrözés --}}
        @if(!empty($report->patrols))
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <h3 class="font-bold text-slate-800">Járőrözés és zártság ellenőrzése</h3>
                <span class="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{{ count($report->patrols) }} kör</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead><tr class="bg-slate-50 border-b border-slate-100">
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vagyonőr</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Időpont</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Megjegyzés</th>
                    </tr></thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($report->patrols as $row)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="px-5 py-3.5 font-semibold text-slate-800">{{ $row['vagyonőr'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 font-mono text-slate-400 text-xs">{{ $row['időpont'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 text-slate-500">{{ $row['megjegyzés'] ?? '–' }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
        @endif

        {{-- Rendkívüli események --}}
        @if(!empty($report->incidents))
        <div class="bg-white border border-rose-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-rose-100 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <h3 class="font-bold text-rose-700">Rendkívüli események</h3>
                <span class="ml-auto text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">{{ count($report->incidents) }} esemény</span>
            </div>
            <div class="divide-y divide-rose-50">
                @foreach($report->incidents as $row)
                <div class="px-6 py-4 flex gap-4 items-start hover:bg-rose-50/40 transition-colors">
                    <span class="font-mono text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-lg shrink-0 mt-0.5">{{ $row['időpont'] ?? '–' }}</span>
                    <p class="text-slate-700 text-sm leading-relaxed">{{ $row['leírás'] ?? '–' }}</p>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        {{-- Eseménynaptár --}}
        @if(!empty($report->events))
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <h3 class="font-bold text-slate-800">Eseménynaptár</h3>
                <span class="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{{ count($report->events) }} tétel</span>
            </div>
            <div class="divide-y divide-slate-50">
                @foreach($report->events as $row)
                <div class="px-6 py-4 flex gap-4 items-start hover:bg-slate-50/80 transition-colors">
                    <span class="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg shrink-0 whitespace-nowrap mt-0.5">{{ ($row['idő_tól'] ?? '') }} – {{ ($row['idő_ig'] ?? '') }}</span>
                    <p class="text-slate-700 text-sm leading-relaxed">{{ $row['leírás'] ?? '–' }}</p>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        {{-- Tűzjelzések --}}
        @if(!empty($report->fire_alarms))
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/></svg>
                </div>
                <h3 class="font-bold text-slate-800">Tűzjelző rendszer jelzések</h3>
                <span class="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{{ count($report->fire_alarms) }} jelzés</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead><tr class="bg-slate-50 border-b border-slate-100">
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Megnevezés</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Készpont</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">Időpont</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ellenőrző</th>
                    </tr></thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($report->fire_alarms as $row)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="px-5 py-3.5 text-slate-700">{{ $row['megnevezés'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 text-slate-500">{{ $row['készpont'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 font-mono text-slate-400 text-xs">{{ $row['időpont'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 font-semibold text-slate-800">{{ $row['ellenőrző'] ?? '–' }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
        @endif

        {{-- Liftek --}}
        @if(!empty($report->elevators))
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
                </div>
                <h3 class="font-bold text-slate-800">Liftek ellenőrzése</h3>
                <span class="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{{ count($report->elevators) }} lift</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead><tr class="bg-slate-50 border-b border-slate-100">
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Megnevezés</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Időpont</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ellenőrző</th>
                    </tr></thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($report->elevators as $row)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="px-5 py-3.5 text-slate-700">{{ $row['megnevezés'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 font-mono text-slate-400 text-xs">{{ $row['időpont'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 font-semibold text-slate-800">{{ $row['ellenőrző'] ?? '–' }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
        @endif

        {{-- Karbantartások --}}
        @if(!empty($report->maintenance))
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <h3 class="font-bold text-slate-800">Karbantartások / munkavégzések</h3>
                <span class="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{{ count($report->maintenance) }} tétel</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead><tr class="bg-slate-50 border-b border-slate-100">
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cég / kivitelező</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Helyszín / munka</th>
                        <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Időtartam</th>
                    </tr></thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($report->maintenance as $row)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="px-5 py-3.5 font-semibold text-slate-800">{{ $row['cég'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 text-slate-500">{{ $row['helyszín'] ?? '–' }}</td>
                            <td class="px-5 py-3.5 font-mono text-slate-400 text-xs">{{ ($row['idő_tól'] ?? '') }} – {{ ($row['idő_ig'] ?? '') }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
        @endif

        {{-- Aláírás --}}
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-5">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </div>
                    <span class="text-sm text-slate-500">A jelentést készítette:</span>
                </div>
                <span class="font-bold text-slate-800">{{ $report->prepared_by }}</span>
            </div>
        </div>

        {{-- Megosztás kezelése --}}
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" x-data="{ open: {{ $isCreator ? 'false' : 'false' }} }">
            <div class="px-6 py-5 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-slate-700">Megosztva</p>
                        <p class="text-xs text-slate-400">
                            @if($sharedUsers->isNotEmpty())
                                {{ $sharedUsers->pluck('name')->join(', ') }}
                            @else
                                Nincs megosztva senkivel
                            @endif
                        </p>
                    </div>
                </div>
                @if($isCreator)
                <button @click="open = !open"
                        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-violet-50 hover:border-violet-200 text-slate-600 hover:text-violet-700 text-xs font-semibold transition-colors cursor-pointer">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    <span x-text="open ? 'Bezárás' : 'Szerkesztés'"></span>
                </button>
                @endif
            </div>
            @if($isCreator)
            <div x-show="open" x-cloak x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0">
                <form method="POST" action="{{ route('security.shares.update', $report) }}" class="border-t border-slate-100 px-6 py-5">
                    @csrf
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Válassza ki kik láthatják ezt a jelentést:</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 mb-4">
                        @foreach($allUsers as $u)
                        <label class="flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors
                                      {{ $sharedUsers->contains('id', $u->id) ? 'border-violet-200 bg-violet-50' : 'border-slate-200 bg-slate-50 hover:bg-violet-50 hover:border-violet-200' }}">
                            <input type="checkbox" name="share_user_ids[]" value="{{ $u->id }}"
                                   {{ $sharedUsers->contains('id', $u->id) ? 'checked' : '' }}
                                   class="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer">
                            <div class="min-w-0 flex items-center gap-2">
                                <span class="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">{{ mb_substr($u->name, 0, 1) }}</span>
                                <div class="min-w-0">
                                    <p class="text-sm font-semibold text-slate-800 truncate">{{ $u->name }}</p>
                                    <p class="text-xs text-slate-400 truncate">{{ $u->email }}</p>
                                </div>
                            </div>
                        </label>
                        @endforeach
                    </div>
                    <button type="submit"
                            class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        Megosztás mentése
                    </button>
                </form>
            </div>
            @endif
        </div>

    </div>
</div>
@endsection
