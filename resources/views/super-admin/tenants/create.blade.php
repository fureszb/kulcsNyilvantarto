@extends('layouts.super-admin')
@section('title', 'Új cég felvétele')

@section('content')
<div class="max-w-lg">
    <div class="mb-8 flex items-center gap-3">
        <a href="{{ route('super-admin.dashboard') }}"
           class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
        </a>
        <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Új cég felvétele</h1>
            <p class="text-slate-500 text-sm mt-0.5">Külön adatbázis és URL jön létre automatikusan.</p>
        </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
        <form method="POST" action="{{ route('super-admin.tenants.store') }}">
            @csrf

            <div class="mb-5">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2" for="name">
                    Cég neve *
                </label>
                <input type="text" id="name" name="name" autofocus
                       class="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition text-sm @error('name') border-red-400 @enderror"
                       placeholder="pl. Liwo Kft."
                       value="{{ old('name') }}">
                @error('name')
                    <p class="text-red-500 text-xs mt-1.5">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-7">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2" for="slug">
                    URL azonosító (slug) *
                </label>
                <div class="flex items-center gap-2">
                    <span class="text-slate-400 text-sm font-mono bg-slate-50 border-2 border-slate-200 px-3 py-3 rounded-xl whitespace-nowrap">
                        {{ config('app.url') }}/
                    </span>
                    <input type="text" id="slug" name="slug"
                           class="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition text-sm font-mono @error('slug') border-red-400 @enderror"
                           placeholder="liwo"
                           value="{{ old('slug') }}">
                </div>
                <p class="text-xs text-slate-400 mt-1.5">Csak kisbetű, szám és kötőjel. Pl: <code class="bg-slate-100 px-1 rounded">liwo</code>, <code class="bg-slate-100 px-1 rounded">erste-bank</code></p>
                @error('slug')
                    <p class="text-red-500 text-xs mt-1.5">{{ $message }}</p>
                @enderror
            </div>

            <div class="bg-indigo-50 rounded-xl p-4 mb-6 text-sm text-indigo-800 flex gap-3">
                <svg class="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Létrehozáskor a rendszer automatikusan létrehoz egy új, izolált adatbázist és lefuttatja a migrációkat. Az admin jelszót az első bejelentkezéskor kell beállítani.</span>
            </div>

            <div class="flex items-center gap-3">
                <button type="submit"
                        class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm">
                    Cég létrehozása
                </button>
                <a href="{{ route('super-admin.dashboard') }}"
                   class="flex-1 py-3 text-center border-2 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition text-sm">
                    Mégse
                </a>
            </div>
        </form>
    </div>
</div>

<script>
document.getElementById('name').addEventListener('input', function () {
    const slug = this.value.toLowerCase()
        .replace(/[áàäâã]/g, 'a').replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i').replace(/[óòöôőõ]/g, 'o')
        .replace(/[úùüûű]/g, 'u').replace(/[ñ]/g, 'n')
        .replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
        .replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    document.getElementById('slug').value = slug;
});
</script>
@endsection
