<!DOCTYPE html>
<html lang="hu" class="h-full overflow-x-hidden">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Kulcs & Kártya Nyilvántartó')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="relative min-h-full overflow-x-hidden bg-slate-50 text-slate-800 antialiased flex flex-col" x-data="{ mobileMenuOpen: false }">

<div id="page-loader" style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#0f172a;transition:opacity 0.25s ease;">
    <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:40px 40px;"></div>
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:20px;">
        <div style="position:relative;width:64px;height:64px;">
            <div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid transparent;border-top-color:#3b82f6;border-right-color:rgba(59,130,246,0.3);animation:ldr-spin 0.9s linear infinite;"></div>
            <div style="position:absolute;inset:6px;border-radius:12px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);display:flex;align-items:center;justify-content:center;">
                <svg style="width:22px;height:22px;" fill="none" stroke="#60a5fa" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>
        </div>
        <div style="width:120px;height:2px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:100%;background:linear-gradient(90deg,#3b82f6,#60a5fa);border-radius:2px;animation:ldr-bar 0.5s cubic-bezier(.16,1,.3,1) forwards;transform-origin:left;"></div>
        </div>
    </div>
    <style>
        @keyframes ldr-spin { to { transform:rotate(360deg); } }
        @keyframes ldr-bar  { from { transform:scaleX(0); } to { transform:scaleX(1); } }
    </style>
</div>
<script>
(function() {
    var loader = document.getElementById('page-loader');
    var start  = Date.now(), MIN = 480;
    function hide() {
        var wait = Math.max(0, MIN - (Date.now() - start));
        setTimeout(function() {
            loader.style.opacity = '0';
            loader.style.pointerEvents = 'none';
            setTimeout(function() { loader.remove(); }, 260);
        }, wait);
    }
    document.addEventListener('DOMContentLoaded', hide);
})();
</script>

@yield('welcome_overlay')

@php
    $__navUser = auth('tenant')->user();
    $__newNotes    = 0;
    $__newMessages = 0;
    if ($__navUser && !$__navUser->isPropertyManager()) {
        $__since = $__navUser->notes_read_at ?? \Carbon\Carbon::parse('1970-01-01');
        $__newNotes = \App\Models\ShiftNote::where('created_at', '>', $__since)
            ->where('user_id', '!=', $__navUser->id)
            ->count();
        $__since = $__navUser->messages_read_at ?? \Carbon\Carbon::parse('1970-01-01');
        $__newMessages = \App\Models\PmMessage::visibleTo($__navUser->id)
            ->where('created_at', '>', $__since)
            ->count();
    }
@endphp

