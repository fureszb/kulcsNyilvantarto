@extends('layouts.pm')
@section('title', 'Üzenetek')

@section('content')
<div class="max-w-6xl mx-auto space-y-6" x-data="{
    sendToAll: true,
    delModal: { open: false, formEl: null },
    confirmDelete(formEl) { this.delModal.formEl = formEl; this.delModal.open = true; }
}">

    {{-- ─── HERO ──────────────────────────────────────────────────────────── --}}
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div class="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
             style="background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:32px 32px;"></div>
        <div class="relative px-8 py-8 flex items-center justify-between gap-6">
            <div>
                <p class="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Property Manager · Kommunikáció</p>
                <h1 class="text-3xl font-extrabold text-white tracking-tight">Üzenetek</h1>
                <div class="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-400">
                    <span class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        {{ $messages->total() }} elküldött üzenet
                    </span>
                    <span class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        {{ $workers->count() }} aktív felhasználó
                    </span>
                </div>
            </div>
            <div class="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                <svg class="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
        </div>
    </div>

    {{-- ─── ÚJ ÜZENET FORM ─────────────────────────────────────────────── --}}
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
            </div>
            <h2 class="font-bold text-slate-800">Új üzenet küldése</h2>
        </div>
        <form method="POST" action="{{ route('pm.messages.store') }}" class="p-6 space-y-5">
            @csrf

            {{-- Célzás --}}
            <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kinek szól?</label>
                <div class="flex gap-4 flex-wrap">
                    <label class="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors
                                  {{ old('send_to_all', '1') == '1' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-amber-200 hover:bg-amber-50' }}">
                        <input type="radio" name="send_to_all" value="1" x-model.number="sendToAll" class="text-amber-600 cursor-pointer">
                        <div>
                            <p class="text-sm font-semibold text-slate-800">Mindenkinek</p>
                            <p class="text-xs text-slate-400">{{ $workers->count() }} fő</p>
                        </div>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors
                                  {{ old('send_to_all', '1') != '1' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-amber-200 hover:bg-amber-50' }}">
                        <input type="radio" name="send_to_all" value="0" x-model.number="sendToAll" class="text-amber-600 cursor-pointer">
                        <div>
                            <p class="text-sm font-semibold text-slate-800">Kiválasztott felhasználóknak</p>
                            <p class="text-xs text-slate-400">Egyéni kiválasztás</p>
                        </div>
                    </label>
                </div>
            </div>

            {{-- Felhasználók kiválasztása --}}
            <div x-show="!sendToAll" x-cloak>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Felhasználók kiválasztása</label>
                @if($workers->isEmpty())
                    <p class="text-sm text-slate-400 italic">Nincs aktív felhasználó.</p>
                @else
                @php
                    $workerPickerJson = $workers->map(fn($w) => [
                        'id'       => $w->id,
                        'name'     => $w->name,
                        'is_admin' => $w->isAdmin(),
                    ])->values()->toJson();
                @endphp
                <div x-data="{
                        search: '',
                        users: {{ $workerPickerJson }},
                        get filtered() {
                            const q = this.search.toLowerCase();
                            return q ? this.users.filter(u => u.name.toLowerCase().includes(q)) : this.users;
                        }
                     }">
                    {{-- Keresőmező --}}
                    <div class="flex items-center gap-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-amber-400 focus-within:bg-white transition mb-0">
                        <svg class="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <input type="text" x-model="search" placeholder="Keresés névre…" autocomplete="off"
                               class="flex-1 py-2.5 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none">
                        <button type="button" x-show="search.length > 0" x-cloak @click="search = ''"
                                class="text-slate-300 hover:text-slate-500 transition shrink-0 cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    {{-- Fejléc --}}
                    <div class="px-3 py-1.5 border-x border-t border-slate-200 bg-slate-50 flex items-center justify-between mt-2 rounded-t-xl">
                        <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider"
                              x-text="search ? 'Találatok' : 'Összes felhasználó'"></span>
                        <span class="text-[10px] text-slate-400" x-text="filtered.length + ' fő'"></span>
                    </div>
                    {{-- Lista --}}
                    <div class="border border-slate-200 rounded-b-xl overflow-hidden max-h-56 overflow-y-auto">
                        <template x-for="u in filtered" :key="u.id">
                            <label class="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-white cursor-pointer hover:bg-amber-50 transition-colors last:border-b-0">
                                <input type="checkbox" name="user_ids[]" :value="u.id"
                                       class="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer">
                                <span class="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0"
                                      x-text="u.name.charAt(0).toUpperCase()"></span>
                                <span class="text-sm font-medium text-slate-800 flex-1 truncate" x-text="u.name"></span>
                                <span x-show="u.is_admin"
                                      class="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded shrink-0">Admin</span>
                            </label>
                        </template>
                        <div x-show="filtered.length === 0"
                             class="px-4 py-3 text-sm text-slate-400 text-center">
                            Nincs találat: „<span x-text="search" class="font-medium text-slate-600"></span>"
                        </div>
                    </div>
                </div>
                @endif
                @error('user_ids')<p class="text-xs text-rose-500 mt-1.5">{{ $message }}</p>@enderror
            </div>

            {{-- Üzenet --}}
            <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Üzenet szövege</label>
                <textarea name="content" rows="4" required maxlength="2000"
                          placeholder="Pl. Kérem hogy pénteken mindenki 30 perccel korábban érjen be az éves ellenőrzés miatt..."
                          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition resize-none">{{ old('content') }}</textarea>
                @error('content')<p class="text-xs text-rose-500 mt-1">{{ $message }}</p>@enderror
            </div>

            <div class="flex justify-end">
                <button type="submit"
                        class="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                    Üzenet küldése
                </button>
            </div>
        </form>
    </div>

    {{-- ─── ELKÜLDÖTT ÜZENETEK ─────────────────────────────────────────── --}}
    <div class="flex items-center gap-3">
        <div class="flex-1 h-px bg-slate-200"></div>
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Elküldött üzenetek
            @if($messages->total() > 0)
            <span class="ml-1.5 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{{ $messages->total() }}</span>
            @endif
        </span>
        <div class="flex-1 h-px bg-slate-200"></div>
    </div>

    {{-- ─── SZŰRŐK ─────────────────────────────────────────────────────── --}}
    @php $hasFilter = request()->hasAny(['date_from','date_to','user_id']); @endphp
    <form method="GET" action="{{ route('pm.messages') }}" class="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4">
        <div class="flex flex-wrap items-end gap-3">
            <div class="flex flex-col gap-1 min-w-[140px]">
                <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dátumtól</label>
                <input type="date" name="date_from" value="{{ request('date_from') }}"
                       class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition">
            </div>
            <div class="flex flex-col gap-1 min-w-[140px]">
                <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dátumig</label>
                <input type="date" name="date_to" value="{{ request('date_to') }}"
                       class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition">
            </div>
            <div class="flex flex-col gap-1 min-w-[180px]">
                <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Címzett</label>
                <select name="user_id"
                        class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition">
                    <option value="">— Mindenki —</option>
                    @foreach($workers as $w)
                        <option value="{{ $w->id }}" {{ request('user_id') == $w->id ? 'selected' : '' }}>
                            {{ $w->name }}
                            @if($w->isAdmin()) (Admin) @elseif($w->isPropertyManager()) (PM) @endif
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="flex items-center gap-2 pb-0.5">
                <button type="submit"
                        class="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/></svg>
                    Szűrés
                </button>
                @if($hasFilter)
                <a href="{{ route('pm.messages') }}"
                   class="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-sm font-semibold rounded-xl transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    Törlés
                </a>
                @endif
            </div>
        </div>
    </form>

    @if($messages->isEmpty())
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-14 text-center">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
        </div>
        <p class="text-base font-semibold text-slate-600">Még nem küldtél üzenetet</p>
        <p class="text-sm text-slate-400 mt-1">Az elküldött üzenetek itt jelennek meg.</p>
    </div>
    @else
    <div class="space-y-4">
        @foreach($messages as $msg)
        @php
            $recipientNames = $msg->send_to_all
                ? null
                : $msg->recipients->map(fn($r) => optional($r->user)->name)->filter()->values();
        @endphp
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {{-- Fejléc sáv --}}
            <div class="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3 flex-wrap">
                {{-- Célzott badge --}}
                @if($msg->send_to_all)
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Mindenkinek
                </span>
                @else
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    {{ $msg->recipients->count() }} felhasználónak
                </span>
                @if($recipientNames && $recipientNames->isNotEmpty())
                <div class="flex flex-wrap gap-1.5">
                    @foreach($recipientNames as $rname)
                    <span class="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">{{ $rname }}</span>
                    @endforeach
                </div>
                @endif
                @endif

                <span class="ml-auto text-xs text-slate-400 flex items-center gap-1 shrink-0">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ $msg->created_at->locale('hu')->translatedFormat('Y. M j., H:i') }}
                </span>
            </div>

            {{-- Tartalom --}}
            <div class="px-5 py-4">
                <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{{ $msg->content }}</p>
            </div>

            {{-- Akció lábléc --}}
            <div class="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-end gap-2">
                <a href="{{ route('pm.messages.edit', $msg) }}"
                   class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-200 text-slate-600 hover:text-amber-700 text-xs font-semibold transition-colors cursor-pointer">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Szerkesztés
                </a>
                <form method="POST" action="{{ route('pm.messages.destroy', $msg) }}">
                    @csrf @method('DELETE')
                    <button type="button"
                            @click="confirmDelete($el.closest('form'))"
                            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Törlés
                    </button>
                </form>
            </div>
        </div>
        @endforeach
    </div>

    @if($messages->hasPages())
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between gap-4">
        <span class="text-sm text-slate-400">{{ $messages->firstItem() }}–{{ $messages->lastItem() }} / {{ $messages->total() }}</span>
        {{ $messages->links() }}
    </div>
    @endif
    @endif


    {{-- ─── TÖRLÉS MEGERŐSÍTŐ MODAL ───────────────────────────────────────── --}}
    <div x-show="delModal.open" x-cloak
         class="fixed inset-0 z-50 flex items-center justify-center p-4"
         @keydown.escape.window="delModal.open = false">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="delModal.open = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10"
             x-transition:enter="transition ease-out duration-200"
             x-transition:enter-start="opacity-0 scale-95"
             x-transition:enter-end="opacity-100 scale-100"
             x-transition:leave="transition ease-in duration-150"
             x-transition:leave-start="opacity-100 scale-100"
             x-transition:leave-end="opacity-0 scale-95">
            <div class="flex items-center gap-3.5 mb-4">
                <div class="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 mr-3">
                    <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </div>
                <div>
                    <h3 class="text-base font-bold text-slate-800">Üzenet törlése</h3>
                    <p class="text-xs text-slate-400 mt-0.5">Ez a művelet nem visszavonható.</p>
                </div>
            </div>
            <p class="text-sm text-slate-600 mb-6 leading-relaxed">Biztosan törlöd ezt az üzenetet? A törlés után a címzettjeknél is eltűnik.</p>
            <div class="flex gap-2.5">
                <button type="button" @click="delModal.open = false"
                        class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer">
                    Mégse
                </button>
                <button type="button" @click="delModal.formEl.submit(); delModal.open = false"
                        class="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-colors shadow-sm cursor-pointer">
                    Törlés
                </button>
            </div>
        </div>
    </div>

</div>
@endsection
