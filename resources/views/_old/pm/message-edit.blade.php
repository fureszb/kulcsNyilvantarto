@extends('layouts.pm')
@section('title', 'Üzenet szerkesztése')

@section('content')
<div class="max-w-6xl mx-auto space-y-6" x-data="{ sendToAll: {{ $message->send_to_all ? '1' : '0' }} }">

    {{-- ─── HERO ──────────────────────────────────────────────────────────── --}}
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div class="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
             style="background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:32px 32px;"></div>
        <div class="relative px-8 py-8 flex items-center justify-between gap-6">
            <div>
                <p class="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Üzenet módosítása</p>
                <h1 class="text-3xl font-extrabold text-white tracking-tight">Szerkesztés</h1>
                <p class="text-sm text-slate-400 mt-1">
                    Elküldve: {{ $message->created_at->locale('hu')->translatedFormat('Y. F j., H:i') }}
                </p>
            </div>
            <a href="{{ route('pm.messages') }}"
               class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                Vissza
            </a>
        </div>
    </div>

    {{-- ─── SZERKESZTŐ FORM ────────────────────────────────────────────────── --}}
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
            </div>
            <h2 class="font-bold text-slate-800">Üzenet adatai</h2>
        </div>

        <form method="POST" action="{{ route('pm.messages.update', $message) }}" class="p-6 space-y-6">
            @csrf
            @method('PUT')

            {{-- Célzás --}}
            <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kinek szól?</label>
                <div class="flex gap-4 flex-wrap">
                    <label class="flex items-center gap-2.5 cursor-pointer px-4 py-3 rounded-xl border transition-colors"
                           :class="sendToAll ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-amber-200 hover:bg-amber-50'">
                        <input type="radio" name="send_to_all" value="1"
                               x-model.number="sendToAll"
                               class="text-amber-600 cursor-pointer">
                        <div>
                            <p class="text-sm font-semibold text-slate-800">Mindenkinek</p>
                            <p class="text-xs text-slate-400">{{ $workers->count() }} aktív felhasználó</p>
                        </div>
                    </label>
                    <label class="flex items-center gap-2.5 cursor-pointer px-4 py-3 rounded-xl border transition-colors"
                           :class="!sendToAll ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-amber-200 hover:bg-amber-50'">
                        <input type="radio" name="send_to_all" value="0"
                               x-model.number="sendToAll"
                               class="text-amber-600 cursor-pointer">
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
                        'id'        => $w->id,
                        'name'      => $w->name,
                        'is_admin'  => $w->isAdmin(),
                        'preselect' => in_array($w->id, $sharedIds),
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
                    <div class="flex items-center gap-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-amber-400 focus-within:bg-white transition">
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
                                       :checked="u.preselect"
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

            {{-- Üzenet szövege --}}
            <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Üzenet szövege</label>
                <textarea name="content" rows="6" required maxlength="2000"
                          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition resize-none leading-relaxed">{{ old('content', $message->content) }}</textarea>
                @error('content')<p class="text-xs text-rose-500 mt-1">{{ $message }}</p>@enderror
            </div>

            {{-- Gombok --}}
            <div class="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <a href="{{ route('pm.messages') }}"
                   class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors cursor-pointer">
                    Mégse
                </a>
                <button type="submit"
                        class="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Változtatások mentése
                </button>
            </div>
        </form>
    </div>

</div>
@endsection
