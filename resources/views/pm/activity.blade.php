@extends('layouts.pm')
@section('title', 'Tevékenységnapló')

@section('content')

{{-- Hero --}}
<div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
    <div class="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
         style="background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:32px 32px;"></div>
    <div class="relative px-8 py-8 flex items-center justify-between gap-6">
        <div>
            <p class="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Property Manager · Napló</p>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">Tevékenységnapló</h1>
            <p class="text-slate-400 mt-1 text-sm">Ellenőrzések, oktatások, vizsgák naplója</p>
        </div>
        <div class="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
            <svg class="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
        </div>
    </div>
</div>

{{-- Szűrők --}}
<div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
    <form method="GET" action="{{ route('pm.activity') }}" class="px-8 py-5">
        <div class="flex flex-wrap items-end gap-4">
            <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dátum</label>
                <input type="date" name="date" value="{{ $date }}"
                       class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition">
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Típus</label>
                <select name="type" class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition">
                    <option value="all"                 {{ $type === 'all'                 ? 'selected' : '' }}>Minden típus</option>
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
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dolgozó</label>
                <select name="user_id" class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition">
                    <option value="">Mindenki</option>
                    @foreach($workers as $w)
                        <option value="{{ $w->id }}" {{ (string)$userId === (string)$w->id ? 'selected' : '' }}>{{ $w->name }}</option>
                    @endforeach
                </select>
            </div>
            <button type="submit"
                    class="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                Szűrés
            </button>
            @if($date !== now()->toDateString() || $type !== 'all' || $userId)
                <a href="{{ route('pm.activity') }}"
                   class="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors">
                    Visszaállítás
                </a>
            @endif
        </div>
    </form>
</div>

{{-- Naplóbejegyzések --}}
<div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h2 class="font-bold text-slate-800">
                {{ \Carbon\Carbon::parse($date)->locale('hu')->translatedFormat('Y. F j., l') }}
            </h2>
        </div>
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
            {{ $logs->count() }} esemény
        </span>
    </div>

    @if($logs->isEmpty())
        <div class="px-6 py-16 text-center">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
            </div>
            <p class="text-slate-400 text-sm font-medium">Ezen a napon nem történt naplózott esemény.</p>
        </div>
    @else
        <div class="overflow-x-auto">
            <table class="w-full text-sm min-w-[540px]">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-100">
                        <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Idő</th>
                        <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-36">Típus</th>
                        <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Dolgozó</th>
                        <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Leírás</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
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
                            'user.login'         => ['dot' => 'bg-slate-300',  'badge' => 'bg-slate-100 text-slate-500'],
                            'user.logout'        => ['dot' => 'bg-slate-200',  'badge' => 'bg-slate-100 text-slate-400'],
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
                    <tr class="hover:bg-amber-50/40 transition-colors duration-150">
                        <td class="px-6 py-3.5 font-mono text-xs text-slate-400 whitespace-nowrap">
                            {{ $log->occurred_at->format('H:i:s') }}
                        </td>
                        <td class="px-4 py-3.5">
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold {{ $c['badge'] }}">
                                <span class="w-1.5 h-1.5 rounded-full {{ $c['dot'] }}"></span>
                                {{ $label }}
                            </span>
                        </td>
                        <td class="px-4 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                            {{ $log->user_name }}
                        </td>
                        <td class="px-4 py-3.5 text-slate-600">
                            {{ $log->description }}
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif
</div>

@endsection
