@extends(auth('tenant')->user()->isPropertyManager() ? 'layouts.pm' : 'layouts.app')
@section('title', 'Ellenőrzés – ' . $check->location->name)

@section('content')
@php $authUser = auth('tenant')->user(); @endphp
<div class="max-w-5xl mx-auto">

    {{-- ─── HERO ──────────────────────────────────────────────────────────────── --}}
    <div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div class="absolute -top-16 -right-16 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-800/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
             style="background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:32px 32px;"></div>
        <div class="relative px-4 py-6 sm:px-8 sm:py-8 flex items-start justify-between gap-6 flex-wrap">
            <div>
                <p class="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Kulcs &amp; Kártya Ellenőrzés</p>
                <h1 class="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">{{ $check->location->name }}</h1>
                <div class="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-400">
                    <span class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        {{ $check->created_at->locale('hu')->translatedFormat('Y. F j., l – H:i') }}
                    </span>
                    <span class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        Ellenőrizte: <strong class="text-slate-300 ml-0.5">{{ $check->checked_by }}</strong>
                    </span>
                    @php
                        $totalItems   = $check->checkItems->count();
                        $checkedItems = $check->checkItems->where('is_checked', true)->count();
                        $pct = $totalItems > 0 ? round($checkedItems / $totalItems * 100) : 0;
                    @endphp
                    <span class="flex items-center gap-1.5 {{ $pct === 100 ? 'text-emerald-400' : 'text-amber-400' }}">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <strong>{{ $checkedItems }}/{{ $totalItems }}</strong>&nbsp;tétel ({{ $pct }}%)
                    </span>
                </div>
            </div>
            <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
                <a href="{{ auth('tenant')->user()->isPropertyManager() ? route('pm.dashboard') : route('keys.index') }}"
                   class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    Vissza
                </a>
                @if($authUser->isAdmin() || (!$authUser->isPropertyManager() && $authUser->id === $check->user_id))
                <a href="{{ route('checks.edit', $check) }}"
                   class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-sm font-medium transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Szerkesztés
                </a>
                @endif
            </div>
        </div>
    </div>

    @if(session('success'))
    <div class="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">
        <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        {{ session('success') }}
    </div>
    @endif

    <div class="space-y-4">

        {{-- ─── MEGJEGYZÉS ──────────────────────────────────────────────────────── --}}
        @if($check->notes || $check->extra_email)
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
                </div>
                <h3 class="font-bold text-slate-800 text-sm">Megjegyzés</h3>
            </div>
            <div class="px-5 py-4 space-y-3">
                @if($check->notes)
                <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{{ $check->notes }}</p>
                @endif
                @if($check->extra_email)
                <p class="text-xs text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    Extra értesítés: <strong class="text-slate-600">{{ $check->extra_email }}</strong>
                </p>
                @endif
            </div>
        </div>
        @endif

        {{-- ─── HIÁNYZÓ TÉTELEK ────────────────────────────────────────────────── --}}
        @php $missingItems = $check->checkItems->where('is_checked', false); @endphp
        @if($missingItems->isNotEmpty())
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <h3 class="font-bold text-slate-800 text-sm">Hiányzó tételek</h3>
                <span class="ml-auto text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">{{ $missingItems->count() }} db</span>
            </div>
            <ul class="divide-y divide-slate-50">
                @foreach($missingItems as $ci)
                @php $targetGroupId = 'group-' . \Illuminate\Support\Str::slug($ci->item->group?->name ?? 'egyeb-tetelek'); @endphp
                <li class="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors group/row"
                    @click="
                        const el = document.getElementById('{{ $targetGroupId }}');
                        if (el) {
                            el.dispatchEvent(new CustomEvent('open-group', { bubbles: false }));
                            setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 160);
                        }
                    ">
                    <div class="w-6 h-6 rounded-lg border-2 border-slate-200 bg-slate-50 shrink-0"></div>
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                                {{ $ci->item->type === 'card' ? 'bg-purple-50 border border-purple-100' : 'bg-blue-50 border border-blue-100' }}">
                        @if($ci->item->type === 'card')
                        <svg class="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                        @else
                        <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                        @endif
                    </div>
                    <span class="text-sm font-semibold text-slate-700 flex-1">{{ $ci->item->name }}</span>
                    @if($ci->item->group)
                    <span class="text-[11px] text-slate-400 font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">{{ $ci->item->group->name }}</span>
                    @endif
                    <svg class="w-3.5 h-3.5 text-slate-300 group-hover/row:text-slate-500 transition-colors shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </li>
                @endforeach
            </ul>
        </div>
        @endif

        {{-- ─── TÉTELEK CSOPORTONKÉNT ──────────────────────────────────────────── --}}
        @if($groupedCheckItems->isNotEmpty() || $ungroupedCheckItems->isNotEmpty())

            {{-- Csoportos tételek --}}
            @foreach($groupedCheckItems as $groupName => $checkItems)
            @php
                $gChecked  = $checkItems->where('is_checked', true)->count();
                $gTotal    = $checkItems->count();
                $gAllOk    = $gChecked === $gTotal;
            @endphp
            <div id="group-{{ \Illuminate\Support\Str::slug($groupName) }}"
                 class="bg-white border {{ $gAllOk ? 'border-slate-200' : 'border-rose-200' }} rounded-2xl shadow-sm overflow-hidden"
                 x-data="{ open: {{ $gAllOk ? 'false' : 'true' }} }"
                 @open-group="open = true">
                <button type="button" @click="open = !open"
                        class="w-full px-5 py-3.5 border-b {{ $gAllOk ? 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/60' : 'border-rose-100 bg-rose-50/40 hover:bg-rose-50/70' }} flex items-center gap-2.5 transition-colors cursor-pointer">
                    <div class="w-7 h-7 rounded-lg {{ $gAllOk ? 'bg-blue-50 border border-blue-100' : 'bg-rose-50 border border-rose-200' }} flex items-center justify-center shrink-0">
                        <svg class="w-3.5 h-3.5 {{ $gAllOk ? 'text-blue-600' : 'text-rose-500' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    </div>
                    <h3 class="font-bold {{ $gAllOk ? 'text-slate-800' : 'text-rose-800' }} text-sm">{{ $groupName }}</h3>
                    <span class="ml-auto text-xs {{ $gAllOk ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-bold' }}">
                        {{ $gChecked }}/{{ $gTotal }} kész
                    </span>
                    <svg class="w-4 h-4 {{ $gAllOk ? 'text-slate-400' : 'text-rose-400' }} transition-transform duration-200 shrink-0 ml-1"
                         :class="{ 'rotate-180': open }"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                <ul class="divide-y divide-slate-50" x-show="open" x-collapse>
                    @foreach($checkItems as $ci)
                    <li class="flex items-center gap-4 px-5 py-3.5 {{ $ci->is_checked ? 'bg-emerald-50/40' : 'bg-rose-50/30' }}">
                        <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0
                                    {{ $ci->is_checked ? 'bg-emerald-500 border-emerald-500' : 'border-rose-300 bg-white' }}">
                            @if($ci->is_checked)
                            <svg class="w-3.5 h-3.5" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                            @endif
                        </div>
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                    {{ $ci->item->type === 'card' ? 'bg-purple-50 border border-purple-100' : 'bg-blue-50 border border-blue-100' }}">
                            @if($ci->item->type === 'card')
                            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                            @else
                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                            @endif
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold truncate {{ $ci->is_checked ? 'text-slate-800' : 'text-rose-700' }}">{{ $ci->item->name }}</p>
                            <span class="text-[11px] font-bold px-1.5 py-0.5 rounded-full
                                         {{ $ci->item->type === 'card' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600' }}">
                                {{ $ci->item->type === 'card' ? 'Kártya' : 'Kulcs' }}
                            </span>
                        </div>
                        <span class="text-xs font-semibold shrink-0 {{ $ci->is_checked ? 'text-emerald-600' : 'text-rose-500' }}">
                            {{ $ci->is_checked ? 'Megvan' : 'Hiányzik' }}
                        </span>
                    </li>
                    @endforeach
                </ul>
            </div>
            @endforeach

            {{-- Csoport nélküli tételek --}}
            @if($ungroupedCheckItems->isNotEmpty())
            @php
                $uChecked = $ungroupedCheckItems->where('is_checked', true)->count();
                $uTotal   = $ungroupedCheckItems->count();
                $uAllOk   = $uChecked === $uTotal;
            @endphp
            <div id="group-egyeb-tetelek"
                 class="bg-white border {{ $uAllOk ? 'border-slate-200' : 'border-rose-200' }} rounded-2xl shadow-sm overflow-hidden"
                 x-data="{ open: {{ $uAllOk ? 'false' : 'true' }} }"
                 @open-group="open = true">
                <button type="button" @click="open = !open"
                        class="w-full px-5 py-3.5 border-b {{ $uAllOk ? 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/60' : 'border-rose-100 bg-rose-50/40 hover:bg-rose-50/70' }} flex items-center gap-2.5 transition-colors cursor-pointer">
                    <div class="w-7 h-7 rounded-lg {{ $uAllOk ? 'bg-slate-100 border border-slate-200' : 'bg-rose-50 border border-rose-200' }} flex items-center justify-center shrink-0">
                        <svg class="w-3.5 h-3.5 {{ $uAllOk ? 'text-slate-500' : 'text-rose-500' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                    </div>
                    <h3 class="font-bold {{ $uAllOk ? 'text-slate-800' : 'text-rose-800' }} text-sm">Egyéb tételek</h3>
                    <span class="ml-auto text-xs {{ $uAllOk ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-bold' }}">
                        {{ $uChecked }}/{{ $uTotal }} kész
                    </span>
                    <svg class="w-4 h-4 {{ $uAllOk ? 'text-slate-400' : 'text-rose-400' }} transition-transform duration-200 shrink-0 ml-1"
                         :class="{ 'rotate-180': open }"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                <ul class="divide-y divide-slate-50" x-show="open" x-collapse>
                    @foreach($ungroupedCheckItems as $ci)
                    <li class="flex items-center gap-4 px-5 py-3.5 {{ $ci->is_checked ? 'bg-emerald-50/40' : 'bg-rose-50/30' }}">
                        <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0
                                    {{ $ci->is_checked ? 'bg-emerald-500 border-emerald-500' : 'border-rose-300 bg-white' }}">
                            @if($ci->is_checked)
                            <svg class="w-3.5 h-3.5" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                            @endif
                        </div>
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                    {{ $ci->item->type === 'card' ? 'bg-purple-50 border border-purple-100' : 'bg-blue-50 border border-blue-100' }}">
                            @if($ci->item->type === 'card')
                            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                            @else
                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                            @endif
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold truncate {{ $ci->is_checked ? 'text-slate-800' : 'text-rose-700' }}">{{ $ci->item->name }}</p>
                            <span class="text-[11px] font-bold px-1.5 py-0.5 rounded-full
                                         {{ $ci->item->type === 'card' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600' }}">
                                {{ $ci->item->type === 'card' ? 'Kártya' : 'Kulcs' }}
                            </span>
                        </div>
                        <span class="text-xs font-semibold shrink-0 {{ $ci->is_checked ? 'text-emerald-600' : 'text-rose-500' }}">
                            {{ $ci->is_checked ? 'Megvan' : 'Hiányzik' }}
                        </span>
                    </li>
                    @endforeach
                </ul>
            </div>
            @endif

        @else
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-10 text-center">
            <p class="text-sm text-slate-400">Ehhez az ellenőrzéshez nem tartoznak tételek.</p>
        </div>
        @endif

    </div>
</div>
@endsection
