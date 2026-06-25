@extends('layouts.app')
@section('title', 'Főoldal')

@if($welcomeName ?? false)
@section('welcome_overlay')
<div x-data="userWelcome()" x-show="show"
     :class="fading ? 'opacity-0' : 'opacity-100'"
     class="fixed inset-0 z-[999] flex items-center justify-center transition-opacity duration-700 ease-in-out pointer-events-none"
     style="background: linear-gradient(135deg, #0f172a 0%, #0c1a2e 50%, #0f172a 100%);">

    <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl animate-pulse" style="animation-delay:1s"></div>
    </div>

    <div class="relative text-center px-8"
         :class="entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
         style="transition: opacity 0.7s ease-out, transform 0.7s ease-out;">
        <p class="text-blue-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">{{ app()->bound('tenant') ? app('tenant')->name : 'KK Nyilvántartó' }}</p>
        <h1 class="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-3">
            Üdvözöljük,
        </h1>
        <h2 class="text-4xl sm:text-6xl font-extrabold tracking-tight"
            style="background: linear-gradient(135deg, #3b82f6, #60a5fa, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            {{ $welcomeName }}!
        </h2>
        <div class="mt-8 w-16 h-0.5 bg-blue-500/40 mx-auto rounded-full"></div>
    </div>
</div>
@endsection
@endif

@section('content')

{{-- Scroll indicator --}}
<div id="scroll-hint"
     class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4 transition-opacity duration-500 pointer-events-none">
    <span class="text-xs font-semibold text-white bg-slate-900 px-3 py-1 rounded-full shadow-md whitespace-nowrap">
        További modulok
    </span>
    <div class="animate-bounce w-8 h-8 rounded-full bg-slate-900 shadow-md flex items-center justify-center">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
        </svg>
    </div>
</div>
<script>
(function() {
    var hint = document.getElementById('scroll-hint');
    if (!hint) return;
    window.addEventListener('scroll', function() {
        hint.style.opacity = window.scrollY > 60 ? '0' : '1';
    }, { passive: true });
})();
</script>

{{-- ── Hero banner ───────────────────────────────────────────────────────── --}}
<div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">

    {{-- Háttér glow-ok --}}
    <div class="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

    {{-- Grid pattern --}}
    <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
         style="background-image: linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px); background-size: 32px 32px;"></div>

    <div class="relative px-8 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
            @auth('tenant')
            <p class="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Üdvözlöm, {{ auth('tenant')->user()->name }}
            </p>
            @endauth
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {{ app()->bound('tenant') ? app('tenant')->name : 'KK Nyilvántartó' }}
            </h1>
            <p class="text-slate-400 mt-2 text-sm">Válasszon modult a folytatáshoz</p>
        </div>

        {{-- Ikon dísz --}}
        <div class="hidden sm:flex w-16 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0 backdrop-blur-sm">
            <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
        </div>
    </div>
</div>

