<!DOCTYPE html>
<html lang="hu" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Kulcs & Kártya Nyilvántartó')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="h-full bg-slate-50 text-slate-800 antialiased flex flex-col" x-data="{ mobileMenuOpen: false }">

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

<main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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

</body>
</html>
