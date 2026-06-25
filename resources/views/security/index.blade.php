@extends('layouts.app')
@section('title', 'Napi Jelentések')

@section('content')
<div class="max-w-7xl mx-auto">

    {{-- Header --}}
    <div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div class="absolute -top-16 -right-16 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
             style="background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:32px 32px;"></div>
        <div class="relative px-8 py-8 flex items-center justify-between gap-6 flex-wrap">
            <div>
                <p class="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Biztonsági Szolgálat</p>
                <h1 class="text-3xl font-extrabold text-white tracking-tight">
                    @if($user->isAdmin()) Összes Napi Jelentés @else Saját szolgálati lapok @endif
                </h1>
                <p class="text-slate-400 mt-1 text-sm">
                    @if($user->isAdmin()) Minden rögzített napi jelentés @else Azok a jelentések, amelyekhez hozzáférése van @endif
                </p>
            </div>
            <a href="{{ route('security.create') }}"
               class="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Új jelentés
            </a>
        </div>
    </div>

    @if(session('success'))
    <div class="mb-5 px-5 py-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-medium text-emerald-700 flex items-center gap-2">
        <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        {{ session('success') }}
    </div>
    @endif

    {{-- Lista --}}
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        @if($reports->isEmpty())
            <div class="px-6 py-20 text-center">
                <div class="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                </div>
                <p class="text-slate-500 font-medium">
                    @if($user->isAdmin()) Még nincs rögzített napi jelentés.
                    @else Önnek jelenleg nem lett megosztva egyetlen napi jelentés sem.
                    @endif
                </p>
                @if($user->isAdmin())
                <a href="{{ route('security.create') }}" class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors">
                    Első jelentés létrehozása
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>
                @endif
            </div>
        @else
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-100">
                        <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dátum</th>
                        <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Készítette</th>
                        <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Átadás</th>
                        <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Rendkívüli</th>
                        <th class="px-4 py-3 w-16"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @foreach($reports as $report)
                    <tr class="hover:bg-rose-50/30 transition-colors duration-150">
                        <td class="px-6 py-4">
                            <p class="font-bold text-slate-800">{{ $report->report_date->format('Y. m. d.') }}</p>
                            <p class="text-xs text-slate-400 mt-0.5">{{ $report->report_date->locale('hu')->translatedFormat('l') }}</p>
                        </td>
                        <td class="px-4 py-4 text-slate-600 hidden sm:table-cell">{{ $report->prepared_by }}</td>
                        <td class="px-4 py-4 hidden md:table-cell">
                            @if($report->taken_over_from)
                                <span class="text-xs text-slate-500">
                                    <span class="font-medium text-slate-700">{{ $report->taken_over_from }}</span> →
                                    <span class="font-medium text-rose-600">{{ $report->prepared_by }}</span>
                                    @if($report->handover_time)<span class="font-mono text-slate-400"> {{ $report->handover_time }}</span>@endif
                                </span>
                            @else
                                <span class="text-xs text-slate-300">–</span>
                            @endif
                        </td>
                        <td class="px-4 py-4 hidden md:table-cell">
                            @php $cnt = count($report->incidents ?? []); @endphp
                            @if($cnt > 0)
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                                    {{ $cnt }} esemény
                                </span>
                            @else
                                <span class="text-xs text-slate-300">–</span>
                            @endif
                        </td>
                        <td class="px-4 py-4 text-right">
                            <a href="{{ route('security.show', $report) }}"
                               class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-colors">
                                Megnyitás
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @if($reports->hasPages())
            <div class="px-6 py-4 border-t border-slate-100">
                {{ $reports->links() }}
            </div>
            @endif
        @endif
    </div>

</div>
@endsection
