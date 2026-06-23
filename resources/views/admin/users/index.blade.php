@extends('layouts.admin')
@section('title', 'Felhasználók')
@section('header-actions')
    <a href="{{ route('admin.users.create') }}" class="btn-primary text-sm">Új felhasználó</a>
@endsection

@section('content')
<div class="card overflow-hidden">
    <div class="overflow-x-auto">
    <table class="w-full text-sm min-w-[480px]">
        <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Név</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Szerepkör</th>
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
                    @else
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Felhasználó</span>
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
