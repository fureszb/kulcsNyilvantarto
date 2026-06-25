@extends('layouts.app')
@section('title', 'Váltóüzenetek')

@section('content')
<div class="max-w-7xl mx-auto space-y-6">

    {{-- ─── HERO ──────────────────────────────────────────────────────────── --}}
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -left-12 w-44 h-44 bg-cyan-700/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
             style="background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:32px 32px;"></div>
        <div class="relative px-4 py-6 sm:px-8 sm:py-8 flex items-start justify-between gap-6 flex-wrap">
            <div>
                <p class="text-xs font-bold text-teal-400 uppercase tracking-widest mb-1.5">Privát csatorna · Csak kollégák</p>
                <h1 class="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">Váltóüzenetek</h1>
                <div class="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-400">
                    <span class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                        {{ $notes->total() }} bejegyzés összesen
                    </span>
                    <span class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        <span class="text-rose-400 font-semibold">PM nem látja</span>
                    </span>
                </div>
            </div>
            <a href="{{ route('home') }}"
               class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                Vissza
            </a>
        </div>
    </div>

    {{-- ─── ÚJ BEJEGYZÉS ────────────────────────────────────────────────── --}}
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm"
         x-data="{ chars: {{ strlen(old('content', '')) }}, maxChars: 1000 }">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
            </div>
            <h2 class="font-bold text-slate-800">Bejegyzés rögzítése</h2>
            <span class="ml-auto text-xs text-slate-400" x-text="chars + ' / ' + maxChars"></span>
        </div>
        <form method="POST" action="{{ route('notes.store') }}" class="p-5">
            @csrf
            <div class="flex items-start gap-3 mb-4">
                {{-- Saját avatar --}}
                <div class="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5">
                    {{ mb_substr(auth('tenant')->user()->name, 0, 1) }}
                </div>
                <div class="flex-1">
                    <p class="text-sm font-semibold text-slate-700 mb-1.5">{{ auth('tenant')->user()->name }}</p>
                    <textarea name="content" rows="3"
                              required maxlength="1000"
                              @input="chars = $event.target.value.length"
                              placeholder="Mit szeretnél átadni a következő műszaknak?"
                              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-teal-400 focus:bg-white focus:outline-none transition resize-none leading-relaxed">{{ old('content') }}</textarea>
                    @error('content')<p class="text-xs text-rose-500 mt-1">{{ $message }}</p>@enderror
                </div>
            </div>
            <div class="flex items-center justify-between gap-3 pl-12">
                <div class="flex items-center gap-1.5 text-xs text-slate-400"
                     x-data="{
                         now: new Date(),
                         init() { setInterval(() => this.now = new Date(), 10000) },
                         fmt(d) {
                             return d.toLocaleDateString('hu-HU', {year:'numeric',month:'long',day:'numeric',weekday:'long'})
                                  + ' · '
                                  + d.toLocaleTimeString('hu-HU', {hour:'2-digit',minute:'2-digit'});
                         }
                     }">
                    <svg class="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span x-text="fmt(now)" class="font-medium text-slate-500"></span>
                </div>
                <button type="submit"
                        class="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                    Közzététel
                </button>
            </div>
        </form>
    </div>

    {{-- ─── DÁTUM SZŰRŐ ────────────────────────────────────────────────── --}}
    @php
        $isFilterToday = $filterDate === today()->toDateString();
        $filterCarbon  = \Carbon\Carbon::parse($filterDate);
        $filterLabel   = $isFilterToday ? 'Ma' : ($filterCarbon->isYesterday() ? 'Tegnap' : $filterCarbon->locale('hu')->translatedFormat('Y. F j., l'));
    @endphp
    <form method="GET" action="{{ route('notes.index') }}"
          class="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-3.5 flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 shrink-0">
            <svg class="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
            </svg>
            <label for="date-filter" class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dátum szűrő</label>
        </div>
        <input type="date" id="date-filter" name="date" value="{{ $filterDate }}"
               onchange="this.form.submit()"
               class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 focus:border-teal-400 focus:bg-white focus:outline-none transition cursor-pointer">
        <div class="flex items-center gap-2">
            <a href="{{ route('notes.index') }}"
               class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                      {{ $isFilterToday ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-teal-50 hover:text-teal-700' }}">
                Ma
            </a>
            <a href="{{ route('notes.index', ['date' => today()->subDay()->toDateString()]) }}"
               class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                      {{ $filterCarbon->isYesterday() ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-teal-50 hover:text-teal-700' }}">
                Tegnap
            </a>
        </div>
        <span class="ml-auto text-xs text-slate-400">
            <span class="font-semibold text-slate-600">{{ $notes->total() }}</span> bejegyzés · {{ $filterLabel }}
        </span>
    </form>

    {{-- ─── ÜZENETEK FEED ───────────────────────────────────────────────── --}}
    @if($notes->isEmpty())
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-16 text-center">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
        </div>
        <p class="text-base font-semibold text-slate-600">Nincs bejegyzés erre a napra</p>
        <p class="text-sm text-slate-400 mt-1">{{ $filterLabel }} · {{ $filterDate }}</p>
    </div>
    @else

    <div class="space-y-3">
        @foreach($notes as $note)
        @php $isOwn = $note->user_id === $user->id; @endphp
        <div x-data="{
                editing: false,
                content: @js($note->content),
                noteDate: '{{ $note->note_date->format('Y-m-d') }}'
             }"
             class="group bg-white border rounded-2xl shadow-sm transition-shadow hover:shadow-md
                    {{ $isOwn ? 'border-teal-200' : 'border-slate-200' }}">

            {{-- ── VIEW MODE ── --}}
            <div x-show="!editing" class="px-5 py-4">
                <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                                {{ $isOwn ? 'bg-teal-600 text-white' : 'bg-slate-100 border border-slate-200 text-slate-600' }}">
                        {{ mb_substr($note->user->name ?? '?', 0, 1) }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap mb-0.5">
                            <span class="text-sm font-semibold text-slate-800">{{ $note->user->name ?? 'Ismeretlen' }}</span>
                            @if($isOwn)
                            <span class="text-[10px] font-bold bg-teal-100 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Te</span>
                            @endif
                            @if($note->user && $note->user->isAdmin())
                            <span class="text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Admin</span>
                            @endif
                            <span class="text-xs text-slate-400 ml-auto">{{ $note->created_at->locale('hu')->translatedFormat('H:i') }}</span>
                        </div>
                        <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line" x-text="content"></p>
                    </div>
                </div>
            </div>

            {{-- ── EDIT MODE (csak saját) ── --}}
            @if($isOwn)
            <div x-show="editing" x-cloak class="px-5 py-4">
                <form method="POST" action="{{ route('notes.update', $note) }}">
                    @csrf @method('PUT')
                    <textarea name="content" rows="4" required maxlength="1000"
                              x-model="content"
                              class="w-full rounded-xl border border-teal-200 bg-teal-50/30 px-3.5 py-2.5 text-sm text-slate-700 focus:border-teal-400 focus:bg-white focus:outline-none transition resize-none leading-relaxed mb-3"></textarea>
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-2">
                            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dátum</label>
                            <input type="date" name="note_date" x-model="noteDate" required
                                   class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-teal-400 focus:outline-none transition">
                        </div>
                        <div class="flex items-center gap-2">
                            <button type="button" @click="editing = false; content = @js($note->content); noteDate = '{{ $note->note_date->format('Y-m-d') }}'"
                                    class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                                Mégse
                            </button>
                            <button type="submit"
                                    class="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                Mentés
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            @endif

            {{-- ── AKCIÓ SÁV ── --}}
            @if($isOwn)
            <div class="px-5 py-2.5 border-t border-teal-100 bg-teal-50/40 flex items-center justify-end gap-2
                        opacity-0 group-hover:opacity-100 transition-opacity" x-show="!editing">
                <button @click="editing = true"
                        class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-teal-600 transition-colors cursor-pointer">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Szerkesztés
                </button>
                <span class="text-slate-200">|</span>
                <form method="POST" action="{{ route('notes.destroy', $note) }}"
                      onsubmit="return confirm('Biztosan törlöd ezt a bejegyzést?')">
                    @csrf @method('DELETE')
                    <button type="submit"
                            class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Törlés
                    </button>
                </form>
            </div>
            @elseif($user->isAdmin())
            <div class="px-5 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end
                        opacity-0 group-hover:opacity-100 transition-opacity">
                <form method="POST" action="{{ route('notes.destroy', $note) }}"
                      onsubmit="return confirm('Biztosan törlöd ezt a bejegyzést?')">
                    @csrf @method('DELETE')
                    <button type="submit"
                            class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Törlés (admin)
                    </button>
                </form>
            </div>
            @endif

        </div>
        @endforeach
    </div>

    {{-- Lapozó --}}
    @if($notes->hasPages())
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between gap-4">
        <span class="text-sm text-slate-400">{{ $notes->firstItem() }}–{{ $notes->lastItem() }} / {{ $notes->total() }} bejegyzés</span>
        {{ $notes->links() }}
    </div>
    @endif

    @endif

</div>
@endsection
