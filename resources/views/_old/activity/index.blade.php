@extends('layouts.admin')
@section('title', 'Tevékenységnapló')

@section('content')

{{-- Header --}}
<div class="mb-6">
    <h1 class="text-2xl font-extrabold text-slate-800">Tevékenységnapló</h1>
    <p class="text-sm text-slate-500 mt-0.5">Napi szűrő – ellenőrzések, oktatások, vizsgák</p>
</div>

{{-- Filter bar --}}
<form method="GET" action="{{ route('activity.index') }}" class="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6">
    <div class="flex flex-wrap items-end gap-4">
        <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5">Dátum</label>
            <input type="date" name="date" value="{{ $date }}"
                   class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none transition">
        </div>
        <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5">Típus</label>
            <select name="type" class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none transition">
                <option value="all"                 {{ $type === 'all'                 ? 'selected' : '' }}>Minden</option>
                <option value="check.completed"    {{ $type === 'check.completed'    ? 'selected' : '' }}>Ellenőrzés</option>
                <option value="training.completed" {{ $type === 'training.completed' ? 'selected' : '' }}>Oktatás</option>
                <option value="exam.completed"     {{ $type === 'exam.completed'     ? 'selected' : '' }}>Vizsga</option>
                <option value="security.created"   {{ $type === 'security.created'   ? 'selected' : '' }}>Napi jelentés</option>
                <option value="security.updated"   {{ $type === 'security.updated'   ? 'selected' : '' }}>Jelentés módosítva</option>
                <option value="shift_note.created" {{ $type === 'shift_note.created' ? 'selected' : '' }}>Váltóüzenet</option>
                <option value="shift_note.updated" {{ $type === 'shift_note.updated' ? 'selected' : '' }}>Váltóüzenet módosítva</option>
                <option value="shift_note.deleted" {{ $type === 'shift_note.deleted' ? 'selected' : '' }}>Váltóüzenet törölve</option>
                <option value="pm_message.sent"    {{ $type === 'pm_message.sent'    ? 'selected' : '' }}>PM üzenet</option>
                <option value="pm_message.updated" {{ $type === 'pm_message.updated' ? 'selected' : '' }}>PM üzenet módosítva</option>
                <option value="pm_message.deleted" {{ $type === 'pm_message.deleted' ? 'selected' : '' }}>PM üzenet törölve</option>
                <option value="user.login"         {{ $type === 'user.login'         ? 'selected' : '' }}>Bejelentkezés</option>
                <option value="user.logout"        {{ $type === 'user.logout'        ? 'selected' : '' }}>Kijelentkezés</option>
            </select>
        </div>
        <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5">Dolgozó</label>
            <select name="user_id" class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none transition">
                <option value="">Mindenki</option>
                @foreach($workers as $w)
                    <option value="{{ $w->id }}" {{ (string)$userId === (string)$w->id ? 'selected' : '' }}>{{ $w->name }}</option>
                @endforeach
            </select>
        </div>
        <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
            Szűrés
        </button>
        @if($date !== now()->toDateString() || $type !== 'all' || $userId)
            <a href="{{ route('activity.index') }}" class="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors">
                Visszaállítás
            </a>
        @endif
    </div>
</form>

