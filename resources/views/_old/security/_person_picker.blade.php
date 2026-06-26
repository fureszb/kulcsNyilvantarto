{{--
  Paraméterek:
    $fieldName    – name attribútum (pl. 'taken_over_from')
    $currentValue – előre töltött érték (edit esetén), default ''
    $placeholder  – placeholder szöveg, default 'Keresés névre…'
    $sortedUsers  – szülő view-ból örökölt Collection
--}}
@php
    $pickerUsersJson  = $sortedUsers
        ->map(fn($u) => ['id' => $u->id, 'name' => $u->name])
        ->values()
        ->toJson();
    $pickerCurrent    = $currentValue ?? '';
    $pickerPlaceholder = $placeholder ?? 'Keresés névre…';
@endphp

<div x-data="{
        search: {{ json_encode($pickerCurrent) }},
        open: false,
        users: {{ $pickerUsersJson }},
        dropTop: 0, dropLeft: 0, dropWidth: 0,

        get filtered() {
            const lower = this.search.toLowerCase();
            if (!lower) return this.users;
            return this.users.filter(u => u.name.toLowerCase().includes(lower));
        },

        openDropdown() {
            const rect   = this.$refs.wrap.getBoundingClientRect();
            const vp     = window.visualViewport;
            const vpTop  = vp ? vp.offsetTop  : 0;
            const vpLeft = vp ? vp.offsetLeft : 0;
            this.dropTop   = rect.bottom + vpTop + 4;
            this.dropLeft  = rect.left + vpLeft;
            this.dropWidth = rect.width;
            this.open = true;
        },

        select(name) {
            this.search = name;
            this.open = false;
        }
    }"
    @click.outside="open = false"
    @scroll.window="if(open) openDropdown()"
    @vp-resize.window="if(open) openDropdown()"
    @doc-scroll.window="if(open) openDropdown()">

    <div x-ref="wrap"
         class="flex items-center gap-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-rose-400 focus-within:bg-white transition">
        <svg class="w-4 h-4 text-slate-400 shrink-0 pointer-events-none"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <input type="text"
               name="{{ $fieldName }}"
               x-model="search"
               @focus="openDropdown()"
               @click="openDropdown()"
               @input="open = true"
               placeholder="{{ $pickerPlaceholder }}"
               autocomplete="off"
               {{ isset($required) && $required ? 'required' : '' }}
               class="flex-1 py-2.5 bg-transparent text-sm text-slate-700 focus:outline-none">
        <button type="button" x-show="search.length > 0" x-cloak
                @click="search = ''; open = false"
                class="text-slate-300 hover:text-slate-500 transition shrink-0 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    </div>

    <p class="text-xs text-slate-400 italic mt-1">Ha nem találod a listában a nevet, gépeld be.</p>

    <template x-teleport="body">
        <div x-show="open && filtered.length > 0" x-cloak
             x-transition:enter="transition ease-out duration-100"
             x-transition:enter-start="opacity-0 scale-95"
             x-transition:enter-end="opacity-100 scale-100"
             :style="{ position: 'fixed', top: dropTop + 'px', left: dropLeft + 'px', width: dropWidth + 'px', zIndex: 9999 }"
             class="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            <div class="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider"
                      x-text="search.length === 0 ? 'Összes felhasználó' : 'Találatok'"></span>
                <span class="text-[10px] text-slate-400" x-text="filtered.length + ' fő'"></span>
            </div>
            <ul class="max-h-56 overflow-y-auto divide-y divide-slate-50">
                <template x-for="u in filtered" :key="u.id">
                    <li>
                        <button type="button" @click="select(u.name)"
                                class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 transition-colors text-left cursor-pointer">
                            <span class="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600 shrink-0"
                                  x-text="u.name.charAt(0).toUpperCase()"></span>
                            <span class="text-sm font-semibold text-slate-800 truncate" x-text="u.name"></span>
                        </button>
                    </li>
                </template>
            </ul>
        </div>

        <div x-show="open && search.length > 0 && filtered.length === 0" x-cloak
             :style="{ position: 'fixed', top: dropTop + 'px', left: dropLeft + 'px', width: dropWidth + 'px', zIndex: 9999 }"
             class="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm text-slate-400">
            Nincs találat: „<span x-text="search" class="font-medium text-slate-600"></span>"
        </div>
    </template>
</div>
