@extends('layouts.app')
@section('title', 'Főoldal')

@section('content')
<div class="w-full bg-white border border-slate-200 rounded-2xl px-8 py-6 mb-8 flex items-center justify-between gap-6 shadow-sm">
    <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
            {{ app()->bound('tenant') ? app('tenant')->name : 'KK Nyilvántartó' }}
        </h1>
        <p class="text-slate-500 mt-1 text-sm">Válasszon modult a folytatáshoz</p>
    </div>
    <div class="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
    </div>
</div>

<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">

    {{-- Kulcsnyilvántartó --}}
    <a href="{{ route('keys.index') }}"
       class="group bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-200 flex flex-col">
        <div class="w-14 h-14 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-5 transition-colors">
            <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Kulcsnyilvántartó</h2>
        <p class="text-slate-500 text-sm mt-2 flex-1">Kulcsok és belépőkártyák jelenlétének ellenőrzése helyszínenként.</p>
        <div class="mt-6 flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
            Ellenőrzés indítása
            <svg class="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
        </div>
    </a>

    {{-- Oktatások --}}
    <a href="{{ route('training.index') }}"
       class="group bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200 flex flex-col">
        <div class="w-14 h-14 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center mb-5 transition-colors">
            <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Oktatások</h2>
        <p class="text-slate-500 text-sm mt-2 flex-1">Interaktív képzési anyagok és oktatások elvégzése.</p>
        <div class="mt-6 flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
            Oktatások megtekintése
            <svg class="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
        </div>
    </a>

</div>
@endsection
