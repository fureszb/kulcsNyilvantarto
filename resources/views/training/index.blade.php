@extends('layouts.app')
@section('title', 'Oktatások')

@section('content')
<div class="w-full bg-white border border-slate-200 rounded-2xl px-8 py-6 mb-8 flex items-center justify-between gap-6 shadow-sm">
    <div>
        <nav class="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <a href="{{ route('home') }}" class="hover:text-slate-600 transition-colors">Főoldal</a>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            <span class="text-slate-600">Oktatások</span>
        </nav>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Oktatások</h1>
        <p class="text-slate-500 mt-1 text-sm">Válasszon oktatást a megkezdéséhez</p>
    </div>
    <div class="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
    </div>
</div>

@if($trainings->isEmpty())
    <div class="card p-12 text-center">
        <svg class="w-14 h-14 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
        <h2 class="text-lg font-semibold text-slate-600">Még nincs oktatás</h2>
        <p class="text-slate-400 text-sm mt-1">Az adminisztrátor hamarosan feltölti az oktatási anyagokat.</p>
    </div>
@else
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        @foreach($trainings as $training)
        <a href="{{ route('training.show', $training) }}"
           class="card group hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200">
            <div class="p-6">
                <div class="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center mb-4 transition-colors">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                </div>
                <h2 class="text-base font-bold text-slate-800 group-hover:text-indigo-700 transition-colors leading-tight">{{ $training->title }}</h2>
                @if($training->description)
                    <p class="text-sm text-slate-500 mt-1.5 line-clamp-2">{{ $training->description }}</p>
                @endif
                <div class="mt-4 flex items-center justify-between">
                    <span class="text-xs font-medium text-slate-400">{{ $training->steps_count }} lépés</span>
                    <span class="flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                        Megkezdés
                        <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </span>
                </div>
            </div>
        </a>
        @endforeach
    </div>
@endif
@endsection
