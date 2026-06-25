@extends('layouts.pm')
@section('title', 'Napi Jelentések')

@section('content')
<div class="max-w-6xl mx-auto" x-data="pmSecurityFilter()">

    {{-- Hero --}}
    <div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div class="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
             style="background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:32px 32px;"></div>
        <div class="relative px-8 py-8 flex items-center justify-between gap-6">
            <div>
                <p class="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Property Manager · Biztonsági Szolgálat</p>
                <h1 class="text-3xl font-extrabold text-white tracking-tight">Napi Jelentések</h1>
                <p class="text-slate-400 mt-1 text-sm">Összes vagyonőr napi szolgálati lapja</p>
            </div>
            <div class="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                <svg class="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
        </div>
    </div>

    {{-- Szűrők --}}
    <form method="GET" action="{{ route('pm.security') }}" class="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-5 mb-6">
        <div class="flex flex-wrap items-end gap-4">
            <div class="flex-1 min-w-[160px]">
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dátumtól</label>
                <input type="date" name="date_from" value="{{ request('date_from') }}"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-rose-400 focus:bg-white focus:outline-none transition">
            </div>
            <div class="flex-1 min-w-[160px]">
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dátumig</label>
                <input type="date" name="date_to" value="{{ request('date_to') }}"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-rose-400 focus:bg-white focus:outline-none transition">
            </div>
            <div class="flex items-center gap-3 pb-0.5">
                <label class="flex items-center gap-2.5 cursor-pointer select-none group">
                    <input type="checkbox" name="incidents_only" value="1"
                           {{ request('incidents_only') ? 'checked' : '' }}
                           class="w-4.5 h-4.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer">
                    <span class="text-sm font-medium text-slate-700 group-hover:text-rose-600 transition-colors">Csak rendkívüli eseménnyel</span>
                </label>
            </div>
            <div class="flex items-center gap-2 pb-0.5">
                <button type="submit"
                        class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/></svg>
                    Szűrés
                </button>
                @if(request()->hasAny(['date_from','date_to','incidents_only']))
                <a href="{{ route('pm.security') }}"
                   class="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    Törlés
                </a>
                @endif
            </div>
        </div>
        @if(request()->hasAny(['date_from','date_to','incidents_only']))
        <div class="mt-3 flex flex-wrap gap-2">
            @if(request('date_from'))
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                Tól: {{ \Carbon\Carbon::parse(request('date_from'))->format('Y. m. d.') }}
            </span>
            @endif
            @if(request('date_to'))
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                Ig: {{ \Carbon\Carbon::parse(request('date_to'))->format('Y. m. d.') }}
            </span>
            @endif
            @if(request('incidents_only'))
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                Csak rendkívüli eseménnyel
            </span>
            @endif
        </div>
        @endif
    </form>

    {{-- Találatok --}}
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        @if($reports->isEmpty())
        <div class="px-6 py-20 text-center">
            <div class="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
            </div>
            <p class="text-slate-500 font-medium">
                @if(request()->hasAny(['date_from','date_to','incidents_only']))
                    Nincs a szűrőnek megfelelő napi jelentés.
                @else
                    Még nem lett napi jelentés rögzítve.
                @endif
            </p>
        </div>
        @else
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-100">
                        <th class="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dátum</th>
                        <th class="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Készítette</th>
                        <th class="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Átadás-átvétel</th>
                        <th class="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Mai csapat</th>
                        <th class="text-center px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rendkívüli</th>
                        <th class="px-4 py-3.5 w-24"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    @foreach($reports as $report)
                    <tr class="hover:bg-rose-50/20 transition-colors duration-100">
                        <td class="px-6 py-4">
                            <p class="font-bold text-slate-800">{{ $report->report_date->format('Y. m. d.') }}</p>
                            <p class="text-xs text-slate-400 mt-0.5">{{ $report->report_date->locale('hu')->translatedFormat('l') }}</p>
                        </td>
                        <td class="px-4 py-4">
                            <span class="font-medium text-slate-700">{{ $report->prepared_by }}</span>
                        </td>
                        <td class="px-4 py-4 hidden md:table-cell">
                            @if($report->taken_over_from)
                            <div class="flex items-center gap-1.5 text-sm">
                                <span class="text-slate-500 text-xs">{{ $report->taken_over_from }}</span>
                                <svg class="w-3.5 h-3.5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                <span class="font-semibold text-rose-600 text-xs">{{ $report->prepared_by }}</span>
                                @if($report->handover_time)
                                <span class="font-mono text-slate-400 text-xs">{{ $report->handover_time }}</span>
                                @endif
                            </div>
                            @else
                            <span class="text-xs text-slate-300">–</span>
                            @endif
                        </td>
                        <td class="px-4 py-4 hidden lg:table-cell">
                            @if(!empty($report->service_members))
                            <div class="flex flex-wrap gap-1">
                                @foreach(array_slice($report->service_members, 0, 3) as $m)
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600 font-medium">{{ $m['nev'] ?? '–' }}</span>
                                @endforeach
                                @if(count($report->service_members) > 3)
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-400">+{{ count($report->service_members) - 3 }}</span>
                                @endif
                            </div>
                            @else
                            <span class="text-xs text-slate-300">–</span>
                            @endif
                        </td>
                        <td class="px-4 py-4 text-center">
                            @php $cnt = count($report->incidents ?? []); @endphp
                            @if($cnt > 0)
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                {{ $cnt }}
                            </span>
                            @else
                            <span class="text-xs text-slate-300">–</span>
                            @endif
                        </td>
                        <td class="px-4 py-4 text-right">
                            <a href="{{ route('security.show', $report) }}"
                               class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-colors whitespace-nowrap">
                                Megnyitás
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @if($reports->hasPages())
        <div class="px-6 py-4 border-t border-slate-100">
            {{ $reports->links() }}
        </div>
        @endif
        <div class="px-6 py-3 border-t border-slate-50 bg-slate-50/50">
            <p class="text-xs text-slate-400">Összesen: <strong class="text-slate-600">{{ $reports->total() }}</strong> napi jelentés</p>
        </div>
        @endif
    </div>

</div>

<script>
function pmSecurityFilter() {
    return {};
}
</script>
@endsection
