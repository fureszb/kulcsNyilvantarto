@extends('layouts.pm')
@section('title', 'Dolgozók áttekintése')

@if($welcomeName ?? false)
@section('welcome_overlay')
<div x-data="pmWelcome()" x-show="show"
     :class="fading ? 'opacity-0' : 'opacity-100'"
     class="fixed inset-0 z-[999] flex items-center justify-center transition-opacity duration-700 ease-in-out pointer-events-none"
     style="background: linear-gradient(135deg, #0f172a 0%, #1c1917 50%, #0f172a 100%);">

    {{-- Háttér fények --}}
    <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-600/8 rounded-full blur-3xl animate-pulse" style="animation-delay:1s"></div>
    </div>

    {{-- Tartalom --}}
    <div class="relative text-center px-8"
         :class="entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
         class="transition-all duration-700 ease-out">
        <p class="text-amber-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">Property Manager Portál</p>
        <h1 class="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-3">
            Üdvözöljük,
        </h1>
        <h2 class="text-4xl sm:text-6xl font-extrabold tracking-tight"
            style="background: linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            {{ $welcomeName }}!
        </h2>
        <div class="mt-8 w-16 h-0.5 bg-amber-500/40 mx-auto rounded-full"></div>
    </div>
</div>
@endsection
@endif

@section('content')

{{-- Hero --}}
<div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
    <div class="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
         style="background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:32px 32px;"></div>
    <div class="relative px-8 py-8 flex items-center justify-between gap-6">
        <div>
            <p class="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Property Manager Portál</p>
            <h1 class="text-3xl font-extrabold text-white tracking-tight inline-block" style="animation: pmHeartbeat 4.5s ease-in-out infinite;">Dolgozók áttekintése</h1>
            <p class="text-slate-400 mt-1 text-sm">{{ $workerStats->count() }} aktív dolgozó – oktatási és vizsgaeredmények</p>
        </div>
        <div class="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
            <svg class="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
        </div>
    </div>
</div>

@if($workerStats->isEmpty())
    <div class="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
        <p class="text-slate-400">Még nincs aktív dolgozó a rendszerben.</p>
    </div>
@else
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        @foreach($workerStats as $s)
        @php $w = $s['worker']; @endphp
        <a href="{{ route('pm.worker', $w) }}"
           x-data="pmTilt()"
           @mousemove="tilt($event)"
           @mouseleave="reset()"
           class="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-amber-200
                  transition-[box-shadow,border-color] duration-200 p-6 flex flex-col gap-4 cursor-pointer pm-enter"
           style="animation-delay: {{ 100 + $loop->index * 130 }}ms; transform-style:preserve-3d; will-change:transform;">

            {{-- Worker header --}}
            <div class="flex items-start gap-3">
                <div class="w-11 h-11 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-lg font-bold text-amber-600">
                    {{ mb_substr($w->name, 0, 1) }}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-slate-800 group-hover:text-amber-700 transition-colors truncate">{{ $w->name }}</p>
                    <p class="text-xs text-slate-400 mt-0.5 truncate">{{ $w->email }}</p>
                    @if($w->employed_since)
                        <p class="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            {{ $w->employed_since->format('Y.m.d') }} óta
                        </p>
                        <p class="text-xs text-amber-500 mt-0.5 flex items-center gap-1 font-medium">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            {{ (int) $w->employed_since->diffInDays(now()) }} napja dolgozik
                        </p>
                    @endif
                </div>
                <svg class="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
            </div>

            {{-- Stats --}}
            <div class="space-y-3 border-t border-slate-100 pt-4">
                {{-- Oktatási anyagok --}}
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-semibold text-slate-500">Oktatási anyagok</span>
                        <span class="text-xs font-bold {{ $s['training_pct'] >= 80 ? 'text-green-600' : ($s['training_pct'] >= 50 ? 'text-amber-600' : 'text-red-500') }}">{{ $s['training_pct'] }}%</span>
                    </div>
                    <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full rounded-full pm-progress {{ $s['training_pct'] >= 80 ? 'bg-green-500' : ($s['training_pct'] >= 50 ? 'bg-amber-400' : 'bg-red-400') }}"
                             style="--pw: {{ $s['training_pct'] }}%; animation-delay: {{ 100 + $loop->index * 130 + 350 }}ms"></div>
                    </div>
                </div>

                {{-- Helyismeret --}}
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-semibold text-slate-500">Helyismeret</span>
                        <span class="text-xs font-bold {{ $s['location_pct'] >= 80 ? 'text-green-600' : ($s['location_pct'] >= 50 ? 'text-amber-600' : 'text-red-500') }}">{{ $s['location_pct'] }}%</span>
                    </div>
                    <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full rounded-full pm-progress {{ $s['location_pct'] >= 80 ? 'bg-green-500' : ($s['location_pct'] >= 50 ? 'bg-amber-400' : 'bg-red-400') }}"
                             style="--pw: {{ $s['location_pct'] }}%; animation-delay: {{ 100 + $loop->index * 130 + 480 }}ms"></div>
                    </div>
                </div>

                {{-- Szakmai tudás --}}
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-semibold text-slate-500">Szakmai tudás (vizsga)</span>
                        @if($s['prof_pct'] !== null)
                            <span class="text-xs font-bold {{ $s['prof_pct'] >= 70 ? 'text-green-600' : ($s['prof_pct'] >= 50 ? 'text-amber-600' : 'text-red-500') }}">{{ $s['prof_pct'] }}%</span>
                        @else
                            <span class="text-xs text-slate-300">Nincs vizsga</span>
                        @endif
                    </div>
                    <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        @if($s['prof_pct'] !== null)
                            <div class="h-full rounded-full pm-progress {{ $s['prof_pct'] >= 70 ? 'bg-green-500' : ($s['prof_pct'] >= 50 ? 'bg-amber-400' : 'bg-red-400') }}"
                                 style="--pw: {{ $s['prof_pct'] }}%; animation-delay: {{ 100 + $loop->index * 130 + 610 }}ms"></div>
                        @endif
                    </div>
                </div>
            </div>
        </a>
        @endforeach
    </div>
@endif

@endsection
