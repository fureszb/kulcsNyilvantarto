@extends('layouts.app')
@section('title', 'Profilom')

@section('content')
<div class="max-w-lg mx-auto">

    {{-- Header --}}
    <div class="flex items-center gap-4 mb-8">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200">
            <span class="text-xl font-extrabold text-white">{{ strtoupper(substr(auth('tenant')->user()->name ?? 'U', 0, 1)) }}</span>
        </div>
        <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Profilom</h1>
            <p class="text-sm text-slate-400 mt-0.5">{{ auth('tenant')->user()->email ?? '' }}</p>
        </div>
    </div>

    @if(session('success'))
        <div class="mb-5 flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700">
            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Mentve!
        </div>
    @endif

    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {{-- Alapadatok --}}
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Alapadatok
            </p>
        </div>

        <form method="POST" action="{{ route('profile.update') }}">
            @csrf @method('PUT')

            <div class="px-6 py-5 space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5" for="name">
                        Teljes név <span class="text-red-500">*</span>
                    </label>
                    <input type="text" id="name" name="name" value="{{ old('name', $user->name) }}"
                           class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400
                                  focus:border-blue-400 focus:bg-white focus:outline-none transition"
                           required>
                    @error('name')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5" for="email">
                        Email cím <span class="text-red-500">*</span>
                    </label>
                    <input type="email" id="email" name="email" value="{{ old('email', $user->email) }}"
                           class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400
                                  focus:border-blue-400 focus:bg-white focus:outline-none transition"
                           required>
                    @error('email')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>
            </div>

            {{-- Jelszócsere --}}
            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    Jelszóváltoztatás
                </p>
            </div>

            <div class="px-6 py-5 space-y-4">
                <p class="text-xs text-slate-400">Csak akkor töltse ki, ha jelszavát meg kívánja változtatni.</p>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5" for="current_password">Jelenlegi jelszó</label>
                    <input type="password" id="current_password" name="current_password"
                           class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400
                                  focus:border-blue-400 focus:bg-white focus:outline-none transition"
                           autocomplete="current-password">
                    @error('current_password')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5" for="password">Új jelszó</label>
                    <input type="password" id="password" name="password"
                           class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400
                                  focus:border-blue-400 focus:bg-white focus:outline-none transition"
                           autocomplete="new-password">
                    @error('password')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5" for="password_confirmation">Új jelszó megerősítése</label>
                    <input type="password" id="password_confirmation" name="password_confirmation"
                           class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400
                                  focus:border-blue-400 focus:bg-white focus:outline-none transition"
                           autocomplete="new-password">
                </div>
            </div>

            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                <button type="submit"
                        class="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Mentés
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
