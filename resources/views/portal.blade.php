@extends('layouts.app')
@section('title', 'Főoldal')

@section('content')

{{-- ── Hero banner ───────────────────────────────────────────────────────── --}}
<div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">

    {{-- Háttér glow-ok --}}
    <div class="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

    {{-- Grid pattern --}}
    <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
         style="background-image: linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px); background-size: 32px 32px;"></div>

    <div class="relative px-8 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
            @auth('tenant')
            <p class="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Üdvözlöm, {{ auth('tenant')->user()->name }}
            </p>
            @endauth
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {{ app()->bound('tenant') ? app('tenant')->name : 'KK Nyilvántartó' }}
            </h1>
            <p class="text-slate-400 mt-2 text-sm">Válasszon modult a folytatáshoz</p>
        </div>

        {{-- Ikon dísz --}}
        <div class="hidden sm:flex w-16 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0 backdrop-blur-sm">
            <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
        </div>
    </div>
</div>

{{-- ── Modul kártyák ─────────────────────────────────────────────────────── --}}
<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">

    {{-- Kulcsnyilvántartó --}}
    <a href="{{ route('keys.index') }}"
       class="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm
              hover:shadow-xl hover:shadow-blue-100/80 hover:border-blue-200
              motion-safe:hover:-translate-y-1 transition-all duration-300 flex flex-col">

        {{-- Shimmer --}}
        <div class="absolute inset-0 -translate-x-full pointer-events-none z-10
                    bg-gradient-to-r from-transparent via-blue-50/60 to-transparent
                    motion-safe:group-hover:translate-x-full
                    motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out"></div>

        {{-- Felső gradient sáv --}}
        <div class="h-1 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div class="p-8 flex flex-col flex-1">
            {{-- Ikon --}}
            <div class="relative w-14 h-14 rounded-2xl mb-6 flex items-center justify-center
                        bg-blue-50 border border-blue-100 group-hover:bg-blue-100 group-hover:border-blue-200
                        transition-all duration-300">
                <svg class="w-7 h-7 text-blue-600 transition-transform duration-300 motion-safe:group-hover:rotate-[20deg]"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>

            <h2 class="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-200">
                Kulcsnyilvántartó
            </h2>
            <p class="text-slate-500 text-sm mt-2 flex-1 leading-relaxed">
                Kulcsok és belépőkártyák jelenlétének ellenőrzése helyszínenként.
            </p>

            {{-- Feature pontok --}}
            <ul class="mt-5 space-y-1.5">
                @foreach(['Helyszínenkénti áttekintés', 'Gyors státusz ellenőrzés', 'Ellenőrzési előzmények'] as $feat)
                <li class="flex items-center gap-2 text-xs text-slate-400">
                    <svg class="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ $feat }}
                </li>
                @endforeach
            </ul>

            <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span class="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                    Ellenőrzés indítása
                </span>
                <div class="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-600 border border-blue-100 group-hover:border-blue-600
                            flex items-center justify-center transition-all duration-300">
                    <svg class="w-4 h-4 text-blue-500 group-hover:text-white motion-safe:group-hover:translate-x-0.5 transition-all duration-200"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </div>
    </a>

    {{-- Oktatások --}}
    <a href="{{ route('training.index') }}"
       class="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm
              hover:shadow-xl hover:shadow-indigo-100/80 hover:border-indigo-200
              motion-safe:hover:-translate-y-1 transition-all duration-300 flex flex-col">

        {{-- Shimmer --}}
        <div class="absolute inset-0 -translate-x-full pointer-events-none z-10
                    bg-gradient-to-r from-transparent via-indigo-50/60 to-transparent
                    motion-safe:group-hover:translate-x-full
                    motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out"></div>

        {{-- Felső gradient sáv --}}
        <div class="h-1 bg-gradient-to-r from-indigo-500 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div class="p-8 flex flex-col flex-1">
            {{-- Ikon --}}
            <div class="relative w-14 h-14 rounded-2xl mb-6 flex items-center justify-center
                        bg-indigo-50 border border-indigo-100 group-hover:bg-indigo-100 group-hover:border-indigo-200
                        transition-all duration-300">
                <svg class="w-7 h-7 text-indigo-600 transition-transform duration-300 motion-safe:group-hover:scale-110"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
            </div>

            <h2 class="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors duration-200">
                Oktatások
            </h2>
            <p class="text-slate-500 text-sm mt-2 flex-1 leading-relaxed">
                Interaktív képzési anyagok és oktatások elvégzése.
            </p>

            {{-- Feature pontok --}}
            <ul class="mt-5 space-y-1.5">
                @foreach(['Interaktív tananyagok', 'Tudásellenőrző tesztek', 'Haladási nyomkövetés'] as $feat)
                <li class="flex items-center gap-2 text-xs text-slate-400">
                    <svg class="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ $feat }}
                </li>
                @endforeach
            </ul>

            <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span class="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    Oktatások megtekintése
                </span>
                <div class="w-8 h-8 rounded-full bg-indigo-50 group-hover:bg-indigo-600 border border-indigo-100 group-hover:border-indigo-600
                            flex items-center justify-center transition-all duration-300">
                    <svg class="w-4 h-4 text-indigo-500 group-hover:text-white motion-safe:group-hover:translate-x-0.5 transition-all duration-200"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </div>
    </a>

</div>
@endsection
