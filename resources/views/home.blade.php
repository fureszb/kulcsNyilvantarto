@extends('layouts.app')
@section('title', 'Helyszín választó')

@section('content')
<div class="w-full bg-white border border-slate-200 rounded-2xl px-8 py-6 mb-8 flex items-center justify-between gap-6 shadow-sm">
    <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Kulcs & Kártya Ellenőrzés</h1>
        <p class="text-slate-500 mt-1 text-sm">Válasszon helyszínt az ellenőrzés megkezdéséhez</p>
    </div>
    <div class="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
        </svg>
    </div>
</div>

@if($locations->isEmpty())
    <div class="card p-12 text-center">
        <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <h2 class="text-xl font-semibold text-slate-600">Nincs helyszín</h2>
        <p class="text-slate-400 mt-1">Az adminisztrátornak először fel kell venni helyszíneket.</p>
        <a href="{{ route('admin.login') }}" class="btn-primary mt-6">Bejelentkezés az adminba</a>
    </div>
@else
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        @foreach($locations as $location)
        <a href="{{ route('check.show', $location) }}"
           class="card group hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors overflow-hidden shrink-0">
                        @if($location->logo_path)
                            <img src="{{ Storage::url($location->logo_path) }}" class="w-full h-full object-contain p-1">
                        @elseif($location->icon)
                            <span class="text-2xl leading-none">{{ $location->icon }}</span>
                        @else
                            <svg class="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            </svg>
                        @endif
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        {{ $location->items_count }} tétel
                    </span>
                </div>
                <h2 class="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">
                    {{ $location->name }}
                </h2>
                @if($location->responsible_person)
                    <p class="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        {{ $location->responsible_person }}
                    </p>
                @endif
                <div class="mt-4 flex items-center text-sm font-semibold text-blue-700 group-hover:text-blue-800">
                    Ellenőrzés indítása
                    <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </a>
        @endforeach
    </div>
@endif
@endsection