{{-- Results --}}
<div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <h2 class="font-bold text-slate-800">
                {{ \Carbon\Carbon::parse($date)->locale('hu')->translatedFormat('Y. F j., l') }}
            </h2>
        </div>
        <span class="text-sm text-slate-400 font-medium">{{ $logs->count() }} esemény</span>
    </div>

    @if($logs->isEmpty())
        <div class="px-6 py-16 text-center">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
            </div>
            <p class="text-slate-400 text-sm">Ezen a napon nem történt naplózott esemény.</p>
        </div>
    @else
        <div class="divide-y divide-slate-100">
            @foreach($logs as $log)
            @php
                $colorMap = [
                    'check.completed'    => ['dot' => 'bg-blue-400',   'badge' => 'bg-blue-50 text-blue-700'],
                    'training.completed' => ['dot' => 'bg-indigo-400', 'badge' => 'bg-indigo-50 text-indigo-700'],
                    'exam.completed'     => ['dot' => 'bg-amber-400',  'badge' => 'bg-amber-50 text-amber-700'],
                    'security.created'   => ['dot' => 'bg-rose-400',   'badge' => 'bg-rose-50 text-rose-700'],
                    'security.updated'   => ['dot' => 'bg-rose-300',   'badge' => 'bg-rose-50 text-rose-600'],
                    'shift_note.created' => ['dot' => 'bg-teal-400',   'badge' => 'bg-teal-50 text-teal-700'],
                    'shift_note.updated' => ['dot' => 'bg-teal-300',   'badge' => 'bg-teal-50 text-teal-600'],
                    'shift_note.deleted' => ['dot' => 'bg-teal-200',   'badge' => 'bg-teal-50 text-teal-500'],
                    'pm_message.sent'    => ['dot' => 'bg-orange-400', 'badge' => 'bg-orange-50 text-orange-700'],
                    'pm_message.updated' => ['dot' => 'bg-orange-300', 'badge' => 'bg-orange-50 text-orange-600'],
                    'pm_message.deleted' => ['dot' => 'bg-orange-200', 'badge' => 'bg-orange-50 text-orange-500'],
                    'user.login'         => ['dot' => 'bg-slate-300',  'badge' => 'bg-slate-100 text-slate-600'],
                    'user.logout'        => ['dot' => 'bg-slate-200',  'badge' => 'bg-slate-100 text-slate-500'],
                ];
                $c = $colorMap[$log->event_type] ?? $colorMap['user.login'];
                $label = match($log->event_type) {
                    'check.completed'    => 'Ellenőrzés',
                    'training.completed' => 'Oktatás',
                    'exam.completed'     => 'Vizsga',
                    'security.created'   => 'Napi jelentés',
                    'security.updated'   => 'Jelentés módosítva',
                    'shift_note.created' => 'Váltóüzenet',
                    'shift_note.updated' => 'Váltóüzenet módosítva',
                    'shift_note.deleted' => 'Váltóüzenet törölve',
                    'pm_message.sent'    => 'PM üzenet',
                    'pm_message.updated' => 'PM üzenet módosítva',
                    'pm_message.deleted' => 'PM üzenet törölve',
                    'user.login'         => 'Bejelentkezés',
                    'user.logout'        => 'Kijelentkezés',
                    default              => $log->event_type,
                };
            @endphp
            <div x-data="{ open: false }">
                <button type="button" @click="open = !open"
                        class="w-full text-left px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                    <div class="w-2 h-2 rounded-full shrink-0 mt-2 {{ $c['dot'] }}"></div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap mb-0.5">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold {{ $c['badge'] }}">{{ $label }}</span>
                            <span class="text-sm font-semibold text-slate-700">{{ $log->user_name }}</span>
                        </div>
                        <p class="text-sm text-slate-600">{{ $log->description }}</p>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                        <span class="text-xs text-slate-400 font-mono">{{ $log->occurred_at->format('H:i:s') }}</span>
                        @if($log->metadata)
                        <svg class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="open ? 'rotate-180' : ''"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                        @endif
                    </div>
                </button>
                @if($log->metadata)
                <div x-show="open" x-cloak x-transition:enter="transition ease-out duration-150"
                     x-transition:enter-start="opacity-0 -translate-y-1" x-transition:enter-end="opacity-100 translate-y-0"
                     class="px-6 pb-4 ml-6">
                    <div class="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-2">
                        @php $meta = $log->metadata; @endphp

                        @if(isset($meta['content']) && !isset($meta['old_content']))
                        <div>
                            <p class="font-semibold text-slate-500 mb-1">Tartalom</p>
                            <p class="text-slate-700 whitespace-pre-line leading-relaxed">{{ $meta['content'] }}</p>
                        </div>
                        @endif

                        @if(isset($meta['old_content']) && isset($meta['new_content']))
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="rounded-lg border border-rose-100 bg-rose-50 p-3">
                                <p class="font-semibold text-rose-500 mb-1">Előtte</p>
                                <p class="text-slate-700 whitespace-pre-line leading-relaxed">{{ $meta['old_content'] }}</p>
                            </div>
                            <div class="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                                <p class="font-semibold text-emerald-600 mb-1">Utána</p>
                                <p class="text-slate-700 whitespace-pre-line leading-relaxed">{{ $meta['new_content'] }}</p>
                            </div>
                        </div>
                        @if(isset($meta['old_date']) && $meta['old_date'] !== $meta['new_date'])
                        <p class="text-slate-500">Dátum: <span class="line-through text-rose-500">{{ $meta['old_date'] }}</span> → <span class="text-emerald-600">{{ $meta['new_date'] }}</span></p>
                        @endif
                        @endif

                        @if(isset($meta['note_date']) && !isset($meta['old_date']))
                        <p class="text-slate-500">Dátum: <span class="font-medium text-slate-700">{{ $meta['note_date'] }}</span></p>
                        @endif

                        @if(isset($meta['score']) && isset($meta['total']))
                        <p class="text-slate-500">Eredmény: <span class="font-medium text-slate-700">{{ $meta['score'] }}/{{ $meta['total'] }} ({{ $meta['total'] > 0 ? round($meta['score']/$meta['total']*100) : 0 }}%)</span></p>
                        @endif

                        @if(isset($meta['send_to_all']))
                        <p class="text-slate-500">Célzás:
                            @if($meta['send_to_all'])
                                <span class="font-medium text-slate-700">Mindenki</span>
                            @else
                                <span class="font-medium text-slate-700">{{ $meta['recipient_count'] ?? '?' }} kiválasztott felhasználó</span>
                            @endif
                        </p>
                        @endif

                        @if(isset($meta['old_send_to_all']) && isset($meta['new_send_to_all']) && $meta['old_send_to_all'] !== $meta['new_send_to_all'])
                        <p class="text-slate-500">Célzás módosult: <span class="text-rose-500">{{ $meta['old_send_to_all'] ? 'Mindenki' : 'Kiválasztottak' }}</span> → <span class="text-emerald-600">{{ $meta['new_send_to_all'] ? 'Mindenki' : 'Kiválasztottak' }}</span></p>
                        @endif

                        @if(isset($meta['checked']) && isset($meta['total']))
                        <p class="text-slate-500">Ellenőrzött: <span class="font-medium text-slate-700">{{ $meta['checked'] }}/{{ $meta['total'] }} tétel</span></p>
                        @endif

                        @if(!empty($meta['report_date']))
                        <p class="text-slate-500">Jelentés dátuma: <span class="font-medium text-slate-700">{{ $meta['report_date'] }}</span></p>
                        @endif
                    </div>
                </div>
                @endif
            </div>
            @endforeach
        </div>
    @endif
</div>

@endsection
