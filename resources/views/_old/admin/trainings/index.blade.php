@extends('layouts.admin')
@section('title', 'Oktatások')

@section('header-actions')
    <a href="{{ route('admin.trainings.create') }}" class="btn-primary text-sm flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Új oktatás
    </a>
@endsection

@section('content')
@if($trainings->isEmpty())
    <div class="card p-12 text-center">
        <svg class="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
        <p class="text-slate-500 font-medium">Még nincs oktatás.</p>
        <a href="{{ route('admin.trainings.create') }}" class="inline-block mt-3 text-indigo-600 font-semibold hover:underline text-sm">
            Hozd létre az első oktatást →
        </a>
    </div>
@else
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[560px]">
            <thead>
                <tr class="border-b border-slate-100 bg-slate-50">
                    <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Oktatás neve</th>
                    <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lépések</th>
                    <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Állapot</th>
                    <th class="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Műveletek</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                @foreach($trainings as $training)
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4">
                        <div class="font-semibold text-slate-800">{{ $training->title }}</div>
                        @if($training->description)
                            <div class="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{{ $training->description }}</div>
                        @endif
                    </td>
                    <td class="px-6 py-4 text-slate-600">{{ $training->steps_count }} lépés</td>
                    <td class="px-6 py-4">
                        @if($training->is_active)
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Aktív
                            </span>
                        @else
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Inaktív
                            </span>
                        @endif
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-2">
                            <a href="{{ route('admin.trainings.steps.index', $training) }}"
                               class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                                Lépések
                            </a>
                            <a href="{{ route('admin.trainings.edit', $training) }}"
                               class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                                Szerkesztés
                            </a>
                            <form method="POST" action="{{ route('admin.trainings.destroy', $training) }}"
                                  onsubmit="return confirm('Biztosan törölni akarod: {{ $training->title }}?')">
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
