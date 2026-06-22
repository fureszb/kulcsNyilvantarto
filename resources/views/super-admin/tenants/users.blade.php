@extends('layouts.super-admin')
@section('title', $tenant->name . ' – Felhasználók')

@section('content')
<div class="mb-8 flex items-center gap-3">
    <a href="{{ route('super-admin.dashboard') }}"
       class="text-slate-400 hover:text-slate-600 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
    </a>
    <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ $tenant->name }} – Felhasználók</h1>
        <p class="text-slate-500 text-sm mt-0.5">{{ $users->count() }} felhasználó</p>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

    {{-- User lista --}}
    <div class="lg:col-span-3">
        @if($users->isEmpty())
            <div class="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                <svg class="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <p class="text-slate-400 text-sm font-medium">Még nincs felhasználó ennél a cégnél.</p>
            </div>
        @else
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-slate-100 bg-slate-50">
                            <th class="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Név / Email</th>
                            <th class="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Szerepkör</th>
                            <th class="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Állapot</th>
                            <th class="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($users as $user)
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-5 py-3.5">
                                <div class="font-semibold text-slate-800">{{ $user->name }}</div>
                                <div class="text-xs text-slate-400">{{ $user->email }}</div>
                            </td>
                            <td class="px-5 py-3.5">
                                @if($user->role === 'admin')
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Admin</span>
                                @else
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Felhasználó</span>
                                @endif
                            </td>
                            <td class="px-5 py-3.5">
                                @if($user->is_active)
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Aktív
                                    </span>
                                @else
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                        <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Inaktív
                                    </span>
                                @endif
                            </td>
                            <td class="px-5 py-3.5">
                                <div class="flex items-center justify-end gap-2">
                                    <form method="POST" action="{{ route('super-admin.tenants.users.toggle', [$tenant, $user->id]) }}">
                                        @csrf @method('PATCH')
                                        <button type="submit"
                                                class="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors
                                                       {{ $user->is_active
                                                          ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                                                          : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100' }}">
                                            {{ $user->is_active ? 'Deaktiválás' : 'Aktiválás' }}
                                        </button>
                                    </form>
                                    <form method="POST" action="{{ route('super-admin.tenants.users.destroy', [$tenant, $user->id]) }}"
                                          onsubmit="return confirm('Biztosan törölni akarod {{ $user->name }} felhasználót?')">
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
        @endif
    </div>

    {{-- Létrehozó form --}}
    <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
            <h2 class="text-base font-bold text-slate-900 mb-5">Új felhasználó</h2>

            <form method="POST" action="{{ route('super-admin.tenants.users.store', $tenant) }}">
                @csrf

                <div class="mb-4">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Teljes név *</label>
                    <input type="text" name="name" value="{{ old('name') }}" autofocus
                           class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition text-sm @error('name') border-red-400 @enderror"
                           placeholder="Kovács János">
                    @error('name')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>

                <div class="mb-4">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email cím *</label>
                    <input type="email" name="email" value="{{ old('email') }}"
                           class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition text-sm @error('email') border-red-400 @enderror"
                           placeholder="kovacs@ceg.hu">
                    @error('email')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>

                <div class="mb-4">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Szerepkör *</label>
                    <select name="role"
                            class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none transition text-sm @error('role') border-red-400 @enderror">
                        <option value="user"  {{ old('role', 'user')  === 'user'  ? 'selected' : '' }}>Felhasználó</option>
                        <option value="admin" {{ old('role') === 'admin' ? 'selected' : '' }}>Admin</option>
                    </select>
                    @error('role')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>

                <div class="mb-4">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jelszó *</label>
                    <input type="password" name="password"
                           class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition text-sm @error('password') border-red-400 @enderror"
                           placeholder="min. 8 karakter">
                    @error('password')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>

                <div class="mb-6">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jelszó megerősítése *</label>
                    <input type="password" name="password_confirmation"
                           class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition text-sm"
                           placeholder="••••••••">
                </div>

                <button type="submit"
                        class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm">
                    Felhasználó létrehozása
                </button>
            </form>
        </div>
    </div>

</div>
@endsection
