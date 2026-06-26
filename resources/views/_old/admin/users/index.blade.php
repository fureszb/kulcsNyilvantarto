@extends('layouts.admin')
@section('title', 'Felhasználók')
@section('header-actions')
    <a href="{{ route('admin.users.create') }}" class="btn-primary text-sm">Új felhasználó</a>
@endsection

@section('content')
@if(!$users->where('role', 'property_manager')->count())
<div class="mb-5 flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
    <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    <div>
        <p class="text-sm font-semibold text-amber-800">Nincs Property Manager felhasználó</p>
        <p class="text-xs text-amber-700 mt-0.5">Hozzon létre egy felhasználót <strong>Property Manager</strong> szerepkörrel a PM portál eléréséhez. A PM portál a bal oldali menüben érhető el.</p>
    </div>
</div>
@endif
<div class="card overflow-hidden">
    <div class="overflow-x-auto">
    <table class="w-full text-sm min-w-[480px]">
        <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Név</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Szerepkör</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Belépés</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Státusz</th>
                <th class="px-5 py-3"></th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse($users as $user)
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-5 py-3 font-medium text-slate-800">{{ $user->name }}</td>
                <td class="px-5 py-3 text-slate-500">{{ $user->email }}</td>
                <td class="px-5 py-3">
                    @if($user->isAdmin())
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">Admin</span>
                    @elseif($user->isPropertyManager())
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">Property Manager</span>
                    @else
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Felhasználó</span>
                    @endif
                </td>
                <td class="px-5 py-3 text-slate-500 text-sm">
                    @if($user->employed_since)
                        <span title="{{ $user->employed_since->format('Y. F j.') }}">
                            {{ $user->employed_since->format('Y.m.d') }}
                        </span>
                    @else
                        <span class="text-slate-300">—</span>
                    @endif
                </td>
                <td class="px-5 py-3">
                    @if($user->is_active)
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">Aktív</span>
                    @else
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-500">Inaktív</span>
                    @endif
                </td>
                <td class="px-5 py-3">
                    <div class="flex items-center gap-3 justify-end">
                        <a href="{{ route('admin.users.edit', $user) }}" class="text-xs text-blue-700 hover:underline font-medium">Szerk.</a>
                        @if($user->id !== auth('tenant')->id())
                        <form method="POST" action="{{ route('admin.users.destroy', $user) }}"
                              onsubmit="return confirm('Biztosan törli ezt a felhasználót?')">
                            @csrf @method('DELETE')
                            <button type="submit" class="text-xs text-red-500 hover:underline font-medium">Törlés</button>
                        </form>
                        @endif
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="5" class="px-5 py-10 text-center text-slate-400 text-sm">
                    Még nincs felhasználó. Hozzon létre egyet!
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
    </div>
</div>
@endsection
