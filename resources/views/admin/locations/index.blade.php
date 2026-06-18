@extends('layouts.admin')
@section('title', 'Helyszínek')
@section('header-actions')
    <a href="{{ route('admin.locations.create') }}" class="btn-primary text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Új helyszín
    </a>
@endsection

@section('content')
<div class="card overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Helyszín</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Felelős</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tételek</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Státusz</th>
                <th class="px-5 py-3"></th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse($locations as $location)
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-5 py-3.5 font-semibold text-slate-800">{{ $location->name }}</td>
                <td class="px-5 py-3.5 text-slate-600">{{ $location->responsible_person ?? '–' }}</td>
                <td class="px-5 py-3.5 text-slate-500 text-xs">{{ $location->email ?? '–' }}</td>
                <td class="px-5 py-3.5">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        {{ $location->all_items_count }}
                    </span>
                </td>
                <td class="px-5 py-3.5">
                    @if($location->is_active)
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">Aktív</span>
                    @else
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Inaktív</span>
                    @endif
                </td>
                <td class="px-5 py-3.5">
                    <div class="flex items-center gap-2 justify-end">
                        <a href="{{ route('admin.locations.show', $location) }}" class="text-xs text-blue-700 hover:underline font-medium">Tételek</a>
                        <a href="{{ route('admin.locations.edit', $location) }}" class="text-xs text-slate-600 hover:underline font-medium">Szerk.</a>
                        <form method="POST" action="{{ route('admin.locations.destroy', $location) }}" onsubmit="return confirm('Biztosan törli?')">
                            @csrf @method('DELETE')
                            <button type="submit" class="text-xs text-red-500 hover:underline font-medium">Törlés</button>
                        </form>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="px-5 py-12 text-center text-slate-400">
                    Nincs még helyszín. <a href="{{ route('admin.locations.create') }}" class="text-blue-700 font-medium hover:underline">Első helyszín létrehozása →</a>
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
