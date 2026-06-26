@extends('layouts.app')
@section('title', 'PM üzenetek')

@section('content')
<div class="max-w-7xl mx-auto space-y-5">

    {{-- Hero --}}
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div class="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-10 -left-10 w-36 h-36 bg-orange-800/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
             style="background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:32px 32px;"></div>
        <div class="relative px-8 py-7 flex items-start justify-between gap-4 flex-wrap">
            <div>
                <p class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Property Manager üzenetek</p>
                <h1 class="text-2xl font-extrabold text-white tracking-tight">PM értesítések</h1>
                <p class="text-slate-400 text-sm mt-1">Kérések és üzenetek a Property Managertől</p>
            </div>
            <a href="{{ route('home') }}"
               class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                Vissza
            </a>
        </div>
    </div>

    {{-- Üzenetlista --}}
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
            </div>
            <h2 class="font-bold text-slate-800">Beérkezett üzenetek</h2>
            <span class="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{{ $messages->total() }} üzenet</span>
        </div>

        @if($messages->isEmpty())
            <div class="px-6 py-12 text-center text-slate-400">
                <svg class="w-10 h-10 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <p class="text-sm font-medium">Nincs PM üzeneted</p>
            </div>
        @else
            <ul class="divide-y divide-slate-50">
                @foreach($messages as $message)
                <li class="px-6 py-5 hover:bg-slate-50/60 transition-colors">
                    <div class="flex items-start gap-4">
                        <div class="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap mb-2">
                                <span class="text-sm font-semibold text-slate-800">{{ $message->sent_by_name ?? 'Property Manager' }}</span>
                                @if($message->send_to_all)
                                    <span class="text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Mindenki</span>
                                @else
                                    <span class="text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">Neked szól</span>
                                @endif
                                <span class="text-xs text-slate-400">{{ $message->created_at->locale('hu')->diffForHumans() }}</span>
                                <span class="text-xs text-slate-300">·</span>
                                <span class="text-xs text-slate-400">{{ $message->created_at->locale('hu')->translatedFormat('Y. M j.') }}</span>
                            </div>
                            <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{{ $message->content }}</p>
                        </div>
                    </div>
                </li>
                @endforeach
            </ul>

            @if($messages->hasPages())
            <div class="px-6 py-4 border-t border-slate-100">
                {{ $messages->links() }}
            </div>
            @endif
        @endif
    </div>

</div>
@endsection
