@extends('layouts.admin')
@section('title', 'Vizsgák')

@section('header-actions')
    <a href="{{ route('admin.exams.create') }}" class="btn-primary text-sm flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Új vizsga
    </a>
@endsection

@section('content')
@if($exams->isEmpty())
    <div class="card p-12 text-center">
        <svg class="w-12 h-12 text-amber-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="text-slate-500 font-medium">Még nincs vizsga.</p>
        <a href="{{ route('admin.exams.create') }}" class="inline-block mt-3 text-amber-600 font-semibold hover:underline text-sm">
            Hozd létre az első vizsgát →
        </a>
    </div>
@else
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[560px]">
            <thead>
                <tr class="border-b border-slate-100 bg-slate-50">
                    <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vizsga neve</th>
                    <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kérdések</th>
                    <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Állapot</th>
                    <th class="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Műveletek</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                @foreach($exams as $exam)
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4">
                        <div class="font-semibold text-slate-800">{{ $exam->title }}</div>
                        @if($exam->description)
                            <div class="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{{ $exam->description }}</div>
                        @endif
                    </td>
                    <td class="px-6 py-4 text-slate-600">{{ $exam->steps_count }} kérdés</td>
                    <td class="px-6 py-4">
                        @if($exam->is_active)
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
                            <a href="{{ route('admin.exams.steps.index', $exam) }}"
                               class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors">
                                Kérdések
                            </a>
                            <a href="{{ route('admin.exams.edit', $exam) }}"
                               class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                                Szerkesztés
                            </a>
                            <form method="POST" action="{{ route('admin.exams.destroy', $exam) }}"
                                  onsubmit="return confirm('Biztosan törölni akarod: {{ $exam->title }}?')">
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
