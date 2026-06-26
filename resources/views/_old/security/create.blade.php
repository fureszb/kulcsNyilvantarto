@extends('layouts.app')
@section('title', 'Új Napi Jelentés')

@section('content')
<div class="max-w-7xl mx-auto" x-data="securityForm()">

    {{-- ─── HERO ──────────────────────────────────────────────────────────────── --}}
    <div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div class="absolute -top-16 -right-16 w-56 h-56 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -left-12 w-40 h-40 bg-rose-800/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
             style="background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:32px 32px;"></div>
        <div class="relative px-4 py-6 sm:px-8 sm:py-8 flex items-start justify-between gap-6 flex-wrap">
            <div>
                <p class="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Biztonsági Szolgálat</p>
                <h1 class="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">Új Napi Jelentés</h1>
                <p class="text-slate-400 mt-1.5 text-sm">Töltsd ki az összes szekciót, majd mentsd el a jelentést.</p>
            </div>
            <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
                <a href="{{ route('security.index') }}"
                   class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    Vissza
                </a>
            </div>
        </div>
    </div>

    <form method="POST" action="{{ route('security.store') }}" @submit="prepareSubmit">
        @csrf

        {{-- Hidden JSON fields --}}
        <input type="hidden" name="service_members"        :value="JSON.stringify(service_members)">
        <input type="hidden" name="previous_shift_members" :value="JSON.stringify(previous_shift_members)">
        <input type="hidden" name="equipment"              :value="JSON.stringify(equipment)">
        <input type="hidden" name="inspectors"             :value="JSON.stringify(inspectors)">
        <input type="hidden" name="patrols"                :value="JSON.stringify(patrols)">
        <input type="hidden" name="incidents"              :value="JSON.stringify(incidents)">
        <input type="hidden" name="events"                 :value="JSON.stringify(events)">
        <input type="hidden" name="fire_alarms"            :value="JSON.stringify(fire_alarms)">
        <input type="hidden" name="elevators"              :value="JSON.stringify(elevators)">
        <input type="hidden" name="maintenance"            :value="JSON.stringify(maintenance)">

        <div class="space-y-5">

            {{-- ── 1. Fejléc ─────────────────────────────────────────────── --}}
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div class="bg-gradient-to-r from-rose-600 to-rose-500 rounded-t-2xl px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <h2 class="font-bold text-white text-sm uppercase tracking-wider">Biztonsági Szolgálat Napi Jelentés</h2>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dátum</label>
                            <input type="date" name="report_date" value="{{ now()->toDateString() }}" required
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-rose-400 focus:bg-white focus:outline-none transition">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Jelentést készítette</label>
                            <input type="text" name="prepared_by" value="{{ $preparedBy }}" readonly
                                   class="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed">
                        </div>
                    </div>
                </div>
            </div>

            {{-- ── Átadás-átvétel ─────────────────────────────────────────── --}}
            <div class="bg-white border border-rose-200 rounded-2xl shadow-sm">
                <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-rose-100 bg-rose-50/40 rounded-t-2xl flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                    </div>
                    <h3 class="font-bold text-slate-800">Átadás-átvétel</h3>
                </div>
                <div class="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Kitől veszi át a szolgálatot <span class="text-rose-500">*</span></label>
                        @include('security._person_picker', ['fieldName' => 'taken_over_from', 'currentValue' => '', 'placeholder' => 'Előző műszak vagyonőre…', 'required' => true])
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Átadás időpontja</label>
                        <input type="time" name="handover_time"
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-rose-400 focus:bg-white focus:outline-none transition">
                    </div>
                </div>
            </div>

            {{-- ── Tegnapi csapat (átadók) ────────────────────────────────── --}}
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <h3 class="font-bold text-slate-800">Tegnapi csapat (átadók)</h3>
                    <button type="button" @click="previous_shift_members.push({beosztás:'',nev:'',idő_tól:'19:00',idő_ig:'07:00'})"
                            class="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Sor hozzáadása
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm min-w-[500px]">
                        <thead><tr class="bg-slate-50 border-b border-slate-100">
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Beosztás</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Név</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Idő (tól)</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Idő (ig)</th>
                            <th class="w-10"></th>
                        </tr></thead>
                        <tbody class="divide-y divide-slate-50">
                            <template x-for="(row, i) in previous_shift_members" :key="'prev'+i">
                                <tr class="hover:bg-slate-50/80 transition-colors">
                                    <td class="px-4 py-2.5"><input type="text" x-model="row.beosztás" placeholder="pl. Vagyonőr" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-rose-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5" x-data="rowPicker(() => row.nev, v => row.nev = v)" @click.outside="open = false" @scroll.window="if(open) reposition()" @vp-resize.window="if(open) reposition()" @doc-scroll.window="if(open) reposition()">
                                        <div x-ref="wrap" class="flex items-center gap-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 focus-within:border-rose-400 focus-within:bg-white transition">
                                            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                            <input type="text" x-model="row.nev" @focus="reposition(); open=true" @click="reposition(); open=true" @input="open=true" placeholder="Teljes név" autocomplete="off" class="flex-1 py-1.5 bg-transparent text-sm focus:outline-none">
                                        </div>
                                        <template x-teleport="body">
                                            <div x-show="open && filtered.length > 0" x-cloak :style="{ position:'fixed', top:dropTop+'px', left:dropLeft+'px', width:dropWidth+'px', zIndex:9999 }" class="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                                                <ul class="max-h-48 overflow-y-auto divide-y divide-slate-50">
                                                    <template x-for="u in filtered" :key="u.id"><li><button type="button" @click="pick(u.name)" class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50 transition-colors text-left cursor-pointer"><span class="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600 shrink-0" x-text="u.name.charAt(0).toUpperCase()"></span><span class="text-sm text-slate-800 truncate" x-text="u.name"></span></button></li></template>
                                                </ul>
                                            </div>
                                        </template>
                                    </td>
                                    <td class="px-4 py-2.5"><input type="time" x-model="row.idő_tól" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-rose-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5"><input type="time" x-model="row.idő_ig" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-rose-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-2 py-2.5 text-center"><button type="button" @click="previous_shift_members.splice(i,1)" class="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></td>
                                </tr>
                            </template>
                            <tr x-show="previous_shift_members.length === 0">
                                <td colspan="5" class="px-5 py-4 text-center text-sm text-slate-400">Nincs rögzítve tegnapi csapat</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- ── Napi Szolgálat tagjai ──────────────────────────────────── --}}
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <h3 class="font-bold text-slate-800">Napi Szolgálat tagjai</h3>
                    <span class="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full" x-text="service_members.length + ' fő'"></span>
                    <button type="button" @click="service_members.push({beosztás:'',nev:'',idő_tól:'07:00',idő_ig:'19:00'})"
                            class="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 cursor-pointer transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Sor hozzáadása
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm min-w-[500px]">
                        <thead><tr class="bg-slate-50 border-b border-slate-100">
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Beosztás</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Név <span class="text-rose-500">*</span><span class="block normal-case font-normal text-[10px] text-slate-300 mt-0.5">Ha nem szerepel a listán, gépeld be</span></th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Idő (tól)</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Idő (ig)</th>
                            <th class="w-10"></th>
                        </tr></thead>
                        <tbody class="divide-y divide-slate-50">
                            <template x-for="(row, i) in service_members" :key="i">
                                <tr class="hover:bg-slate-50/80 transition-colors">
                                    <td class="px-4 py-2.5"><input type="text" x-model="row.beosztás" placeholder="pl. Vagyonőr (diszpécser)" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-rose-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5" x-data="rowPicker(() => row.nev, v => row.nev = v)" @click.outside="open = false" @scroll.window="if(open) reposition()" @vp-resize.window="if(open) reposition()" @doc-scroll.window="if(open) reposition()">
                                        <div x-ref="wrap" class="flex items-center gap-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 focus-within:border-rose-400 focus-within:bg-white transition">
                                            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                            <input type="text" x-model="row.nev" @focus="reposition(); open=true" @click="reposition(); open=true" @input="open=true" placeholder="Teljes név" autocomplete="off" class="flex-1 py-1.5 bg-transparent text-sm focus:outline-none">
                                        </div>
                                        <template x-teleport="body">
                                            <div x-show="open && filtered.length > 0" x-cloak :style="{ position:'fixed', top:dropTop+'px', left:dropLeft+'px', width:dropWidth+'px', zIndex:9999 }" class="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                                                <ul class="max-h-48 overflow-y-auto divide-y divide-slate-50">
                                                    <template x-for="u in filtered" :key="u.id"><li><button type="button" @click="pick(u.name)" class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50 transition-colors text-left cursor-pointer"><span class="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600 shrink-0" x-text="u.name.charAt(0).toUpperCase()"></span><span class="text-sm text-slate-800 truncate" x-text="u.name"></span></button></li></template>
                                                </ul>
                                            </div>
                                        </template>
                                    </td>
                                    <td class="px-4 py-2.5"><input type="time" x-model="row.idő_tól" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-rose-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5"><input type="time" x-model="row.idő_ig" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-rose-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-2 py-2.5 text-center"><button type="button" @click="service_members.splice(i,1)" class="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- ── Eszközök átadása / átvétele ────────────────────────────── --}}
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
                    </div>
                    <h3 class="font-bold text-slate-800">Eszközök átadása / átvétele</h3>
                    <span class="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full" x-text="equipment.length + ' tétel'"></span>
                    <button type="button" @click="equipment.push({megnevezés:'',darabszám:1})"
                            class="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-700 cursor-pointer transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Sor hozzáadása
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm min-w-[400px]">
                        <thead><tr class="bg-slate-50 border-b border-slate-100">
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Megnevezés</th>
                            <th class="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Darabszám</th>
                            <th class="w-10"></th>
                        </tr></thead>
                        <tbody class="divide-y divide-slate-50">
                            <template x-for="(row, i) in equipment" :key="i">
                                <tr class="hover:bg-slate-50/80 transition-colors">
                                    <td class="px-4 py-2.5"><input type="text" x-model="row.megnevezés" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5 text-center"><input type="number" x-model="row.darabszám" min="0" class="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none transition text-center"></td>
                                    <td class="px-2 py-2.5 text-center"><button type="button" @click="equipment.splice(i,1)" class="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- ── Ellenőrzést végző személyek ────────────────────────────── --}}
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    </div>
                    <h3 class="font-bold text-slate-800">Ellenőrzést végző személyek</h3>
                    <button type="button" @click="inspectors.push({neve:'',idő_tól:'',idő_ig:''})"
                            class="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-violet-500 hover:text-violet-700 cursor-pointer transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Sor hozzáadása
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm min-w-[400px]">
                        <thead><tr class="bg-slate-50 border-b border-slate-100">
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Neve <span class="text-rose-500">*</span><span class="block normal-case font-normal text-[10px] text-slate-300 mt-0.5">Ha nem szerepel a listán, gépeld be</span></th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Időtartam (tól)</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Időtartam (ig)</th>
                            <th class="w-10"></th>
                        </tr></thead>
                        <tbody class="divide-y divide-slate-50">
                            <template x-for="(row, i) in inspectors" :key="i">
                                <tr class="hover:bg-slate-50/80 transition-colors">
                                    <td class="px-4 py-2.5" x-data="rowPicker(() => row.neve, v => row.neve = v)" @click.outside="open = false" @scroll.window="if(open) reposition()" @vp-resize.window="if(open) reposition()" @doc-scroll.window="if(open) reposition()">
                                        <div x-ref="wrap" class="flex items-center gap-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 focus-within:border-violet-400 focus-within:bg-white transition">
                                            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                            <input type="text" x-model="row.neve" @focus="reposition(); open=true" @click="reposition(); open=true" @input="open=true" placeholder="Teljes név" autocomplete="off" class="flex-1 py-1.5 bg-transparent text-sm focus:outline-none">
                                        </div>
                                        <template x-teleport="body">
                                            <div x-show="open && filtered.length > 0" x-cloak :style="{ position:'fixed', top:dropTop+'px', left:dropLeft+'px', width:dropWidth+'px', zIndex:9999 }" class="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                                                <ul class="max-h-48 overflow-y-auto divide-y divide-slate-50">
                                                    <template x-for="u in filtered" :key="u.id"><li><button type="button" @click="pick(u.name)" class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-violet-50 transition-colors text-left cursor-pointer"><span class="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0" x-text="u.name.charAt(0).toUpperCase()"></span><span class="text-sm text-slate-800 truncate" x-text="u.name"></span></button></li></template>
                                                </ul>
                                            </div>
                                        </template>
                                    </td>
                                    <td class="px-4 py-2.5"><input type="time" x-model="row.idő_tól" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-violet-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5"><input type="time" x-model="row.idő_ig" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-violet-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-2 py-2.5 text-center"><button type="button" @click="inspectors.splice(i,1)" class="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></td>
                                </tr>
                            </template>
                            <tr x-show="inspectors.length === 0">
                                <td colspan="4" class="px-5 py-4 text-center text-sm text-slate-400">Nincs rögzített ellenőr</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- ── Járőrözés és zártság ellenőrzése ──────────────────────── --}}
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <h3 class="font-bold text-slate-800">Járőrözés és zártság ellenőrzése</h3>
                    <span class="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full" x-text="patrols.length + ' kör'"></span>
                    <button type="button" @click="patrols.push({vagyonőr:'',időpont:'',megjegyzés:''})"
                            class="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 cursor-pointer transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Sor hozzáadása
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm min-w-[480px]">
                        <thead><tr class="bg-slate-50 border-b border-slate-100">
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vagyonőr <span class="text-rose-500">*</span><span class="block normal-case font-normal text-[10px] text-slate-300 mt-0.5">Ha nem szerepel a listán, gépeld be</span></th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Időpont</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Megjegyzés / hiba</th>
                            <th class="w-10"></th>
                        </tr></thead>
                        <tbody class="divide-y divide-slate-50">
                            <template x-for="(row, i) in patrols" :key="i">
                                <tr class="hover:bg-slate-50/80 transition-colors">
                                    <td class="px-4 py-2.5" x-data="rowPicker(() => row.vagyonőr, v => row.vagyonőr = v)" @click.outside="open = false" @scroll.window="if(open) reposition()" @vp-resize.window="if(open) reposition()" @doc-scroll.window="if(open) reposition()">
                                        <div x-ref="wrap" class="flex items-center gap-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white transition">
                                            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                            <input type="text" x-model="row.vagyonőr" @focus="reposition(); open=true" @click="reposition(); open=true" @input="open=true" placeholder="Név" autocomplete="off" class="flex-1 py-1.5 bg-transparent text-sm focus:outline-none">
                                        </div>
                                        <template x-teleport="body">
                                            <div x-show="open && filtered.length > 0" x-cloak :style="{ position:'fixed', top:dropTop+'px', left:dropLeft+'px', width:dropWidth+'px', zIndex:9999 }" class="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                                                <ul class="max-h-48 overflow-y-auto divide-y divide-slate-50">
                                                    <template x-for="u in filtered" :key="u.id"><li><button type="button" @click="pick(u.name)" class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-emerald-50 transition-colors text-left cursor-pointer"><span class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 shrink-0" x-text="u.name.charAt(0).toUpperCase()"></span><span class="text-sm text-slate-800 truncate" x-text="u.name"></span></button></li></template>
                                                </ul>
                                            </div>
                                        </template>
                                    </td>
                                    <td class="px-4 py-2.5"><input type="time" x-model="row.időpont" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-emerald-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5"><input type="text" x-model="row.megjegyzés" placeholder="–" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-emerald-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-2 py-2.5 text-center"><button type="button" @click="patrols.splice(i,1)" class="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></td>
                                </tr>
                            </template>
                            <tr x-show="patrols.length === 0">
                                <td colspan="4" class="px-5 py-4 text-center text-sm text-slate-400">Nincs rögzített járőrözés</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- ── Rendkívüli események ───────────────────────────────────── --}}
            <div class="bg-white border border-rose-200 rounded-2xl shadow-sm">
                <div class="px-6 py-4 border-b border-rose-100 flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    </div>
                    <h3 class="font-bold text-rose-700">Rendkívüli események</h3>
                    <span class="text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full" x-show="incidents.length > 0" x-text="incidents.length + ' esemény'"></span>
                    <button type="button" @click="incidents.push({időpont:'',leírás:''})"
                            class="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 cursor-pointer transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Esemény hozzáadása
                    </button>
                </div>
                <div class="divide-y divide-rose-50">
                    <template x-for="(row, i) in incidents" :key="i">
                        <div class="px-6 py-4 flex gap-4 items-start hover:bg-rose-50/40 transition-colors">
                            <input type="time" x-model="row.időpont" class="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm focus:border-rose-400 focus:outline-none transition w-28 shrink-0 font-mono">
                            <textarea x-model="row.leírás" rows="2" placeholder="Esemény leírása..." class="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm focus:border-rose-400 focus:outline-none transition resize-none"></textarea>
                            <button type="button" @click="incidents.splice(i,1)" class="text-slate-300 hover:text-rose-500 transition-colors mt-1 shrink-0 cursor-pointer">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </template>
                    <div x-show="incidents.length === 0" class="px-6 py-5 text-sm text-slate-400 text-center">Nem volt rendkívüli esemény</div>
                </div>
            </div>

            {{-- ── Eseménynaptár ──────────────────────────────────────────── --}}
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <h3 class="font-bold text-slate-800">Eseménynaptár</h3>
                    <span class="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full" x-show="events.length > 0" x-text="events.length + ' tétel'"></span>
                    <button type="button" @click="events.push({idő_tól:'',idő_ig:'',leírás:''})"
                            class="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700 cursor-pointer transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Esemény hozzáadása
                    </button>
                </div>
                <div class="divide-y divide-slate-50">
                    <template x-for="(row, i) in events" :key="i">
                        <div class="px-6 py-4 flex gap-4 items-start hover:bg-slate-50/80 transition-colors">
                            <div class="flex items-center gap-1 shrink-0">
                                <input type="time" x-model="row.idő_tól" class="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm focus:border-blue-400 focus:outline-none transition w-24 font-mono">
                                <span class="text-slate-400 text-xs">–</span>
                                <input type="time" x-model="row.idő_ig" class="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm focus:border-blue-400 focus:outline-none transition w-24 font-mono">
                            </div>
                            <textarea x-model="row.leírás" rows="2" placeholder="Esemény leírása..." class="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm focus:border-blue-400 focus:outline-none transition resize-none"></textarea>
                            <button type="button" @click="events.splice(i,1)" class="text-slate-300 hover:text-rose-500 transition-colors mt-1 shrink-0 cursor-pointer">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </template>
                    <div x-show="events.length === 0" class="px-6 py-5 text-sm text-slate-400 text-center">Nincs bejegyzett esemény</div>
                </div>
            </div>

            {{-- ── Tűzjelző rendszer jelzések ─────────────────────────────── --}}
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/></svg>
                    </div>
                    <h3 class="font-bold text-slate-800">Tűzjelző rendszer jelzések</h3>
                    <span class="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full" x-show="fire_alarms.length > 0" x-text="fire_alarms.length + ' jelzés'"></span>
                    <button type="button" @click="fire_alarms.push({megnevezés:'Tűzjelzés',készpont:'',időpont:'',ellenőrző:''})"
                            class="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-700 cursor-pointer transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Sor hozzáadása
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm min-w-[560px]">
                        <thead><tr class="bg-slate-50 border-b border-slate-100">
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Megnevezés</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Készpont</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">Időpont</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ellenőrző</th>
                            <th class="w-10"></th>
                        </tr></thead>
                        <tbody class="divide-y divide-slate-50">
                            <template x-for="(row, i) in fire_alarms" :key="i">
                                <tr class="hover:bg-slate-50/80 transition-colors">
                                    <td class="px-4 py-2.5"><input type="text" x-model="row.megnevezés" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-orange-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5"><input type="text" x-model="row.készpont" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-orange-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5"><input type="time" x-model="row.időpont" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-orange-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5"><input type="text" x-model="row.ellenőrző" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-orange-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-2 py-2.5 text-center"><button type="button" @click="fire_alarms.splice(i,1)" class="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></td>
                                </tr>
                            </template>
                            <tr x-show="fire_alarms.length === 0">
                                <td colspan="5" class="px-5 py-4 text-center text-sm text-slate-400">Nem volt tűzjelzés</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- ── Liftek ellenőrzése ─────────────────────────────────────── --}}
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
                    </div>
                    <h3 class="font-bold text-slate-800">Liftek ellenőrzése</h3>
                    <span class="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full" x-show="elevators.length > 0" x-text="elevators.length + ' lift'"></span>
                    <button type="button" @click="elevators.push({megnevezés:'Liftek',időpont:'',ellenőrző:''})"
                            class="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-800 cursor-pointer transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Sor hozzáadása
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm min-w-[400px]">
                        <thead><tr class="bg-slate-50 border-b border-slate-100">
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Megnevezés</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Időpont</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ellenőrző</th>
                            <th class="w-10"></th>
                        </tr></thead>
                        <tbody class="divide-y divide-slate-50">
                            <template x-for="(row, i) in elevators" :key="i">
                                <tr class="hover:bg-slate-50/80 transition-colors">
                                    <td class="px-4 py-2.5"><input type="text" x-model="row.megnevezés" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-cyan-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5"><input type="time" x-model="row.időpont" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-cyan-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5" x-data="rowPicker(() => row.ellenőrző, v => row.ellenőrző = v)" @click.outside="open = false" @scroll.window="if(open) reposition()" @vp-resize.window="if(open) reposition()" @doc-scroll.window="if(open) reposition()">
                                        <div x-ref="wrap" class="flex items-center gap-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 focus-within:border-cyan-400 focus-within:bg-white transition">
                                            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                            <input type="text" x-model="row.ellenőrző" @focus="reposition(); open=true" @click="reposition(); open=true" @input="open=true" placeholder="Teljes név" autocomplete="off" class="flex-1 py-1.5 bg-transparent text-sm focus:outline-none">
                                        </div>
                                        <template x-teleport="body">
                                            <div x-show="open && filtered.length > 0" x-cloak :style="{ position:'fixed', top:dropTop+'px', left:dropLeft+'px', width:dropWidth+'px', zIndex:9999 }" class="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                                                <ul class="max-h-48 overflow-y-auto divide-y divide-slate-50">
                                                    <template x-for="u in filtered" :key="u.id"><li><button type="button" @click="pick(u.name)" class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-cyan-50 transition-colors text-left cursor-pointer"><span class="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-bold text-cyan-600 shrink-0" x-text="u.name.charAt(0).toUpperCase()"></span><span class="text-sm text-slate-800 truncate" x-text="u.name"></span></button></li></template>
                                                </ul>
                                            </div>
                                        </template>
                                    </td>
                                    <td class="px-2 py-2.5 text-center"><button type="button" @click="elevators.splice(i,1)" class="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></td>
                                </tr>
                            </template>
                            <tr x-show="elevators.length === 0">
                                <td colspan="4" class="px-5 py-4 text-center text-sm text-slate-400">Nincs rögzített liftellenőrzés</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- ── Karbantartások / munkavégzések ─────────────────────────── --}}
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <h3 class="font-bold text-slate-800">Karbantartások / munkavégzések</h3>
                    <span class="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full" x-show="maintenance.length > 0" x-text="maintenance.length + ' tétel'"></span>
                    <button type="button" @click="maintenance.push({cég:'',helyszín:'',idő_tól:'',idő_ig:''})"
                            class="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-800 cursor-pointer transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Sor hozzáadása
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm min-w-[520px]">
                        <thead><tr class="bg-slate-50 border-b border-slate-100">
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cég / kivitelező</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Helyszín / munka</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Kezdete</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Vége</th>
                            <th class="w-10"></th>
                        </tr></thead>
                        <tbody class="divide-y divide-slate-50">
                            <template x-for="(row, i) in maintenance" :key="i">
                                <tr class="hover:bg-slate-50/80 transition-colors">
                                    <td class="px-4 py-2.5"><input type="text" x-model="row.cég" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-amber-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5"><input type="text" x-model="row.helyszín" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-amber-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5"><input type="time" x-model="row.idő_tól" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-amber-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-4 py-2.5"><input type="time" x-model="row.idő_ig" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus:border-amber-400 focus:bg-white focus:outline-none transition"></td>
                                    <td class="px-2 py-2.5 text-center"><button type="button" @click="maintenance.splice(i,1)" class="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></td>
                                </tr>
                            </template>
                            <tr x-show="maintenance.length === 0">
                                <td colspan="5" class="px-5 py-4 text-center text-sm text-slate-400">Nem volt karbantartás</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- ── Email értesítés & megosztás ────────────────────────────── --}}
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <h3 class="font-bold text-slate-800">Email értesítés & megosztás</h3>
                </div>
                <div class="p-6 space-y-5">
                    @if($sortedUsers->isNotEmpty())
                    <div class="relative">
                        @include('security._share_picker', ['sharedIds' => []])
                    </div>
                    @endif
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Extra CC email-ek (opcionális)</label>
                        <input type="text" name="cc_recipients"
                               placeholder="email1@pelda.hu, email2@pelda.hu"
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-violet-400 focus:bg-white focus:outline-none transition">
                        <p class="text-xs text-slate-400 mt-1.5">Vesszővel elválasztva. Az adminban beállított állandó értesítési email-eken felül.</p>
                    </div>
                </div>
            </div>

            {{-- ── Validációs hibák ─────────────────────────────────────────── --}}
            <div x-show="validationErrors.length > 0" x-cloak x-ref="errorBanner"
                 class="bg-rose-50 border border-rose-200 rounded-2xl px-6 py-4">
                <p class="text-sm font-bold text-rose-700 mb-2">Kérlek töltsd ki az összes kötelező mezőt:</p>
                <ul class="space-y-1">
                    <template x-for="err in validationErrors" :key="err">
                        <li class="flex items-start gap-2 text-sm text-rose-600">
                            <svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <span x-text="err"></span>
                        </li>
                    </template>
                </ul>
            </div>

            {{-- ── Mentés gomb ─────────────────────────────────────────────── --}}
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between">
                <a href="{{ route('security.index') }}"
                   class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors">
                    Mégse
                </a>
                <button type="submit"
                        class="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Jelentés mentése
                </button>
            </div>

        </div>
    </form>
