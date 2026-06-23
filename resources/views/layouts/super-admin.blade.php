<!DOCTYPE html>
<html lang="hu" class="h-full bg-slate-100">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Super Admin') – KK Nyilvántartó</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="h-full flex flex-col" x-data="{ mobileMenuOpen: false }">

    <header class="bg-slate-900 border-b border-white/5 shadow-xl sticky top-0 z-30">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

            {{-- Brand --}}
            <a href="{{ route('super-admin.dashboard') }}" class="flex items-center gap-3 group">
                <div class="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-indigo-500 transition-colors shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                </div>
                <div class="leading-tight">
                    <span class="text-white font-bold text-sm block">KK Nyilvántartó</span>
                    <span class="text-slate-500 text-xs font-medium">Super Admin</span>
                </div>
            </a>

            {{-- Desktop actions --}}
            @if(Auth::guard('web')->check())
            <div class="hidden sm:flex items-center gap-2">
                <a href="{{ route('landing') }}"
                   class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:text-white hover:bg-white/10">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Kezdőlap
                </a>
                <a href="{{ route('super-admin.dashboard') }}"
                   class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          {{ request()->routeIs('super-admin.dashboard') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    Cégek
                </a>
                <form method="POST" action="{{ route('super-admin.logout') }}">
                    @csrf
                    <button type="submit"
                            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Kijelentkezés
                    </button>
                </form>
            </div>

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
            @endif
        </div>

        {{-- Mobile menu --}}
        @if(Auth::guard('web')->check())
        <div x-show="mobileMenuOpen"
             x-transition:enter="transition ease-out duration-100"
             x-transition:enter-start="opacity-0 -translate-y-1"
             x-transition:enter-end="opacity-100 translate-y-0"
             x-transition:leave="transition ease-in duration-75"
             x-transition:leave-start="opacity-100 translate-y-0"
             x-transition:leave-end="opacity-0 -translate-y-1"
             class="sm:hidden border-t border-white/10 px-4 py-3 space-y-1"
             style="display: none;">
            <a href="{{ route('landing') }}"
               @click="mobileMenuOpen = false"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-white/10">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Kezdőlap
            </a>
            <a href="{{ route('super-admin.dashboard') }}"
               @click="mobileMenuOpen = false"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      {{ request()->routeIs('super-admin.dashboard') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                Cégek
            </a>
            <form method="POST" action="{{ route('super-admin.logout') }}">
                @csrf
                <button type="submit"
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Kijelentkezés
                </button>
            </form>
        </div>
        @endif
    </header>

    <main class="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        @if(session('success'))
            <div class="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
                <svg class="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                {{ session('success') }}
            </div>
        @endif
        @if(session('error'))
            <div class="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
                <svg class="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                {{ session('error') }}
            </div>
        @endif
        @yield('content')
    </main>

    <footer class="bg-slate-900 border-t border-white/5 px-4 sm:px-6 py-5">
        <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                </div>
                <div class="leading-tight">
                    <span class="text-sm font-semibold text-white block">KK Nyilvántartó</span>
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
