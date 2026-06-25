<!DOCTYPE html>
<html lang="hu" class="h-full overflow-x-hidden">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'PM Portál') – {{ app()->bound('tenant') ? app('tenant')->name : config('app.name') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        @keyframes pmHeartbeat  { 0%,100%{transform:scale(1)} 12%{transform:scale(1.018)} 24%{transform:scale(1)} 36%{transform:scale(1.01)} 52%{transform:scale(1)} }
        @keyframes pmSlideUp    { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pmFill       { from { width:0%; } to { width:var(--pw,0%); } }
        @keyframes pmToastTimer { from { width:100%; } to { width:0%; } }
        .pm-enter    { opacity:0; animation:pmSlideUp 0.65s cubic-bezier(.16,1,.3,1) forwards; animation-play-state:paused; }
        .pm-progress { width:0%; animation:pmFill 1.1s cubic-bezier(.16,1,.3,1) forwards; animation-play-state:paused; }
        body.pm-loaded .pm-enter,
        body.pm-loaded .pm-progress { animation-play-state:running; }
    </style>
</head>
<body class="min-h-full overflow-x-hidden bg-slate-50 flex flex-col">

{{-- PAGE LOADER --}}
<div id="pm-page-loader" style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#0f172a;transition:opacity 0.25s ease;">
    <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:40px 40px;"></div>
    <div style="position:absolute;top:30%;left:50%;transform:translate(-50%,-50%);width:280px;height:280px;background:radial-gradient(circle,rgba(245,158,11,0.1) 0%,transparent 70%);border-radius:50%;"></div>
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:20px;">
        <div style="position:relative;width:64px;height:64px;">
            <div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid transparent;border-top-color:#f59e0b;border-right-color:rgba(245,158,11,0.3);animation:pm-spin 0.9s linear infinite;"></div>
            <div style="position:absolute;inset:6px;border-radius:12px;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);display:flex;align-items:center;justify-content:center;">
                <svg style="width:22px;height:22px;" fill="none" stroke="#fbbf24" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
            </div>
        </div>
        <div style="width:120px;height:2px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:100%;background:linear-gradient(90deg,#f59e0b,#fbbf24);border-radius:2px;animation:pm-bar 0.5s cubic-bezier(.16,1,.3,1) forwards;transform-origin:left;"></div>
        </div>
    </div>
    <style>
        @keyframes pm-spin { to { transform:rotate(360deg); } }
        @keyframes pm-bar  { from { transform:scaleX(0); } to { transform:scaleX(1); } }
    </style>
</div>
<script>
(function() {
    var loader = document.getElementById('pm-page-loader');
    var start  = Date.now();
    var MIN    = 480;
    function hide() {
        var wait = Math.max(0, MIN - (Date.now() - start));
        setTimeout(function() {
            loader.style.opacity = '0';
            loader.style.pointerEvents = 'none';
            document.body.classList.add('pm-loaded');
            setTimeout(function() { loader.remove(); }, 260);
        }, wait);
    }
    document.addEventListener('DOMContentLoaded', hide);
})();
</script>

@yield('welcome_overlay')

{{-- TOAST NOTIFICATIONS --}}
<div class="fixed top-4 right-4 z-[998] flex flex-col gap-2 pointer-events-none">
    @if(session('success'))
    <div x-data="{ show: true }"
         x-init="setTimeout(() => show = false, 4500)"
         x-show="show"
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0 translate-x-8"
         x-transition:enter-end="opacity-100 translate-x-0"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100 translate-x-0"
         x-transition:leave-end="opacity-0 translate-x-8"
         class="pointer-events-auto relative flex items-center gap-3 px-4 py-3.5 bg-white border border-green-200 shadow-xl rounded-2xl min-w-[280px] max-w-sm overflow-hidden">
        <div class="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
        </div>
        <p class="text-sm font-semibold text-slate-700 flex-1">{{ session('success') }}</p>
        <button @click="show = false" class="text-slate-300 hover:text-slate-500 transition-colors cursor-pointer ml-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <div class="absolute bottom-0 left-0 h-0.5 bg-green-400 rounded-full" style="animation: pmToastTimer 4.5s linear forwards;"></div>
    </div>
    @endif
    @if(session('error'))
    <div x-data="{ show: true }"
         x-init="setTimeout(() => show = false, 5000)"
         x-show="show"
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0 translate-x-8"
         x-transition:enter-end="opacity-100 translate-x-0"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100 translate-x-0"
         x-transition:leave-end="opacity-0 translate-x-8"
         class="pointer-events-auto relative flex items-center gap-3 px-4 py-3.5 bg-white border border-red-200 shadow-xl rounded-2xl min-w-[280px] max-w-sm overflow-hidden">
        <div class="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </div>
        <p class="text-sm font-semibold text-slate-700 flex-1">{{ session('error') }}</p>
        <button @click="show = false" class="text-slate-300 hover:text-slate-500 transition-colors cursor-pointer ml-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <div class="absolute bottom-0 left-0 h-0.5 bg-red-400 rounded-full" style="animation: pmToastTimer 5s linear forwards;"></div>
    </div>
    @endif
</div>

{{-- HEADER --}}
<header class="bg-slate-900 border-b border-white/5 sticky top-0 z-30" x-data="{ mobileOpen: false }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">

            {{-- Brand --}}
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                </div>
                <div class="leading-tight">
                    <a href="{{ route('pm.dashboard') }}" class="text-sm font-bold text-white block hover:text-amber-400 transition-colors">
                        {{ app()->bound('tenant') ? app('tenant')->name : 'KK Nyilvántartó' }}
                    </a>
                    <span class="text-xs text-amber-500 font-semibold uppercase tracking-wider">Property Manager</span>
                </div>
            </div>

            {{-- Nav – desktop --}}
            <nav class="hidden sm:flex items-center gap-1">
                <a href="{{ route('pm.dashboard') }}"
                   class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          {{ request()->routeIs('pm.dashboard') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                    Dolgozók
                </a>
                <a href="{{ route('pm.security') }}"
                   class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          {{ request()->routeIs('pm.security') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    Napi Jelentések
                </a>
                <a href="{{ route('pm.checks') }}"
                   class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          {{ request()->routeIs('pm.checks') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                    Kulcsellenőrzések
                </a>
                <a href="{{ route('pm.messages') }}"
                   class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          {{ request()->routeIs('pm.messages*') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    Üzenetek
                </a>
            </nav>

            {{-- Right side --}}
            <div class="flex items-center gap-2">
                {{-- User chip – desktop --}}
                <div class="hidden sm:flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                    <div class="w-6 h-6 rounded-lg bg-amber-500/30 border border-amber-500/40 flex items-center justify-center shrink-0">
                        <span class="text-xs font-bold text-amber-300 leading-none">{{ mb_substr(auth('tenant')->user()->name, 0, 1) }}</span>
                    </div>
                    <span class="text-xs font-medium text-slate-300">{{ auth('tenant')->user()->name }}</span>
                </div>
                {{-- Logout – desktop --}}
                <form method="POST" action="{{ route('logout') }}" class="hidden sm:block">
                    @csrf
                    <button type="submit"
                            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Kilépés
                    </button>
                </form>
                {{-- Hamburger – mobile --}}
                <button type="button" @click="mobileOpen = !mobileOpen"
                        class="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                    <svg x-show="!mobileOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                    <svg x-show="mobileOpen" x-cloak class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>

    {{-- Mobile nav drawer --}}
    <div x-show="mobileOpen"
         x-cloak
         x-transition:enter="transition ease-out duration-150"
         x-transition:enter-start="opacity-0 -translate-y-2"
         x-transition:enter-end="opacity-100 translate-y-0"
         x-transition:leave="transition ease-in duration-100"
         x-transition:leave-start="opacity-100 translate-y-0"
         x-transition:leave-end="opacity-0 -translate-y-2"
         class="sm:hidden border-t border-white/5 bg-slate-900">
        <div class="px-4 py-3 space-y-1">
            {{-- User info --}}
            <div class="flex items-center gap-2.5 px-3 py-2.5 mb-2 border-b border-white/5">
                <div class="w-7 h-7 rounded-lg bg-amber-500/30 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <span class="text-xs font-bold text-amber-300 leading-none">{{ mb_substr(auth('tenant')->user()->name, 0, 1) }}</span>
                </div>
                <span class="text-sm font-medium text-slate-300">{{ auth('tenant')->user()->name }}</span>
            </div>
            {{-- Nav links --}}
            <a href="{{ route('pm.dashboard') }}" @click="mobileOpen = false"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                      {{ request()->routeIs('pm.dashboard') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                Dolgozók
            </a>
            <a href="{{ route('pm.security') }}" @click="mobileOpen = false"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                      {{ request()->routeIs('pm.security') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                Napi Jelentések
            </a>
            <a href="{{ route('pm.checks') }}" @click="mobileOpen = false"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                      {{ request()->routeIs('pm.checks') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                Kulcsellenőrzések
            </a>
            <a href="{{ route('pm.messages') }}" @click="mobileOpen = false"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                      {{ request()->routeIs('pm.messages*') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10' }}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Üzenetek
            </a>
            {{-- Logout --}}
            <div class="pt-2 border-t border-white/5 mt-2">
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit"
                            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Kilépés
                    </button>
                </form>
            </div>
        </div>
    </div>
</header>

{{-- MAIN --}}
<main class="flex-1 max-w-7xl mx-auto w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 py-8">
    @yield('content')
</main>

{{-- FOOTER --}}
<footer class="bg-slate-900 border-t border-white/5 px-4 sm:px-6 py-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span class="text-xs text-slate-500">KK Nyilvántartó &mdash; PM Portál &mdash; © {{ now()->year }}</span>
        </div>
        <a href="mailto:supportitsecurity@gmail.com" class="text-xs text-slate-600 hover:text-slate-400 transition-colors">supportitsecurity@gmail.com</a>
    </div>
</footer>

<script>
function pmTilt() {
    return {
        ready: false,
        init() {
            this.$el.addEventListener('animationend', (e) => {
                if (e.animationName === 'pmSlideUp') {
                    this.$el.classList.remove('pm-enter');
                    this.$el.style.opacity = '1';
                    this.ready = true;
                }
            });
        },
        tilt(e) {
            if (!this.ready) return;
            this.$el.style.transition = 'box-shadow 0.2s, border-color 0.2s, transform 0.08s ease-out';
            var r  = this.$el.getBoundingClientRect();
            var rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -9;
            var ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  9;
            this.$el.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale(1.03) translateZ(12px)';
        },
        reset() {
            if (!this.ready) return;
            this.$el.style.transition = 'box-shadow 0.2s, border-color 0.2s, transform 0.45s cubic-bezier(.16,1,.3,1)';
            this.$el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0)';
        }
    };
}
function pmCountUp(target) {
    return {
        display: 0,
        init() {
            const duration = 900, start = performance.now();
            const tick = (now) => {
                const t = Math.min((now - start) / duration, 1);
                this.display = Math.round((1 - Math.pow(1 - t, 3)) * target);
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }
    };
}
function pmWelcome() {
    return {
        show: true,
        fading: false,
        entered: false,
        init() {
            // szöveg animáció indítása
            requestAnimationFrame(() => {
                setTimeout(() => { this.entered = true; }, 50);
            });
            // elhalványítás + eltűnés
            setTimeout(() => { this.fading = true; }, 2600);
            setTimeout(() => { this.show = false; }, 3300);
        }
    };
}
</script>
</body>
</html>
