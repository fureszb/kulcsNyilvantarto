@extends('layouts.admin')
@section('title', 'Áttekintés')

@section('content')
<div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
    @foreach([
        ['label' => 'Helyszínek', 'value' => $stats['locations'], 'color' => 'blue', 'icon' => 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'],
        ['label' => 'Mai ellenőrzések', 'value' => $stats['checks_today'], 'color' => 'green', 'icon' => 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'],
        ['label' => 'Összes ellenőrzés', 'value' => $stats['checks_total'], 'color' => 'indigo', 'icon' => 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'],
    ] as $stat)
    <div class="card p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-{{ $stat['color'] }}-50 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-{{ $stat['color'] }}-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $stat['icon'] }}"/>
            </svg>
        </div>
        <div>
            <p class="text-sm text-slate-500 font-medium">{{ $stat['label'] }}</p>
            <p class="text-3xl font-extrabold text-slate-800 leading-none mt-0.5">{{ $stat['value'] }}</p>
        </div>
    </div>
    @endforeach
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <div class="card p-5">
        <h2 class="font-bold text-slate-700 mb-3">Gyors műveletek</h2>
        <div class="space-y-2">
            <a href="{{ route('admin.locations.create') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                </div>
                Új helyszín felvétele
            </a>
            <a href="{{ route('admin.settings.edit') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                <div class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
                </div>
                Email és jelszó beállítások
            </a>
            <a href="{{ route('history.index') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/></svg>
                </div>
                Ellenőrzési előzmények
            </a>
        </div>
    </div>

    <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="font-bold text-slate-700">Legutóbbi ellenőrzések</h2>
            <a href="{{ route('history.index') }}" class="text-xs font-semibold text-blue-600 hover:text-blue-700">Összes →</a>
        </div>
        @if($recentChecks->isEmpty())
            <div class="p-8 text-center text-sm text-slate-400">Még nincs ellenőrzés rögzítve.</div>
        @else
            <div class="divide-y divide-slate-50">
                @foreach($recentChecks as $rc)
                @php $rcTotal = $rc->check_items_count; $rcChecked = $rc->checked_count; $rcDone = $rcTotal > 0 && $rcChecked === $rcTotal; @endphp
                <div class="px-5 py-3 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 {{ $rcDone ? 'bg-green-50' : 'bg-amber-50' }}">
                        @if($rcDone)
                            <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        @else
                            <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"/></svg>
                        @endif
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-slate-800 truncate">{{ $rc->location->name ?? '–' }}</p>
                        <p class="text-xs text-slate-400">{{ $rc->checked_by }} · {{ $rc->created_at->format('m.d H:i') }}</p>
                    </div>
                    <span class="text-xs font-bold {{ $rcDone ? 'text-green-600' : 'text-amber-600' }} shrink-0">
                        {{ $rcChecked }}/{{ $rcTotal }}
                    </span>
                </div>
                @endforeach
            </div>
        @endif
    </div>
</div>
@endsection
