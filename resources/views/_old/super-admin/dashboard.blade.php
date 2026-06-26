@extends('layouts.super-admin')
@section('title', 'Cégek')

@section('content')
<div class="flex flex-wrap items-center justify-between gap-4 mb-8">
    <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Cégek</h1>
        <p class="text-slate-500 mt-0.5 text-sm">{{ $tenants->count() }} regisztrált cég</p>
    </div>
    <a href="{{ route('super-admin.tenants.create') }}"
       class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Új cég felvétele
    </a>
</div>

@if($tenants->isEmpty())
    <div class="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
        <svg class="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
        <p class="text-slate-500 font-medium">Még nincs regisztrált cég.</p>
        <a href="{{ route('super-admin.tenants.create') }}" class="inline-block mt-4 text-indigo-600 font-semibold hover:underline text-sm">
            Hozd létre az első céget →
        </a>
    </div>
@else
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[640px]">
            <thead>
                <tr class="border-b border-slate-100 bg-slate-50">
                    <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cég neve</th>
                    <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">URL</th>
                    <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Létrehozva</th>
                    <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Állapot</th>
                    <th class="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Műveletek</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                @foreach($tenants as $tenant)
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                {{ strtoupper(substr($tenant->slug, 0, 2)) }}
                            </div>
                            <span class="font-semibold text-slate-800">{{ $tenant->name }}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <a href="{{ $tenant->url }}" target="_blank"
                           class="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                            /{{ $tenant->slug }}
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                            </svg>
                        </a>
                    </td>
                    <td class="px-6 py-4 text-slate-500">
                        {{ $tenant->created_at->format('Y.m.d') }}
                    </td>
                    <td class="px-6 py-4">
                        @if($tenant->is_active)
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Aktív
                            </span>
                        @else
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                Inaktív
                            </span>
                        @endif
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-2">
                            <a href="{{ route('super-admin.tenants.users.index', $tenant) }}"
                               class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                                Felhasználók
                            </a>
                            <form method="POST" action="{{ route('super-admin.tenants.toggle', $tenant) }}">
                                @csrf @method('PATCH')
                                <button type="submit"
                                        class="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors
                                               {{ $tenant->is_active
                                                  ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                                                  : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100' }}">
                                    {{ $tenant->is_active ? 'Deaktiválás' : 'Aktiválás' }}
                                </button>
                            </form>
                            <form method="POST" action="{{ route('super-admin.tenants.destroy', $tenant) }}"
                                  onsubmit="return confirm('Biztosan törölni akarod a(z) {{ $tenant->name }} céget és az összes adatát? Ez nem visszavonható!')">
                                @csrf @method('DELETE')
                                <button type="submit"
                                        class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                                    Törlés
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
        </div>
    </div>
@endif
@endsection
