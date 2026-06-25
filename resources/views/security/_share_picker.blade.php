{{--
  Paraméterek:
    $sortedUsers – Collection, összes aktív user gyakorisági sorrendben
    $sharedIds   – array, előre kijelöltek (edit esetén), default []
--}}
@php
    $preSelected = $sortedUsers
        ->whereIn('id', $sharedIds ?? [])
        ->map(fn($u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email ?? ''])
        ->values()
        ->toArray();

    $sortedUsersJson = $sortedUsers
        ->map(fn($u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email ?? ''])
        ->values()
        ->toJson();
@endphp

<div x-data="{
        search: '',
        open: false,
        selected: {{ json_encode($preSelected) }},
        sortedUsers: {{ $sortedUsersJson }},
        dropTop: 0,
        dropLeft: 0,
        dropWidth: 0,

        get dropdown() {
            const lower = this.search.toLowerCase();
            const src = lower.length > 0
                ? this.sortedUsers.filter(u => u.name.toLowerCase().includes(lower) || (u.email && u.email.toLowerCase().includes(lower)))
                : this.sortedUsers;
            return src.filter(u => !this.selected.some(s => s.id === u.id));
        },

        openDropdown() {
            const rect   = this.$refs.searchWrap.getBoundingClientRect();
            const vp     = window.visualViewport;
            const vpTop  = vp ? vp.offsetTop  : 0;
            const vpLeft = vp ? vp.offsetLeft : 0;
            this.dropTop   = rect.bottom + vpTop + 4;
            this.dropLeft  = rect.left + vpLeft;
            this.dropWidth = rect.width;
            this.open = true;
        },

        add(user) {
            if (!this.selected.some(s => s.id === user.id)) this.selected.push(user);
            this.search = '';
            this.open = false;
        },

        remove(id) {
            this.selected = this.selected.filter(s => s.id !== id);
        }
    }"
    @click.outside="open = false"
    @scroll.window="if(open) openDropdown()"
    @vp-resize.window="if(open) openDropdown()"
    @doc-scroll.window="if(open) openDropdown()">

    <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Megosztás – ki láthatja ezt a jelentést
    </label>

    {{-- Kiválasztott felhasználók chipek --}}
    <div class="flex flex-wrap gap-2 mb-3" x-show="selected.length > 0" x-cloak>
        <template x-for="u in selected" :key="u.id">
            <span class="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-violet-100 border border-violet-200 text-xs font-semibold text-violet-800">
                <span class="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0" x-text="u.name.charAt(0).toUpperCase()"></span>
                <span x-text="u.name"></span>
                <button type="button" @click.stop="remove(u.id)"
                        class="ml-0.5 w-5 h-5 rounded-full flex items-center justify-center hover:bg-violet-300 transition-colors cursor-pointer text-violet-500 hover:text-violet-800 shrink-0">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
                <input type="hidden" name="share_user_ids[]" :value="u.id">
            </span>
        </template>
    </div>

    {{-- Keresőmező --}}
    <div x-ref="searchWrap"
         class="flex items-center gap-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-violet-400 focus-within:bg-white transition">
        <svg class="w-4 h-4 text-slate-400 shrink-0 pointer-events-none"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"/>
        </svg>
        <input type="text" x-model="search"
               @focus="openDropdown()"
               @click="openDropdown()"
               @input="open = true"
               placeholder="Keresés névre vagy emailre…"
               autocomplete="off"
               class="flex-1 py-2.5 bg-transparent text-sm text-slate-700 focus:outline-none">
    </div>

    {{-- Dropdown – position:fixed, nem bővíti a scroll területet --}}
    <template x-teleport="body">
        <div x-show="open && dropdown.length > 0" x-cloak
             x-transition:enter="transition ease-out duration-100"
             x-transition:enter-start="opacity-0 scale-95"
             x-transition:enter-end="opacity-100 scale-100"
             :style="{ position: 'fixed', top: dropTop + 'px', left: dropLeft + 'px', width: dropWidth + 'px', zIndex: 9999 }"
             class="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            <div class="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider"
                      x-text="search.length === 0 ? 'Összes kolléga (leggyakoribb elöl)' : 'Találatok'"></span>
                <span class="text-[10px] text-slate-400" x-text="dropdown.length + ' fő'"></span>
            </div>
            <ul class="max-h-60 overflow-y-auto divide-y divide-slate-50">
                <template x-for="u in dropdown" :key="u.id">
                    <li>
                        <button type="button" @click="add(u)"
                                class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 transition-colors text-left cursor-pointer">
                            <span class="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0"
                                  x-text="u.name.charAt(0).toUpperCase()"></span>
                            <div class="min-w-0 flex-1">
                                <p class="text-sm font-semibold text-slate-800 truncate" x-text="u.name"></p>
                                <p class="text-xs text-slate-400 truncate" x-text="u.email" x-show="u.email"></p>
                            </div>
                            <svg class="w-4 h-4 text-violet-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                            </svg>
                        </button>
                    </li>
                </template>
            </ul>
        </div>

        <div x-show="open && search.length > 0 && dropdown.length === 0" x-cloak
             :style="{ position: 'fixed', top: dropTop + 'px', left: dropLeft + 'px', width: dropWidth + 'px', zIndex: 9999 }"
             class="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm text-slate-400">
            Nincs találat: „<span x-text="search" class="font-medium text-slate-600"></span>"
        </div>
    </template>

    <p class="text-xs text-slate-400 mt-2">A kijelölt felhasználók láthatják ezt a jelentést a saját nézetükben.</p>
</div>
