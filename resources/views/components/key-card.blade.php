@props([
    'name'       => 'Megnevezés nélkül',
    'type'       => 'key',
    'status'     => 'available',
    'identifier' => null,
    'assignedTo' => null,
    'since'      => null,
    'location'   => null,
])

@php
$statusMap = [
    'available' => [
        'label' => 'Elérhető',
        'dot'   => 'bg-emerald-500',
        'badge' => 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'from'  => 'from-emerald-400/40',
        'pulse' => false,
        'meta'  => ['color' => 'text-emerald-600', 'icon' => 'check-circle', 'text' => 'Elvihető'],
    ],
    'assigned' => [
        'label' => 'Kiosztva',
        'dot'   => 'bg-blue-500',
        'badge' => 'bg-blue-50 text-blue-700 border-blue-200',
        'from'  => 'from-blue-400/40',
        'pulse' => true,
        'meta'  => null,
    ],
    'lost' => [
        'label' => 'Elveszett',
        'dot'   => 'bg-red-500',
        'badge' => 'bg-red-50 text-red-700 border-red-200',
        'from'  => 'from-red-400/40',
        'pulse' => false,
        'meta'  => ['color' => 'text-red-600', 'icon' => 'alert-triangle', 'text' => 'Azonnali intézkedés szükséges'],
    ],
    'maintenance' => [
        'label' => 'Karbantartás',
        'dot'   => 'bg-amber-500',
        'badge' => 'bg-amber-50 text-amber-700 border-amber-200',
        'from'  => 'from-amber-400/40',
        'pulse' => false,
        'meta'  => ['color' => 'text-amber-600', 'icon' => 'tool', 'text' => 'Karbantartás alatt'],
    ],
];

$cfg = $statusMap[$status] ?? $statusMap['available'];
@endphp

<div class="group relative overflow-hidden rounded-2xl bg-white border border-slate-200
            p-5 cursor-pointer select-none
            transition-all duration-300 ease-out
            hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60
            motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.01]"
     role="article"
     aria-label="{{ $name }} – {{ $cfg['label'] }}">

    {{-- Státusz-színű felső accent vonal --}}
    <div aria-hidden="true"
         class="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r {{ $cfg['from'] }} to-transparent
                opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>

    {{-- Shimmer sweep --}}
    <div aria-hidden="true"
         class="absolute inset-0 -translate-x-full pointer-events-none z-10
                bg-gradient-to-r from-transparent via-slate-100/60 to-transparent
                motion-safe:group-hover:translate-x-full
                motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out"></div>

    {{-- ── Fejléc: ikon + azonosító + státusz badge ── --}}
    <div class="flex items-start justify-between mb-4">

        <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl
                        bg-slate-100 border border-slate-200
                        transition-colors duration-300 group-hover:border-slate-300 group-hover:bg-slate-50">
                @if($type === 'card')
                    <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                @else
                    <svg class="w-5 h-5 text-slate-500
                                transition-transform duration-300 ease-out
                                motion-safe:group-hover:rotate-[20deg]"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                @endif
            </div>

            @if($identifier)
                <span class="text-[10px] font-mono tracking-widest text-slate-400 uppercase truncate">
                    {{ $identifier }}
                </span>
            @endif
        </div>

        {{-- Státusz badge --}}
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                    shrink-0 ml-2 {{ $cfg['badge'] }}">
            <span class="relative flex h-1.5 w-1.5 shrink-0">
                @if($cfg['pulse'])
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 {{ $cfg['dot'] }}"
                          aria-hidden="true"></span>
                @endif
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 {{ $cfg['dot'] }}"></span>
            </span>
            {{ $cfg['label'] }}
        </div>
    </div>

    {{-- ── Tétel neve ── --}}
    <h3 class="text-slate-800 font-semibold text-base leading-tight truncate
               transition-colors duration-200 group-hover:text-slate-900">
        {{ $name }}
    </h3>

    {{-- ── Meta adatok ── --}}
    <div class="mt-3 space-y-1.5 text-xs">

        @if($status === 'assigned' && $assignedTo)
            <div class="flex items-center gap-2 text-slate-500">
                <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span class="text-slate-700 font-medium truncate">{{ $assignedTo }}</span>
                @if($since)
                    <span class="text-slate-300 shrink-0">·</span>
                    <span class="shrink-0 text-slate-400">
                        {{ $since instanceof \Carbon\Carbon ? $since->diffForHumans() : $since }}
                    </span>
                @endif
            </div>
        @elseif($cfg['meta'])
            <div class="flex items-center gap-2 {{ $cfg['meta']['color'] }}">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    @if($cfg['meta']['icon'] === 'check-circle')
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    @elseif($cfg['meta']['icon'] === 'alert-triangle')
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    @elseif($cfg['meta']['icon'] === 'tool')
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    @endif
                </svg>
                <span>{{ $cfg['meta']['text'] }}</span>
            </div>
        @endif

        @if($location)
            <div class="flex items-center gap-2 text-slate-400">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="truncate">{{ $location }}</span>
            </div>
        @endif
    </div>

    {{-- RFID antenna dekoráció --}}
    @if($type === 'card')
        <div aria-hidden="true"
             class="absolute bottom-3 right-3 pointer-events-none rotate-90
                    opacity-[0.06] group-hover:opacity-[0.15]
                    transition-opacity duration-500">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
                 class="text-slate-400">
                <path d="M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                <path d="M4.222 12.222c4.296-4.296 11.26-4.296 15.556 0"/>
                <path d="M7.05 15.05c2.734-2.734 7.166-2.734 9.9 0"/>
                <circle cx="12" cy="19" r="1" fill="currentColor"/>
            </svg>
        </div>
    @endif

    {{-- Extra slot tartalom (pl. akció gombok) --}}
    @if($slot->isNotEmpty())
        <div class="mt-4 pt-4 border-t border-slate-100">
            {{ $slot }}
        </div>
    @endif
</div>
