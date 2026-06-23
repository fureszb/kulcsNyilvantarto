@extends('layouts.app')
@section('title', 'Ellenőrzés – ' . $location->name)

@section('content')
<div x-data="{
    submitting: false,
    sel: [],
    T: {{ $items->count() }},
    toggle(id) {
        const i = this.sel.indexOf(id);
        if (i >= 0) { this.sel.splice(i, 1); } else { this.sel.push(id); }
        updateProgress(this.sel.length, this.T);
    },
    has(id) { return this.sel.includes(id); },
    toggleGroup(ids) {
        const allChecked = ids.every(id => this.sel.includes(id));
        if (allChecked) {
            this.sel = this.sel.filter(id => !ids.includes(id));
        } else {
            ids.forEach(id => { if (!this.sel.includes(id)) this.sel.push(id); });
        }
        updateProgress(this.sel.length, this.T);
    },
    groupAllChecked(ids) { return ids.length > 0 && ids.every(id => this.sel.includes(id)); },
    groupSomeChecked(ids) { return ids.some(id => this.sel.includes(id)) && !ids.every(id => this.sel.includes(id)); }
}" x-init="@foreach($items as $item){{ old('items.'.$item->id) ? 'sel.push('.$item->id.');' : '' }}@endforeach updateProgress(sel.length, T)">

    {{-- Breadcrumb --}}
    <nav class="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <a href="{{ route('keys.index') }}" class="hover:text-blue-700 transition-colors">Helyszínek</a>
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <span class="text-slate-700 font-semibold">{{ $location->name }}</span>
    </nav>

    {{-- Header --}}
    <div class="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ $location->name }}</h1>
            @if($location->responsible_person)
                <p class="text-slate-500 mt-0.5 text-sm">Felelős: <strong class="text-slate-700">{{ $location->responsible_person }}</strong></p>
            @endif
        </div>
        <span class="text-xs font-medium text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap">
            {{ now()->format('Y.m.d H:i') }}
        </span>
    </div>

    <form method="POST" action="{{ route('check.store', $location) }}" @submit="submitting = true">
        @csrf
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {{-- Left: items --}}
            <div class="lg:col-span-2 space-y-4">

                {{-- Progress card --}}
                @if(!$items->isEmpty())
                <div id="prog-card" class="bg-white rounded-2xl border-2 border-slate-200 p-5" style="transition: border-color .3s">
                    <div class="flex items-center justify-between mb-2.5">
                        <span id="prog-status" class="text-sm font-semibold text-slate-600">Ellenőrzés folyamatban...</span>
                        <span id="prog-pct" class="text-sm font-bold text-blue-700">0%</span>
                    </div>
                    <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div id="prog-fill" class="h-full rounded-full" style="width:0%;background-color:#2563eb;transition:width .35s ease,background-color .3s"></div>
                    </div>
                    <p class="text-xs text-slate-400 mt-2">
                        <span id="prog-count">0</span> / {{ $items->count() }} tétel megvolt
                    </p>
                </div>
                @endif

                {{-- Items card --}}
                <div class="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 class="font-bold text-slate-700">Kulcsok és kártyák</h2>
                        <span class="text-xs text-slate-400 font-medium">{{ $items->count() }} tétel</span>
                    </div>

                    @if($items->isEmpty())
                        <div class="p-10 text-center text-slate-400 text-sm">
                            Ehhez a helyszínhez még nincs tétel felvéve.
                        </div>
                    @else
                        <div>
                            {{-- ── Csoportok ──────────────────────────────────────────────── --}}
                            @foreach($groups as $group)
                                @php $groupIds = $group->items->pluck('id')->toArray(); @endphp
                                @if(count($groupIds) > 0)
                                <div x-data="{ open: false }" class="border-b border-slate-100 last:border-0">

                                    {{-- Csoport fejléc --}}
                                    <div class="flex items-center gap-3 px-6 py-3 bg-slate-50 cursor-pointer select-none"
                                         @click="open = !open">

                                        {{-- Select-all checkbox --}}
                                        <div @click.stop="toggleGroup({{ json_encode($groupIds) }})"
                                             class="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer"
                                             :class="{
                                                 'bg-blue-600 border-blue-600': groupAllChecked({{ json_encode($groupIds) }}),
                                                 'bg-blue-200 border-blue-400': groupSomeChecked({{ json_encode($groupIds) }}),
                                                 'border-slate-300 bg-white': !groupAllChecked({{ json_encode($groupIds) }}) && !groupSomeChecked({{ json_encode($groupIds) }})
                                             }">
                                            <template x-if="groupAllChecked({{ json_encode($groupIds) }})">
                                                <svg class="w-3.5 h-3.5" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                                                </svg>
                                            </template>
                                            <template x-if="groupSomeChecked({{ json_encode($groupIds) }})">
                                                <svg class="w-3 h-3" fill="none" stroke="#3b82f6" stroke-width="3" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/>
                                                </svg>
                                            </template>
                                        </div>

                                        <span class="font-semibold text-slate-700 flex-1 text-sm">{{ $group->name }}</span>
                                        <span class="text-xs text-slate-400 font-medium">{{ count($groupIds) }} tétel</span>

                                        {{-- Expand/collapse nyíl --}}
                                        <svg class="w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0"
                                             :class="open ? 'rotate-180' : ''"
                                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </div>

                                    {{-- Csoport tételei --}}
                                    <div x-show="open" x-cloak>
                                        @foreach($group->items as $item)
                                        <div @click="toggle({{ $item->id }})"
                                             class="flex items-center gap-3 py-4 cursor-pointer border-b border-slate-50 last:border-0 transition-colors duration-150" style="padding-left:10px;padding-right:10px"
                                             :class="has({{ $item->id }}) ? 'bg-green-50' : 'hover:bg-slate-50'">

                                            <input type="checkbox"
                                                   name="items[{{ $item->id }}]"
                                                   value="1"
                                                   class="hidden"
                                                   :checked="has({{ $item->id }})">

                                            <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                                                 :class="has({{ $item->id }}) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'">
                                                <svg x-show="has({{ $item->id }})" class="w-3.5 h-3.5" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                                                </svg>
                                            </div>

                                            <div class="flex-1 flex items-center gap-3">
                                                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 {{ $item->type === 'card' ? 'bg-purple-50 border border-purple-100' : 'bg-blue-50 border border-blue-100' }}">
                                                    @if($item->type === 'card')
                                                        <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                                                    @else
                                                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                                                    @endif
                                                </div>
                                                <div>
                                                    <div class="font-semibold text-slate-800 text-sm">{{ $item->name }}</div>
                                                    <span class="inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full {{ $item->type === 'card' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700' }}">
                                                        {{ $item->type === 'card' ? 'Kártya' : 'Kulcs' }}
                                                    </span>
                                                </div>
                                            </div>

                                            <div class="shrink-0">
                                                <svg x-show="has({{ $item->id }})" class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                                </svg>
                                                <svg x-show="!has({{ $item->id }})" class="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="9" stroke-width="1.5"/>
                                                </svg>
                                            </div>
                                        </div>
                                        @endforeach
                                    </div>
                                </div>
                                @endif
                            @endforeach

                            {{-- ── Csoporton kívüli tételek ────────────────────────────────── --}}
                            @foreach($ungroupedItems as $item)
                            <div @click="toggle({{ $item->id }})"
                                 class="flex items-center gap-4 px-6 py-4 cursor-pointer border-b border-slate-50 last:border-0 transition-colors duration-150"
                                 :class="has({{ $item->id }}) ? 'bg-green-50' : 'hover:bg-slate-50'">

                                <input type="checkbox"
                                       name="items[{{ $item->id }}]"
                                       value="1"
                                       class="hidden"
                                       :checked="has({{ $item->id }})">

                                <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                                     :class="has({{ $item->id }}) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'">
                                    <svg x-show="has({{ $item->id }})" class="w-3.5 h-3.5" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                                    </svg>
                                </div>

                                <div class="flex-1 flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 {{ $item->type === 'card' ? 'bg-purple-50 border border-purple-100' : 'bg-blue-50 border border-blue-100' }}">
                                        @if($item->type === 'card')
                                            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                                        @else
                                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                                        @endif
                                    </div>
                                    <div>
                                        <div class="font-semibold text-slate-800 text-sm">{{ $item->name }}</div>
                                        <span class="inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full {{ $item->type === 'card' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700' }}">
                                            {{ $item->type === 'card' ? 'Kártya' : 'Kulcs' }}
                                        </span>
                                    </div>
                                </div>

                                <div class="shrink-0">
                                    <svg x-show="has({{ $item->id }})" class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                    </svg>
                                    <svg x-show="!has({{ $item->id }})" class="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="9" stroke-width="1.5"/>
                                    </svg>
                                </div>
                            </div>
                            @endforeach
                        </div>
                    @endif
                </div>
            </div>

            {{-- Right sidebar --}}
            <div class="space-y-4">

                <div class="bg-white rounded-2xl border-2 border-slate-200 p-5">
                    <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        Extra értesítés
                    </h3>
                    <label class="text-xs font-semibold text-slate-600 mb-1.5 block" for="extra_email">
                        Email <span class="text-slate-400 font-normal">(opcionális)</span>
                    </label>
                    <input type="email" id="extra_email" name="extra_email"
                           class="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none transition @error('extra_email') border-red-400 @enderror"
                           placeholder="email@ceg.hu"
                           value="{{ old('extra_email') }}">
                    <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">A felelős automatikusan kap értesítést.</p>
                    @error('extra_email')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div class="bg-white rounded-2xl border-2 border-slate-200 p-5">
                    <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                        </svg>
                        Megjegyzés
                    </h3>
                    <textarea name="notes" rows="3"
                              class="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none transition resize-none leading-relaxed"
                              placeholder="Opcionális megjegyzés...">{{ old('notes') }}</textarea>
                </div>

                <button type="submit" id="submit-btn"
                        class="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        style="background-color:#1e3a5f;transition:background-color .3s,opacity .2s"
                        :disabled="submitting"
                        :style="submitting ? 'opacity:0.65;cursor:wait' : ''">
                    <span x-show="!submitting" class="flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Befejezés &amp; Küldés
                    </span>
                    <span x-show="submitting" class="flex items-center gap-2">
                        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="white" stroke-width="4"/>
                            <path class="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Küldés...
                    </span>
                </button>

                <a href="{{ route('home') }}"
                   class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150">
                    ← Vissza
                </a>
            </div>
        </div>
    </form>
</div>

<script>
function updateProgress(n, total) {
    var pct = total > 0 ? Math.round(n / total * 100) : 0;
    var done = n === total && total > 0;

    var fill   = document.getElementById('prog-fill');
    var pctEl  = document.getElementById('prog-pct');
    var cntEl  = document.getElementById('prog-count');
    var card   = document.getElementById('prog-card');
    var status = document.getElementById('prog-status');
    var btn    = document.getElementById('submit-btn');

    if (fill)   { fill.style.width = pct + '%'; fill.style.backgroundColor = done ? '#22c55e' : '#2563eb'; }
    if (pctEl)  { pctEl.textContent = pct + '%'; pctEl.style.color = done ? '#15803d' : '#1d4ed8'; }
    if (cntEl)  { cntEl.textContent = n; }
    if (card)   { card.style.borderColor = done ? '#86efac' : '#e2e8f0'; }
    if (status) { status.textContent = done ? 'Minden tétel ellenőrizve!' : 'Ellenőrzés folyamatban...'; status.style.color = done ? '#15803d' : '#475569'; status.style.fontWeight = done ? '700' : '600'; }
    if (btn)    { btn.style.backgroundColor = done ? '#16a34a' : '#1e3a5f'; }
}
</script>
@endsection