<header class="bg-slate-900 border-b border-white/5 shadow-xl sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

            {{-- Brand --}}
            <a href="{{ route('home') }}" class="flex items-center gap-3 group min-w-0">
                <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg group-hover:bg-blue-500 transition-colors shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                </div>
                <div class="leading-tight min-w-0">
                    <span class="text-white font-bold text-sm block truncate">
                        {{ app()->bound('tenant') ? app('tenant')->name : config('app.name') }}
                    </span>
                    <span class="text-slate-400 text-xs font-medium hidden sm:block">Kulcs & Kártya ellenőrzés</span>
                </div>
            </a>

            {{-- Desktop Nav --}}
            <nav class="hidden sm:flex items-center gap-1">
                <a href="{{ route('home') }}"
                   class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          {{ request()->routeIs('home') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Kezdőlap
                </a>
                @auth('tenant')
                <a href="{{ route('security.index') }}"
                   class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          {{ request()->routeIs('security.*') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    Napi Jelentés
                </a>
                @endauth
                @auth('tenant')
                @if(!auth('tenant')->user()->isPropertyManager())
                <a href="{{ route('notes.index') }}"
                   class="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          {{ request()->routeIs('notes.*') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                    Váltóüzenetek
                    @if($__newNotes > 0)
                    <span class="absolute -top-1 -right-1 min-w-[1.15rem] h-[1.15rem] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none px-0.5">{{ $__newNotes > 9 ? '9+' : $__newNotes }}</span>
                    @endif
                </a>
                <a href="{{ route('messages.index') }}"
                   class="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          {{ request()->routeIs('messages.*') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    PM üzenetek
                    @if($__newMessages > 0)
                    <span class="absolute -top-1 -right-1 min-w-[1.15rem] h-[1.15rem] flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none px-0.5">{{ $__newMessages > 9 ? '9+' : $__newMessages }}</span>
                    @endif
                </a>
                @endif
                @endauth

                @auth('tenant')
                <div class="flex items-center gap-2 pl-2 ml-1 border-l border-white/10">
                    <a href="{{ route('profile.edit') }}"
                       class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:text-white hover:bg-white/10">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        {{ auth('tenant')->user()->name }}
                    </a>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit"
                                class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:text-white hover:bg-white/10">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                            Kilépés
                        </button>
                    </form>
                    @if(auth('tenant')->user()->isAdmin())
                    <a href="{{ route('admin.settings.edit') }}"
                       class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                              {{ request()->routeIs('admin.*') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        Beállítások
                    </a>
                    @endif
                </div>
                @endauth
            </nav>

            {{-- Mobile hamburger --}}
            <button @click="mobileMenuOpen = !mobileMenuOpen"
                    class="sm:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <svg x-show="!mobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
                <svg x-show="mobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display:none;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    </div>

    {{-- Mobile dropdown menu --}}
    <div x-show="mobileMenuOpen"
         x-transition:enter="transition ease-out duration-100"
         x-transition:enter-start="opacity-0 -translate-y-1"
         x-transition:enter-end="opacity-100 translate-y-0"
         x-transition:leave="transition ease-in duration-75"
         x-transition:leave-start="opacity-100 translate-y-0"
         x-transition:leave-end="opacity-0 -translate-y-1"
         class="sm:hidden border-t border-white/10 px-4 py-3 space-y-1"
         style="display: none;">
        <a href="{{ route('home') }}"
           @click="mobileMenuOpen = false"
           class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  {{ request()->routeIs('home') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Kezdőlap
        </a>

        @auth('tenant')
        <a href="{{ route('security.index') }}"
           @click="mobileMenuOpen = false"
           class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  {{ request()->routeIs('security.*') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Napi Jelentés
        </a>
        @if(!auth('tenant')->user()->isPropertyManager())
        <a href="{{ route('notes.index') }}"
           @click="mobileMenuOpen = false"
           class="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  {{ request()->routeIs('notes.*') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
            Váltóüzenetek
            @if($__newNotes > 0)
            <span class="ml-auto min-w-[1.4rem] h-[1.4rem] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none px-1">{{ $__newNotes > 9 ? '9+' : $__newNotes }}</span>
            @endif
        </a>
        <a href="{{ route('messages.index') }}"
           @click="mobileMenuOpen = false"
           class="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  {{ request()->routeIs('messages.*') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            PM üzenetek
            @if($__newMessages > 0)
            <span class="ml-auto min-w-[1.4rem] h-[1.4rem] flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none px-1">{{ $__newMessages > 9 ? '9+' : $__newMessages }}</span>
            @endif
        </a>
        @endif
        @endauth
        @auth('tenant')
        <a href="{{ route('profile.edit') }}"
           @click="mobileMenuOpen = false"
           class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-white/10">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            {{ auth('tenant')->user()->name }}
        </a>
        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Kilépés
            </button>
        </form>
        @if(auth('tenant')->user()->isAdmin())
        <a href="{{ route('admin.settings.edit') }}"
           @click="mobileMenuOpen = false"
           class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  {{ request()->routeIs('admin.*') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Beállítások
        </a>
        @endif
        @endauth
    </div>
</header>

<main class="flex-1 max-w-7xl mx-auto w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    @if(session('success'))
        <div class="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl"
             x-data x-init="setTimeout(() => $el.remove(), 5000)">
            <svg class="w-5 h-5 shrink-0 mt-0.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="font-medium">{{ session('success') }}</span>
        </div>
    @endif
    @if(session('error'))
        <div class="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
            <svg class="w-5 h-5 shrink-0 mt-0.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
            <span class="font-medium">{{ session('error') }}</span>
        </div>
    @endif

    @yield('content')
</main>

<footer class="bg-slate-900 border-t border-white/5 px-4 sm:px-6 lg:px-8 py-5">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
            </div>
            <div class="leading-tight">
                <span class="text-sm font-semibold text-white block">{{ app()->bound('tenant') ? app('tenant')->name : 'Kulcs & Kártya Nyilvántartó' }}</span>
                <span class="text-xs text-slate-500">&copy; {{ now()->year }}</span>
            </div>
        </div>
        <a href="mailto:supportitsecurity@gmail.com"
           class="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            supportitsecurity@gmail.com
        </a>
    </div>
</footer>

<script>
/* ─── Custom Time Picker ───────────────────────────────────────────────── */
(function () {
    const HOURS = Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'));
    const MINS  = ['00','05','10','15','20','25','30','35','40','45','50','55'];
    const initialized = new WeakSet();

    function buildPicker(input) {
        if (initialized.has(input)) return;
        initialized.add(input);

        const [initH, initM] = (input.value || '').split(':');
        let hour = initH || '';
        let min  = (initM ? initM.slice(0,2) : '') || '';

        /* wrapper */
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:inline-block;vertical-align:middle;';
        if (input.classList.contains('w-full')) wrap.style.width = '100%';
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);

        /* hide original input but keep it functional for Alpine + form */
        input.style.cssText = 'position:absolute;opacity:0;pointer-events:none;width:0;height:0;overflow:hidden;';

        /* trigger button – copies border/bg/padding from original */
        const btn = document.createElement('button');
        btn.type = 'button';
        const baseClass = [
            ...input.classList
        ].filter(c => !c.startsWith('focus:') && c !== 'w-full' && c !== 'w-28' && c !== 'w-24')
         .join(' ');
        btn.className = baseClass + ' flex items-center gap-1.5 cursor-pointer';
        if (input.classList.contains('w-full')) btn.style.width = '100%';
        if (input.classList.contains('w-28'))   btn.style.width = '7rem';
        if (input.classList.contains('w-24'))   btn.style.width = '6rem';

        function renderBtn() {
            const label = (hour && min !== '') ? `${hour}:${min}` : '--:--';
            btn.innerHTML = `
                <svg style="width:13px;height:13px;flex-shrink:0;color:#94a3b8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span style="font-family:monospace;font-size:.8125rem;color:${hour ? '#334155' : '#94a3b8'}">${label}</span>`;
        }
        renderBtn();
        wrap.appendChild(btn);

        /* if the input had focus when we wrapped it, move focus to the button */
        if (document.activeElement === input) btn.focus();

        /* dropdown – appended to body, position:fixed to escape overflow:hidden parents */
        const drop = document.createElement('div');
        drop.style.cssText = 'display:none;position:fixed;z-index:99999;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 12px 28px rgba(0,0,0,.15);overflow:hidden;min-width:140px;';
        drop.dataset.tpDrop = '1';
        document.body.appendChild(drop);

        function reposition() {
            const rect = wrap.getBoundingClientRect();
            const dropH = 240;
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow >= dropH + 8 || spaceBelow >= rect.top) {
                drop.style.top = (rect.bottom + 4) + 'px';
            } else {
                drop.style.top = (rect.top - dropH - 4) + 'px';
            }
            drop.style.left     = rect.left + 'px';
            drop.style.minWidth = Math.max(rect.width, 140) + 'px';
        }

        /* dropdown header */
        const hdr = document.createElement('div');
        hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #f1f5f9;';
        hdr.innerHTML = '<span style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em">Időpont</span>';
        const hdrVal = document.createElement('span');
        hdrVal.style.cssText = 'font-family:monospace;font-size:13px;font-weight:700;color:#334155;';
        hdrVal.textContent = (hour && min !== '') ? `${hour}:${min}` : '--:--';
        hdr.appendChild(hdrVal);
        drop.appendChild(hdr);

        /* columns wrapper */
        const cols = document.createElement('div');
        cols.style.cssText = 'display:flex;';

        function makeCol(label, items, getCurrent, setCurrent) {
            const col = document.createElement('div');
            col.style.cssText = 'display:flex;flex-direction:column;overflow-y:auto;height:176px;width:70px;';
            const colHdr = document.createElement('div');
            colHdr.style.cssText = 'padding:4px 0;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;text-align:center;border-bottom:1px solid #f1f5f9;position:sticky;top:0;background:#fff;';
            colHdr.textContent = label;
            col.appendChild(colHdr);

            items.forEach(val => {
                const item = document.createElement('button');
                item.type = 'button';
                item.dataset.val = val;
                item.style.cssText = 'width:100%;padding:7px 0;font-family:monospace;font-size:13px;text-align:center;cursor:pointer;border:none;background:transparent;transition:background .1s,color .1s;flex-shrink:0;';
                item.textContent = val;

                function refreshActive() {
                    const active = getCurrent() === val;
                    item.style.background = active ? '#ffe4e6' : '';
                    item.style.color      = active ? '#be123c' : '#334155';
                    item.style.fontWeight = active ? '700' : '400';
                }
                refreshActive();

                item.addEventListener('mouseenter', () => { if (getCurrent() !== val) item.style.background = '#fef2f2'; });
                item.addEventListener('mouseleave', () => refreshActive());

                item.addEventListener('click', e => {
                    e.stopPropagation();
                    setCurrent(val);
                    col.querySelectorAll('button[data-val]').forEach(b => {
                        const a = getCurrent() === b.dataset.val;
                        b.style.background = a ? '#ffe4e6' : '';
                        b.style.color      = a ? '#be123c' : '#334155';
                        b.style.fontWeight = a ? '700' : '400';
                    });
                });
                col.appendChild(item);
            });
            return col;
        }

        const hourCol = makeCol('Óra', HOURS,
            () => hour,
            val => { hour = val; syncInput(); }
        );
        const minCol = makeCol('Perc', MINS,
            () => min,
            val => { min = val; syncInput(); closeDrop(); }
        );

        /* separator */
        const sep = document.createElement('div');
        sep.style.cssText = 'width:1px;background:#f1f5f9;flex-shrink:0;';

        cols.appendChild(hourCol);
        cols.appendChild(sep);
        cols.appendChild(minCol);
        drop.appendChild(cols);

        function syncInput() {
            const val = (hour && min !== '') ? `${hour}:${min}` : '';
            input.value = val;
            input.dispatchEvent(new Event('input',  {bubbles: true}));
            input.dispatchEvent(new Event('change', {bubbles: true}));
            renderBtn();
            hdrVal.textContent = val || '--:--';
        }

        function scrollToCurrent() {
            if (hour) {
                const el = hourCol.querySelector(`[data-val="${hour}"]`);
                if (el) hourCol.scrollTop = el.offsetTop - 30;
            }
            if (min) {
                const el = minCol.querySelector(`[data-val="${min}"]`);
                if (el) minCol.scrollTop = el.offsetTop - 30;
            }
        }

        function closeDrop() {
            drop.style.display = 'none';
        }

        function onScroll() {
            if (drop.style.display !== 'none') {
                if (!document.body.contains(wrap)) { closeDrop(); return; }
                reposition();
            }
        }
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onScroll);

        btn.addEventListener('click', e => {
            e.stopPropagation();
            const visible = drop.style.display !== 'none';
            document.querySelectorAll('[data-tp-drop]').forEach(d => d.style.display = 'none');
            if (!visible) {
                reposition();
                drop.style.display = 'block';
                scrollToCurrent();
            }
        });

        document.addEventListener('click', e => {
            if (!wrap.contains(e.target) && !drop.contains(e.target)) closeDrop();
        });
    }

    function initAll() {
        document.querySelectorAll('input[type="time"]').forEach(buildPicker);
    }

    document.addEventListener('alpine:initialized', initAll);

    /* catch dynamically added rows – rAF batches Alpine mutations and fires before user events */
    let _obsFrame;
    const obs = new MutationObserver(() => {
        cancelAnimationFrame(_obsFrame);
        _obsFrame = requestAnimationFrame(initAll);
    });
    document.addEventListener('DOMContentLoaded', () => {
        obs.observe(document.body, {childList: true, subtree: true});
    });
})();

/* ── iOS / Android focus-scroll fix ──────────────────────────────────────
   On mobile Safari, focusing an input inside a non-scrollable ancestor can
   cause the page to jump to y=0. After the keyboard opens (~350ms), we
   scroll the focused element back into the center of the remaining viewport.
   Safe for Android too: if no jump occurred, scrollIntoView is a no-op.    */
(function () {
    var _focusScrollTimer;
    document.addEventListener('focusin', function (e) {
        var el = e.target;
        if (!el || !el.matches('input:not([type=hidden]):not([readonly]):not([disabled]), textarea:not([disabled]), select:not([disabled])')) return;
        clearTimeout(_focusScrollTimer);
        _focusScrollTimer = setTimeout(function () {
            if (document.activeElement !== el) return;
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 350);
    }, { passive: true, capture: true });

    document.addEventListener('focusout', function () {
        clearTimeout(_focusScrollTimer);
    }, { passive: true, capture: true });
})();
/* ─────────────────────────────────────────────────────────────────────── */

/* ── Visual viewport resize (keyboard open/close on mobile) ──────────── */
(function () {
    if (!window.visualViewport) return;
    window.visualViewport.addEventListener('resize', function () {
        window.dispatchEvent(new CustomEvent('vp-resize'));
    });
    window.visualViewport.addEventListener('scroll', function () {
        window.dispatchEvent(new CustomEvent('vp-resize'));
    });
})();
/* iOS Chrome: keyboard triggers window.resize, not visualViewport.resize */
window.addEventListener('resize', function () {
    window.dispatchEvent(new CustomEvent('vp-resize'));
}, { passive: true });
/* ─────────────────────────────────────────────────────────────────────── */

/* ── Capture ALL scroll events (body, overflow containers, etc.) ───────── */
document.addEventListener('scroll', function () {
    window.dispatchEvent(new CustomEvent('doc-scroll'));
}, { capture: true, passive: true });
/* ─────────────────────────────────────────────────────────────────────── */

function userWelcome() {
    return {
        show: true,
        fading: false,
        entered: false,
        init() {
            requestAnimationFrame(() => {
                setTimeout(() => { this.entered = true; }, 50);
            });
            setTimeout(() => { this.fading = true; }, 2600);
            setTimeout(() => { this.show = false; }, 3300);
        }
    };
}
</script>
</body>
</html>
