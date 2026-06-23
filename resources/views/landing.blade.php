<!DOCTYPE html>
<html lang="hu" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KK Nyilvántartó – Belépési pont</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-full bg-slate-50 font-sans antialiased">

    {{-- Hero header --}}
    <div class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div class="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
             style="background-image: linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px); background-size: 32px 32px;"></div>

        <div class="relative max-w-5xl mx-auto px-6 py-14 sm:py-20 text-center">
            <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>
            <h1 class="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">KK Nyilvántartó</h1>
            <p class="text-slate-400 mt-3 text-base sm:text-lg">Válassza ki a szervezetét a folytatáshoz</p>
        </div>
    </div>

    <div class="max-w-5xl mx-auto px-6 py-10 sm:py-14">

        {{-- Szervezetek --}}
        @if($tenants->isNotEmpty())
        <div class="mb-4">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                Szervezetek
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                @foreach($tenants as $tenant)
                <a href="{{ url('/' . $tenant->slug) }}"
                   class="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm
                          hover:shadow-lg hover:shadow-blue-100/80 hover:border-blue-200
                          motion-safe:hover:-translate-y-1 transition-all duration-300 cursor-pointer">

                    {{-- Top accent --}}
                    <div class="h-1 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {{-- Shimmer --}}
                    <div class="absolute inset-0 -translate-x-full pointer-events-none z-10
                                bg-gradient-to-r from-transparent via-blue-50/60 to-transparent
                                motion-safe:group-hover:translate-x-full
                                motion-safe:transition-transform motion-safe:duration-700"></div>

                    <div class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0
                                        group-hover:bg-blue-100 group-hover:border-blue-200 transition-all">
                                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                            </div>
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Aktív
                            </span>
                        </div>

                        <h2 class="text-base font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">
                            {{ $tenant->name }}
                        </h2>
                        <p class="text-xs text-slate-400 mt-1 font-mono">{{ $tenant->slug }}</p>

                        <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span class="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">Belépés</span>
                            <div class="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-600 border border-blue-100 group-hover:border-blue-600
                                        flex items-center justify-center transition-all duration-300">
                                <svg class="w-3.5 h-3.5 text-blue-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </a>
                @endforeach
            </div>
        </div>
        @else
        <div class="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-sm mb-10">
            <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
            </div>
            <p class="text-slate-500 font-semibold">Még nincs felvett szervezet</p>
            <p class="text-slate-400 text-sm mt-1">A Super Admin felületen adjon hozzá szervezeteket.</p>
        </div>
        @endif

        {{-- Elválasztó --}}
        <div class="flex items-center gap-4 my-8">
            <div class="flex-1 h-px bg-slate-200"></div>
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rendszerszintű hozzáférés</span>
            <div class="flex-1 h-px bg-slate-200"></div>
        </div>

        {{-- Super Admin kártya --}}
        <div class="max-w-sm">
            <a href="{{ route('super-admin.login') }}"
               class="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm
                      hover:shadow-lg hover:shadow-slate-200/80 hover:border-slate-300
                      motion-safe:hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center gap-5 p-5">

                <div class="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0
                            group-hover:bg-slate-800 transition-colors">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                </div>

                <div class="flex-1 min-w-0">
                    <p class="font-bold text-slate-800 group-hover:text-slate-900 transition-colors">Super Admin</p>
                    <p class="text-xs text-slate-400 mt-0.5">Szervezetek és rendszerbeállítások kezelése</p>
                </div>

                <div class="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-slate-900 border border-slate-200 group-hover:border-slate-900
                            flex items-center justify-center transition-all duration-300 shrink-0">
                    <svg class="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </a>
        </div>

    </div>

    <footer class="bg-slate-900 border-t border-white/5 px-6 py-5">
        <div class="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
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