</div>

<script>
window._pickerUsers = {!! $sortedUsers->map(fn($u) => ['id' => $u->id, 'name' => $u->name])->values()->toJson() !!};

function rowPicker(getVal, setVal) {
    return {
        open: false, dropTop: -9999, dropLeft: -9999, dropWidth: 200,
        get filtered() {
            const v = (getVal() || '').toLowerCase();
            return v ? window._pickerUsers.filter(u => u.name.toLowerCase().includes(v)) : window._pickerUsers;
        },
        reposition() {
            const rect   = this.$refs.wrap.getBoundingClientRect();
            const vp     = window.visualViewport;
            const vpTop  = vp ? vp.offsetTop  : 0;
            const vpLeft = vp ? vp.offsetLeft : 0;
            this.dropTop  = rect.bottom + vpTop + 4;
            this.dropLeft  = rect.left + vpLeft;
            this.dropWidth = Math.max(rect.width, 180);
        },
        pick(name) { setVal(name); this.open = false; }
    };
}

function securityForm() {
    return {
        previous_shift_members: [],
        service_members: [
            { beosztás: 'Vagyonőr (diszpécser)', nev: '', idő_tól: '07:00', idő_ig: '07:00' },
            { beosztás: 'Vagyonőr (recepció)',   nev: '', idő_tól: '07:00', idő_ig: '19:00' },
        ],
        equipment: [
            { megnevezés: 'HP ProBook 640 G2 laptop töltő (diszpécser)', darabszám: 1 },
            { megnevezés: 'Doogee mobiltelefon + töltő (diszpécser)',    darabszám: 1 },
            { megnevezés: 'Nokia 101 mobiltelefon + töltő (recepció)',   darabszám: 1 },
            { megnevezés: 'HP LaserJet P1102w (diszpécser)',             darabszám: 1 },
            { megnevezés: 'Chocking system csokkoló töltő (diszpécser)', darabszám: 1 },
            { megnevezés: 'Gázspray (diszpécser)',                       darabszám: 1 },
            { megnevezés: 'Gumibot',                                     darabszám: 1 },
        ],
        inspectors:  [{ neve: '', idő_tól: '', idő_ig: '' }],
        patrols:     [{ vagyonőr: '', időpont: '', megjegyzés: '' }],
        incidents:   [],
        events:      [],
        fire_alarms: [],
        elevators:   [{ megnevezés: 'Liftek', időpont: '', ellenőrző: '' }],
        maintenance: [],
        validationErrors: [],
        prepareSubmit(event) {
            const errors = [];
            const from = document.querySelector('input[name="taken_over_from"]');
            if (!from || !from.value.trim()) {
                errors.push('Az „Átadás-átvétel → Kitől veszi át a szolgálatot" mező kitöltése kötelező.');
            }
            if (this.service_members.some(r => !(r.nev ?? '').trim())) {
                errors.push('A „Napi Szolgálat tagjai → Név" mező kitöltése kötelező minden sornál.');
            }
            if (this.inspectors.some(r => !(r.neve ?? '').trim())) {
                errors.push('Az „Ellenőrzést végző személyek → Neve" mező kitöltése kötelező minden sornál.');
            }
            if (this.patrols.some(r => !(r.vagyonőr ?? '').trim())) {
                errors.push('A „Járőrözés és zártság ellenőrzése → Vagyonőr" mező kitöltése kötelező minden sornál.');
            }
            this.validationErrors = errors;
            if (errors.length > 0) {
                event.preventDefault();
                this.$nextTick(() => this.$refs.errorBanner?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            }
        }
    };
}
</script>
@endsection
