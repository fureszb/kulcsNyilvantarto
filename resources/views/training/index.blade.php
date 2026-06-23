@extends('layouts.app')
@section('title', 'Oktatások')

@section('content')

{{-- Hero --}}
<div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
    <div class="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-10 -left-10 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
         style="background-image: linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px); background-size: 32px 32px;"></div>
    <div class="relative px-8 sm:px-10 py-10 flex items-center justify-between gap-6">
        <div>
            <nav class="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <a href="{{ route('home') }}" class="hover:text-slate-300 transition-colors">Főoldal</a>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                <span class="text-slate-400">Oktatások</span>
            </nav>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Oktatások</h1>
            <p class="text-slate-400 mt-2 text-sm">Válasszon oktatást a megkezdéséhez</p>
        </div>
        <div class="hidden sm:flex w-16 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
            <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
        </div>
    </div>
</div>

@if($trainings->isEmpty())
    <div class="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
        <div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
        </div>
        <h2 class="text-xl font-semibold text-slate-600">Még nincs oktatás</h2>
        <p class="text-slate-400 text-sm mt-1">Az adminisztrátor hamarosan feltölti az oktatási anyagokat.</p>
    </div>
@else
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        @foreach($trainings as $training)
        <a href="{{ route('training.show', $training) }}"
           class="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm
                  hover:shadow-lg hover:shadow-indigo-100/80 hover:border-indigo-200
                  motion-safe:hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col">

            {{-- Felső accent sáv --}}
            <div class="h-1 bg-gradient-to-r from-indigo-500 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {{-- Shimmer --}}
            <div class="absolute inset-0 -translate-x-full pointer-events-none z-10
                        bg-gradient-to-r from-transparent via-indigo-50/60 to-transparent
                        motion-safe:group-hover:translate-x-full
                        motion-safe:transition-transform motion-safe:duration-700"></div>

            <div class="p-6 flex flex-col flex-1">
                <div class="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100
                            group-hover:bg-indigo-100 group-hover:border-indigo-200
                            flex items-center justify-center mb-5 transition-all shrink-0">
                    <svg class="w-5 h-5 text-indigo-600 transition-transform duration-300 motion-safe:group-hover:scale-110"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                </div>

                <h2 class="text-base font-bold text-slate-800 group-hover:text-indigo-700 transition-colors leading-tight">
                    {{ $training->title }}
                </h2>
                @if($training->description)
                    <p class="text-sm text-slate-500 mt-2 line-clamp-2 flex-1 leading-relaxed">{{ $training->description }}</p>
                @else
                    <div class="flex-1"></div>
                @endif

                <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span class="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        {{ $training->steps_count }} lépés
                    </span>
                    <div class="w-7 h-7 rounded-full bg-indigo-50 group-hover:bg-indigo-600 border border-indigo-100 group-hover:border-indigo-600
                                flex items-center justify-center transition-all duration-300">
                        <svg class="w-3.5 h-3.5 text-indigo-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
