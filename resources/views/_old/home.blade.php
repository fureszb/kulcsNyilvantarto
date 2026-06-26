@extends('layouts.app')
@section('title', 'Helyszín választó')

@section('content')

{{-- Hero --}}
<div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
    <div class="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
         style="background-image: linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px); background-size: 32px 32px;"></div>
    <div class="relative px-8 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
            <nav class="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <a href="{{ route('home') }}" class="hover:text-slate-300 transition-colors">Főoldal</a>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                <span class="text-slate-400">Kulcsnyilvántartó</span>
            </nav>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Kulcs & Kártya Ellenőrzés</h1>
            <p class="text-slate-400 mt-2 text-sm">Válasszon helyszínt az ellenőrzés megkezdéséhez</p>
        </div>
        <div class="hidden sm:flex w-16 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
            <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
        </div>
    </div>
</div>

@if($locations->isEmpty())
    <div class="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
        <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
        </div>
        <h2 class="text-xl font-semibold text-slate-600">Nincs helyszín</h2>
        <p class="text-slate-400 text-sm mt-1">Az adminisztrátor feltöltése után lesznek helyszínek.</p>
    </div>
@else
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        @foreach($locations as $location)
        <a href="{{ route('keys.show', $location) }}"
           class="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm
                  hover:shadow-lg hover:shadow-blue-100/80 hover:border-blue-200
                  motion-safe:hover:-translate-y-1 transition-all duration-300 cursor-pointer">

            {{-- Felső accent sáv --}}
            <div class="h-1 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {{-- Shimmer --}}
            <div class="absolute inset-0 -translate-x-full pointer-events-none z-10
                        bg-gradient-to-r from-transparent via-blue-50/60 to-transparent
                        motion-safe:group-hover:translate-x-full
                        motion-safe:transition-transform motion-safe:duration-700"></div>

            <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center
                                group-hover:bg-blue-100 group-hover:border-blue-200 transition-all overflow-hidden shrink-0">
                        @if($location->logo_path)
                            <img src="{{ Storage::url($location->logo_path) }}" class="w-full h-full object-contain p-1">
                        @elseif($location->icon)
                            <span class="text-2xl leading-none">{{ $location->icon }}</span>
                        @else
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        @endif
                    </div>
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {{ $location->items_count }} tétel
                    </span>
                </div>
                <h2 class="text-base font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">
                    {{ $location->name }}
                </h2>
                @if($location->responsible_person)
                    <p class="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        {{ $location->responsible_person }}
                    </p>
                @endif
                <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span class="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">Megnyitás</span>
                    <div class="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-600 border border-blue-100 group-hover:border-blue-600
                                flex items-center justify-center transition-all duration-300">
                        <svg class="w-3.5 h-3.5 text-blue-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </div>
            </div>
        </a>
        @endforeach
    </div>
@endif
@endsection
