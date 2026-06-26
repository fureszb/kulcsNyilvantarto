@extends('layouts.pm')
@section('title', $user->name . ' – részletek')

@section('content')

{{-- Hero --}}
<div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
    <div class="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
         style="background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:32px 32px;"></div>
    <div class="relative px-8 py-8 flex items-center justify-between gap-6">
        <div class="flex items-center gap-5">
            <div class="hidden sm:flex w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 items-center justify-center text-2xl font-extrabold text-amber-300 shrink-0">
                {{ mb_substr($user->name, 0, 1) }}
            </div>
            <div>
                <p class="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Property Manager · Dolgozó</p>
                <h1 class="text-3xl font-extrabold text-white tracking-tight">{{ $user->name }}</h1>
                <p class="text-slate-400 mt-1 text-sm">
                    {{ $user->email }}
                    @if($user->employed_since)
                        &nbsp;· Belépett: {{ $user->employed_since->format('Y. F j.') }}
                    @endif
                </p>
            </div>
        </div>
        <a href="{{ route('pm.dashboard') }}"
           class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Vissza
        </a>
    </div>
</div>

{{-- Stats row --}}
<div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
    <div class="grid grid-cols-3 divide-x divide-slate-100">
        @php $s = $stats; @endphp
        <div class="px-6 py-5 text-center">
            <p class="text-2xl font-extrabold {{ $s['training_pct'] >= 80 ? 'text-green-600' : ($s['training_pct'] >= 50 ? 'text-amber-600' : 'text-red-600') }}">
                <span x-data="pmCountUp({{ $s['training_pct'] }})" x-text="display + '%'">{{ $s['training_pct'] }}%</span>
            </p>
            <div class="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden w-16 mx-auto">
                <div class="h-full rounded-full pm-progress {{ $s['training_pct'] >= 80 ? 'bg-green-500' : ($s['training_pct'] >= 50 ? 'bg-amber-400' : 'bg-red-400') }}"
                     style="--pw: {{ $s['training_pct'] }}%; animation-delay: 400ms"></div>
            </div>
            <p class="text-xs text-slate-500 font-semibold mt-1.5">Oktatási anyagok</p>
        </div>
        <div class="px-6 py-5 text-center">
            <p class="text-2xl font-extrabold {{ $s['location_pct'] >= 80 ? 'text-green-600' : ($s['location_pct'] >= 50 ? 'text-amber-600' : 'text-red-600') }}">
                <span x-data="pmCountUp({{ $s['location_pct'] }})" x-text="display + '%'">{{ $s['location_pct'] }}%</span>
            </p>
            <div class="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden w-16 mx-auto">
                <div class="h-full rounded-full pm-progress {{ $s['location_pct'] >= 80 ? 'bg-green-500' : ($s['location_pct'] >= 50 ? 'bg-amber-400' : 'bg-red-400') }}"
                     style="--pw: {{ $s['location_pct'] }}%; animation-delay: 550ms"></div>
            </div>
            <p class="text-xs text-slate-500 font-semibold mt-1.5">Helyismeret</p>
        </div>
        <div class="px-6 py-5 text-center">
            @if($s['prof_pct'] !== null)
                <p class="text-2xl font-extrabold {{ $s['prof_pct'] >= 70 ? 'text-green-600' : ($s['prof_pct'] >= 50 ? 'text-amber-600' : 'text-red-600') }}">
                    <span x-data="pmCountUp({{ $s['prof_pct'] }})" x-text="display + '%'">{{ $s['prof_pct'] }}%</span>
                </p>
                <div class="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden w-16 mx-auto">
                    <div class="h-full rounded-full pm-progress {{ $s['prof_pct'] >= 70 ? 'bg-green-500' : ($s['prof_pct'] >= 50 ? 'bg-amber-400' : 'bg-red-400') }}"
                         style="--pw: {{ $s['prof_pct'] }}%; animation-delay: 700ms"></div>
                </div>
            @else
                <p class="text-2xl font-extrabold text-slate-300">–</p>
                <div class="mt-2 h-1 w-16 mx-auto"></div>
            @endif
            <p class="text-xs text-slate-500 font-semibold mt-1.5">Szakmai tudás</p>
        </div>
    </div>
</div>

{{-- Oktatások table --}}
<div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
        <h2 class="font-bold text-slate-800">Oktatások</h2>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[480px]">
            <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                    <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Oktatás neve</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Típus</th>
                    <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Elvégzett</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse($trainingRows as $row)
                <tr class="hover:bg-amber-50/40 transition-colors duration-150 cursor-default">
                    <td class="px-6 py-3.5 font-medium text-slate-800">{{ $row['training']->title }}</td>
                    <td class="px-4 py-3.5">
                        @if($row['training']->is_location_knowledge)
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                                Helyismereti
                            </span>
                        @else
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Általános</span>
                        @endif
                    </td>
                    <td class="px-4 py-3.5 text-center">
                        @if($row['training_done'])
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                Elvégzett
                            </span>
                        @else
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-400">Hiányzik</span>
                        @endif
                    </td>
                </tr>
                @empty
                    <tr><td colspan="3" class="px-6 py-6 text-center text-slate-400 text-sm">Nincs aktív oktatás.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

{{-- Vizsgák table --}}
<div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        <h2 class="font-bold text-slate-800">Vizsgák</h2>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[480px]">
            <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                    <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vizsga neve</th>
                    <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Legjobb eredmény</th>
                    <th class="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Alkalmak</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse($examRows as $row)
                <tr class="hover:bg-amber-50/40 transition-colors duration-150 cursor-default">
                    <td class="px-6 py-3.5 font-medium text-slate-800">{{ $row['exam']->title }}</td>
                    <td class="px-4 py-3.5 text-center">
                        @if($row['exam_done'] && $row['last_exam'])
                            @php $pct = $row['last_exam']->scorePercent(); @endphp
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                                {{ $pct >= 70 ? 'bg-green-50 text-green-700' : ($pct >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700') }}">
                                {{ $pct }}%
                            </span>
                        @else
                            <span class="text-slate-300 text-xs">–</span>
                        @endif
                    </td>
                    <td class="px-6 py-3.5 text-right text-slate-500">
                        {{ $row['exam_count'] > 0 ? $row['exam_count'] . ' alkalom' : '–' }}
                    </td>
                </tr>
                @empty
                    <tr><td colspan="3" class="px-6 py-6 text-center text-slate-400 text-sm">Nincs aktív vizsga.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

{{-- Recent activity --}}
@if($recentActivity->isNotEmpty())
<div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h2 class="font-bold text-slate-800">Legutóbbi tevékenységek</h2>
    </div>
    <div class="divide-y divide-slate-100">
        @foreach($recentActivity as $log)
        @php
            $color = match($log->event_type) {
                'check.completed'    => 'blue',
                'training.completed' => 'indigo',
                'exam.completed'     => 'amber',
                default              => 'slate',
            };
        @endphp
        <div class="px-6 py-3.5 flex items-center gap-4">
            <div class="w-2 h-2 rounded-full shrink-0
                {{ $color === 'blue' ? 'bg-blue-400' : ($color === 'indigo' ? 'bg-indigo-400' : ($color === 'amber' ? 'bg-amber-400' : 'bg-slate-300')) }}"></div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-slate-700 truncate">{{ $log->description }}</p>
            </div>
            <span class="text-xs text-slate-400 shrink-0">{{ $log->occurred_at->format('Y.m.d H:i') }}</span>
        </div>
        @endforeach
    </div>
</div>
@endif

@endsection
