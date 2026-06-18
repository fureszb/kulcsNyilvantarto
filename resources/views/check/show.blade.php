@extends('layouts.app')
@section('title', 'Ellenőrzés – ' . $location->name)

@section('content')
<div x-data="{ submitting: false }">
    {{-- Breadcrumb --}}
    <nav class="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <a href="{{ route('home') }}" class="hover:text-blue-700">Helyszínek</a>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <span class="text-slate-800 font-semibold">{{ $location->name }}</span>
    </nav>

    {{-- Header --}}
    <div class="flex items-start justify-between mb-6">
        <div>
            <h1 class="text-2xl font-extrabold text-slate-900">{{ $location->name }}</h1>
            @if($location->responsible_person)
                <p class="text-slate-500 mt-0.5">Felelős: {{ $location->responsible_person }}</p>
            @endif
        </div>
        <span class="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
            {{ now()->format('Y.m.d H:i') }}
        </span>
    </div>

    <form method="POST" action="{{ route('check.store', $location) }}" @submit="submitting = true">
        @csrf
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {{-- Items list --}}
            <div class="lg:col-span-2">
                <div class="card">
                    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 class="font-bold text-slate-700">Kulcsok és kártyák</h2>
                        <span class="text-xs text-slate-400">{{ $items->count() }} tétel</span>
                    </div>
                    @if($items->isEmpty())
                        <div class="p-8 text-center text-slate-400">
                            Ehhez a helyszínhez még nincs tétel felvéve.
                        </div>
                    @else
                        <div class="divide-y divide-slate-100">
                            @foreach($items as $item)
                            <label class="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors group">
                                <input type="checkbox"
                                       name="items[{{ $item->id }}]"
                                       value="1"
                                       class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                                       {{ old("items.{$item->id}") ? 'checked' : '' }}>
                                <div class="flex items-center gap-3 flex-1">
                                    <span class="text-xl">{{ $item->type === 'card' ? '💳' : '🔑' }}</span>
                                    <div>
                                        <span class="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{{ $item->name }}</span>
                                        <span class="ml-2 text-xs text-slate-400">{{ $item->type === 'card' ? 'Kártya' : 'Kulcs' }}</span>
                                    </div>
                                </div>
                                <div class="w-6 h-6 shrink-0">
                                    <svg class="w-6 h-6 text-green-500 hidden group-has-[:checked]:block" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                    </svg>
                                    <svg class="w-6 h-6 text-slate-300 group-has-[:checked]:hidden" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                            </label>
                            @endforeach
                        </div>
                    @endif
                </div>
            </div>

            {{-- Sidebar --}}
            <div class="space-y-4">

                {{-- Ellenőrző személy --}}
                <div class="card p-5">
                    <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Ellenőrző személy
                    </h3>
                    <div>
                        <label class="form-label" for="checked_by">Név <span class="text-red-500">*</span></label>
                        <input type="text" id="checked_by" name="checked_by"
                               class="form-input @error('checked_by') border-red-400 @enderror"
                               placeholder="Teljes név"
                               value="{{ old('checked_by') }}"
                               required>
                        @error('checked_by')
                            <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                {{-- Email --}}
                <div class="card p-5">
                    <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        Extra értesítés
                    </h3>
                    <div>
                        <label class="form-label" for="extra_email">Email cím (opcionális)</label>
                        <input type="email" id="extra_email" name="extra_email"
                               class="form-input @error('extra_email') border-red-400 @enderror"
                               placeholder="pelda@email.com"
                               value="{{ old('extra_email') }}">
                        <p class="text-xs text-slate-400 mt-1.5">A rendszer a helyszín felelősének is küld automatikusan.</p>
                        @error('extra_email')
                            <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                {{-- Megjegyzés --}}
                <div class="card p-5">
                    <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                        </svg>
                        Megjegyzés
                    </h3>
                    <textarea name="notes" rows="3"
                              class="form-input resize-none"
                              placeholder="Opcionális megjegyzés...">{{ old('notes') }}</textarea>
                </div>

                {{-- Submit --}}
                <button type="submit"
                        class="w-full btn-primary justify-center py-3 text-base"
                        :disabled="submitting"
                        :class="submitting ? 'opacity-60 cursor-wait' : ''">
                    <span x-show="!submitting">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Befejezés &amp; Küldés
                    </span>
                    <span x-show="submitting" class="flex items-center gap-2">
                        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Küldés...
                    </span>
                </button>

                <a href="{{ route('home') }}" class="btn-secondary w-full justify-center">
                    Vissza
                </a>
            </div>
        </div>
    </form>
</div>
@endsection