{{-- ── Modul kártyák ─────────────────────────────────────────────────────── --}}
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

    {{-- Kulcsnyilvántartó --}}
    <a href="{{ route('keys.index') }}"
       class="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm
              hover:shadow-xl hover:shadow-blue-100/80 hover:border-blue-200
              motion-safe:hover:-translate-y-1 transition-all duration-300 flex flex-col">

        {{-- Shimmer --}}
        <div class="absolute inset-0 -translate-x-full pointer-events-none z-10
                    bg-gradient-to-r from-transparent via-blue-50/60 to-transparent
                    motion-safe:group-hover:translate-x-full
                    motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out"></div>

        {{-- Felső gradient sáv --}}
        <div class="h-1 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div class="p-8 flex flex-col flex-1">
            {{-- Ikon --}}
            <div class="relative w-14 h-14 rounded-2xl mb-6 flex items-center justify-center
                        bg-blue-50 border border-blue-100 group-hover:bg-blue-100 group-hover:border-blue-200
                        transition-all duration-300">
                <svg class="w-7 h-7 text-blue-600 transition-transform duration-300 motion-safe:group-hover:rotate-[20deg]"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>

            <h2 class="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-200">
                Kulcsnyilvántartó
            </h2>
            <p class="text-slate-500 text-sm mt-2 flex-1 leading-relaxed">
                Kulcsok és belépőkártyák jelenlétének ellenőrzése helyszínenként.
            </p>

            {{-- Feature pontok --}}
            <ul class="mt-5 space-y-1.5">
                @foreach(['Helyszínenkénti áttekintés', 'Gyors státusz ellenőrzés', 'Ellenőrzési előzmények'] as $feat)
                <li class="flex items-center gap-2 text-xs text-slate-400">
                    <svg class="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ $feat }}
                </li>
                @endforeach
            </ul>

            <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span class="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                    Ellenőrzés indítása
                </span>
                <div class="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-600 border border-blue-100 group-hover:border-blue-600
                            flex items-center justify-center transition-all duration-300">
                    <svg class="w-4 h-4 text-blue-500 group-hover:text-white motion-safe:group-hover:translate-x-0.5 transition-all duration-200"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </div>
    </a>

    {{-- Oktatások --}}
    <a href="{{ route('training.index') }}"
       class="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm
              hover:shadow-xl hover:shadow-indigo-100/80 hover:border-indigo-200
              motion-safe:hover:-translate-y-1 transition-all duration-300 flex flex-col">

        {{-- Shimmer --}}
        <div class="absolute inset-0 -translate-x-full pointer-events-none z-10
                    bg-gradient-to-r from-transparent via-indigo-50/60 to-transparent
                    motion-safe:group-hover:translate-x-full
                    motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out"></div>

        {{-- Felső gradient sáv --}}
        <div class="h-1 bg-gradient-to-r from-indigo-500 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div class="p-8 flex flex-col flex-1">
            {{-- Ikon --}}
            <div class="relative w-14 h-14 rounded-2xl mb-6 flex items-center justify-center
                        bg-indigo-50 border border-indigo-100 group-hover:bg-indigo-100 group-hover:border-indigo-200
                        transition-all duration-300">
                <svg class="w-7 h-7 text-indigo-600 transition-transform duration-300 motion-safe:group-hover:scale-110"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
            </div>

            <h2 class="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors duration-200">
                Oktatások
            </h2>
            <p class="text-slate-500 text-sm mt-2 flex-1 leading-relaxed">
                Interaktív képzési anyagok és oktatások elvégzése.
            </p>

            {{-- Feature pontok --}}
            <ul class="mt-5 space-y-1.5">
                @foreach(['Interaktív tananyagok', 'Tudásellenőrző tesztek', 'Haladási nyomkövetés'] as $feat)
                <li class="flex items-center gap-2 text-xs text-slate-400">
                    <svg class="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ $feat }}
                </li>
                @endforeach
            </ul>

            <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span class="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    Oktatások megtekintése
                </span>
                <div class="w-8 h-8 rounded-full bg-indigo-50 group-hover:bg-indigo-600 border border-indigo-100 group-hover:border-indigo-600
                            flex items-center justify-center transition-all duration-300">
                    <svg class="w-4 h-4 text-indigo-500 group-hover:text-white motion-safe:group-hover:translate-x-0.5 transition-all duration-200"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </div>
    </a>


    {{-- Vizsgák --}}
    <a href="{{ route('exam.index') }}"
       class="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm
              hover:shadow-xl hover:shadow-amber-100/80 hover:border-amber-200
              motion-safe:hover:-translate-y-1 transition-all duration-300 flex flex-col">

        <div class="absolute inset-0 -translate-x-full pointer-events-none z-10
                    bg-gradient-to-r from-transparent via-amber-50/60 to-transparent
                    motion-safe:group-hover:translate-x-full
                    motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out"></div>

        <div class="h-1 bg-gradient-to-r from-amber-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div class="p-8 flex flex-col flex-1">
            <div class="relative w-14 h-14 rounded-2xl mb-6 flex items-center justify-center
                        bg-amber-50 border border-amber-100 group-hover:bg-amber-100 group-hover:border-amber-200
                        transition-all duration-300">
                <svg class="w-7 h-7 text-amber-600 transition-transform duration-300 motion-safe:group-hover:scale-110"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
            </div>

            <h2 class="text-xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors duration-200">
                Vizsgák
            </h2>
            <p class="text-slate-500 text-sm mt-2 flex-1 leading-relaxed">
                Tudáspróba vizsgák elvégzése eredményértékeléssel.
            </p>

            <ul class="mt-5 space-y-1.5">
                @foreach(['Önálló vizsgakérdések', 'Visszajelzés csak a végén', 'Eredmény és kiértékelés'] as $feat)
                <li class="flex items-center gap-2 text-xs text-slate-400">
                    <svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ $feat }}
                </li>
                @endforeach
            </ul>

            <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span class="text-sm font-semibold text-amber-600 group-hover:text-amber-700 transition-colors">
                    Vizsgák megtekintése
                </span>
                <div class="w-8 h-8 rounded-full bg-amber-50 group-hover:bg-amber-500 border border-amber-100 group-hover:border-amber-500
                            flex items-center justify-center transition-all duration-300">
                    <svg class="w-4 h-4 text-amber-500 group-hover:text-white motion-safe:group-hover:translate-x-0.5 transition-all duration-200"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </div>
    </a>


    {{-- Váltóüzenetek --}}
    @auth('tenant')
    @if(!auth('tenant')->user()->isPropertyManager())
    <a href="{{ route('notes.index') }}"
       class="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm
              hover:shadow-xl hover:shadow-teal-100/80 hover:border-teal-200
              motion-safe:hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div class="absolute inset-0 -translate-x-full pointer-events-none z-10
                    bg-gradient-to-r from-transparent via-teal-50/60 to-transparent
                    motion-safe:group-hover:translate-x-full
                    motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out"></div>
        <div class="h-1 bg-gradient-to-r from-teal-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="p-8 flex flex-col flex-1">
            <div class="relative w-14 h-14 rounded-2xl mb-6 flex items-center justify-center
                        bg-teal-50 border border-teal-100 group-hover:bg-teal-100 group-hover:border-teal-200
                        transition-all duration-300">
                <svg class="w-7 h-7 text-teal-600 transition-transform duration-300 motion-safe:group-hover:scale-110"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
            </div>
            <h2 class="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors duration-200">
                Váltóüzenetek
            </h2>
            <p class="text-slate-500 text-sm mt-2 flex-1 leading-relaxed">
                Privát üzenetek kollégák között műszakváltáskor. A PM nem látja.
            </p>
            <ul class="mt-5 space-y-1.5">
                @foreach(['Informális üzenetcsere', 'Privát, PM-től védett', 'Gyors váltóbejegyzés'] as $feat)
                <li class="flex items-center gap-2 text-xs text-slate-400">
                    <svg class="w-3.5 h-3.5 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ $feat }}
                </li>
                @endforeach
            </ul>
            <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span class="text-sm font-semibold text-teal-600 group-hover:text-teal-700 transition-colors">Üzenetek megtekintése</span>
                <div class="w-8 h-8 rounded-full bg-teal-50 group-hover:bg-teal-600 border border-teal-100 group-hover:border-teal-600
                            flex items-center justify-center transition-all duration-300">
                    <svg class="w-4 h-4 text-teal-500 group-hover:text-white motion-safe:group-hover:translate-x-0.5 transition-all duration-200"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </div>
    </a>
    {{-- PM üzenetek --}}
    <a href="{{ route('messages.index') }}"
       class="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm
              hover:shadow-xl hover:shadow-amber-100/80 hover:border-amber-200
              motion-safe:hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div class="absolute inset-0 -translate-x-full pointer-events-none z-10
                    bg-gradient-to-r from-transparent via-amber-50/60 to-transparent
                    motion-safe:group-hover:translate-x-full
                    motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out"></div>
        <div class="h-1 bg-gradient-to-r from-amber-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="p-8 flex flex-col flex-1">
            <div class="relative w-14 h-14 rounded-2xl mb-6 flex items-center justify-center
                        bg-amber-50 border border-amber-100 group-hover:bg-amber-100 group-hover:border-amber-200
                        transition-all duration-300">
                <svg class="w-7 h-7 text-amber-600 transition-transform duration-300 motion-safe:group-hover:scale-110"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
            </div>
            <h2 class="text-xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors duration-200">
                PM üzenetek
            </h2>
            <p class="text-slate-500 text-sm mt-2 flex-1 leading-relaxed">
                A Property Manager kérései és értesítései neked.
            </p>
            <ul class="mt-5 space-y-1.5">
                @foreach(['Kérések a PM-től', 'Fontos értesítések', 'Közvetlen üzenetcsere'] as $feat)
                <li class="flex items-center gap-2 text-xs text-slate-400">
                    <svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ $feat }}
                </li>
                @endforeach
            </ul>
            <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span class="text-sm font-semibold text-amber-600 group-hover:text-amber-700 transition-colors">Üzenetek megtekintése</span>
                <div class="w-8 h-8 rounded-full bg-amber-50 group-hover:bg-amber-600 border border-amber-100 group-hover:border-amber-600
                            flex items-center justify-center transition-all duration-300">
                    <svg class="w-4 h-4 text-amber-500 group-hover:text-white motion-safe:group-hover:translate-x-0.5 transition-all duration-200"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </div>
    </a>
    @endif
    @endauth

    {{-- Napi Jelentés --}}
    <a href="{{ route('security.index') }}"
       class="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm
              hover:shadow-xl hover:shadow-rose-100/80 hover:border-rose-200
              motion-safe:hover:-translate-y-1 transition-all duration-300 flex flex-col">

        <div class="absolute inset-0 -translate-x-full pointer-events-none z-10
                    bg-gradient-to-r from-transparent via-rose-50/60 to-transparent
                    motion-safe:group-hover:translate-x-full
                    motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out"></div>

        <div class="h-1 bg-gradient-to-r from-rose-500 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div class="p-8 flex flex-col flex-1">
            <div class="relative w-14 h-14 rounded-2xl mb-6 flex items-center justify-center
                        bg-rose-50 border border-rose-100 group-hover:bg-rose-100 group-hover:border-rose-200
                        transition-all duration-300">
                <svg class="w-7 h-7 text-rose-600 transition-transform duration-300 motion-safe:group-hover:scale-110"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
            </div>

            <h2 class="text-xl font-bold text-slate-900 group-hover:text-rose-700 transition-colors duration-200">
                Napi Jelentés
            </h2>
            <p class="text-slate-500 text-sm mt-2 flex-1 leading-relaxed">
                Biztonsági szolgálat napi jelentésének digitális kitöltése és archiválása.
            </p>

            <ul class="mt-5 space-y-1.5">
                @foreach(['Szolgálat tagjai, eszközök', 'Rendkívüli események rögzítése', 'Tűzjelzések, liftek, karbantartás'] as $feat)
                <li class="flex items-center gap-2 text-xs text-slate-400">
                    <svg class="w-3.5 h-3.5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ $feat }}
                </li>
                @endforeach
            </ul>

            <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span class="text-sm font-semibold text-rose-600 group-hover:text-rose-700 transition-colors">
                    Jelentések megtekintése
                </span>
                <div class="w-8 h-8 rounded-full bg-rose-50 group-hover:bg-rose-600 border border-rose-100 group-hover:border-rose-600
                            flex items-center justify-center transition-all duration-300">
                    <svg class="w-4 h-4 text-rose-500 group-hover:text-white motion-safe:group-hover:translate-x-0.5 transition-all duration-200"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </div>
    </a>

</div>
@endsection
