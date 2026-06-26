{{--
    Kulcs/Kártya Státusz Kártya – Alpine.js interaktív demo
    --------------------------------------------------------
    Önálló, Alpine.data()-vezérelt kártya. Minden státusz
    valós időben vált, smooth CSS transition + x-transition
    animációkkal. Dashboard widget-ként vagy demo oldalon
    használható.

    @once direktíva garantálja, hogy az Alpine.data definíció
    csak egyszer kerül a DOM-ba, még ha több ilyen kártya van
    is az oldalon.

    Tailwind JIT – az összes dinamikus class string explicit,
    literal formában szerepel a sablonban (x-show blokkok),
    így a scanner minden variánst felvesz a CSS-be.
--}}

@once
<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('keyStatusCard', (initialStatus = 'available') => ({
        status: initialStatus,
        animating: false,

        statuses: ['available', 'assigned', 'lost', 'maintenance'],

        labels: {
            available:   'Elérhető',
            assigned:    'Kiosztva',
            lost:        'Elveszett',
            maintenance: 'Karbantartás',
        },

        setStatus(s) {
            if (this.status === s || this.animating) return;
            this.animating = true;
            this.status = s;
            setTimeout(() => { this.animating = false; }, 350);
        },

        get accentClass() {
            const map = {
                available:   'from-emerald-500/60',
                assigned:    'from-blue-500/60',
                lost:        'from-red-500/60',
                maintenance: 'from-amber-500/60',
            };
            return map[this.status] ?? map.available;
        },

        get dotClass() {
            const map = {
                available:   'bg-emerald-400',
                assigned:    'bg-blue-400',
                lost:        'bg-red-400',
                maintenance: 'bg-amber-400',
            };
            return map[this.status] ?? map.available;
        },
    }));
});
</script>
@endonce

<div x-data="keyStatusCard('available')"
     class="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-700/50
            p-5 select-none
            transition-all duration-300 ease-out
            hover:border-slate-600/60 hover:shadow-2xl hover:shadow-black/50
            motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.01]"
     role="region"
     aria-label="Kulcs státusz kártya – interaktív demo">

    {{-- Státusz-színű felső accent vonal (smooth color transition) --}}
    <div aria-hidden="true"
         class="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r to-transparent
                opacity-75 group-hover:opacity-100 transition-all duration-500"
         :class="accentClass"></div>

    {{-- Shimmer sweep --}}
    <div aria-hidden="true"
         class="absolute inset-0 -translate-x-full pointer-events-none z-10
                bg-gradient-to-r from-transparent via-white/[0.04] to-transparent
                motion-safe:group-hover:translate-x-full
                motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out"></div>

    {{-- ── Fejléc ── --}}
    <div class="flex items-start justify-between mb-4">

        <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl
                        bg-slate-800 border border-slate-700/50
                        transition-colors duration-300 group-hover:border-slate-600/60">
                <svg class="w-5 h-5 text-slate-300
                            transition-transform duration-300 ease-out
                            motion-safe:group-hover:rotate-[20deg]"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>
            <span class="text-[10px] font-mono tracking-widest text-slate-500 uppercase">KEY-042</span>
        </div>

        {{-- Badge konténer – fix magasság, hogy ne ugorjon a layout --}}
        <div class="relative h-6 min-w-[90px] flex items-center justify-end" aria-live="polite" aria-atomic="true">

            <div x-show="status === 'available'"
                 x-transition:enter="transition ease-out duration-200"
                 x-transition:enter-start="opacity-0 scale-75 -translate-y-1"
                 x-transition:enter-end="opacity-100 scale-100 translate-y-0"
                 x-transition:leave="transition ease-in duration-150"
                 x-transition:leave-start="opacity-100 scale-100 translate-y-0"
                 x-transition:leave-end="opacity-0 scale-75 translate-y-1"
                 class="absolute right-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                        bg-emerald-950/80 text-emerald-400 border-emerald-800/50"
                 style="display:none;">
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                Elérhető
            </div>

            <div x-show="status === 'assigned'"
                 x-transition:enter="transition ease-out duration-200"
                 x-transition:enter-start="opacity-0 scale-75 -translate-y-1"
                 x-transition:enter-end="opacity-100 scale-100 translate-y-0"
                 x-transition:leave="transition ease-in duration-150"
                 x-transition:leave-start="opacity-100 scale-100 translate-y-0"
                 x-transition:leave-end="opacity-0 scale-75 translate-y-1"
                 class="absolute right-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                        bg-blue-950/80 text-blue-400 border-blue-800/50"
                 style="display:none;">
                <span class="relative flex h-1.5 w-1.5 shrink-0">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-400"></span>
                </span>
                Kiosztva
            </div>

            <div x-show="status === 'lost'"
                 x-transition:enter="transition ease-out duration-200"
                 x-transition:enter-start="opacity-0 scale-75 -translate-y-1"
                 x-transition:enter-end="opacity-100 scale-100 translate-y-0"
                 x-transition:leave="transition ease-in duration-150"
                 x-transition:leave-start="opacity-100 scale-100 translate-y-0"
                 x-transition:leave-end="opacity-0 scale-75 translate-y-1"
                 class="absolute right-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                        bg-red-950/80 text-red-400 border-red-800/50"
                 style="display:none;">
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400"></span>
                Elveszett
            </div>

            <div x-show="status === 'maintenance'"
                 x-transition:enter="transition ease-out duration-200"
                 x-transition:enter-start="opacity-0 scale-75 -translate-y-1"
                 x-transition:enter-end="opacity-100 scale-100 translate-y-0"
                 x-transition:leave="transition ease-in duration-150"
                 x-transition:leave-start="opacity-100 scale-100 translate-y-0"
                 x-transition:leave-end="opacity-0 scale-75 translate-y-1"
                 class="absolute right-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                        bg-amber-950/80 text-amber-400 border-amber-800/50"
                 style="display:none;">
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
                Karbantartás
            </div>
        </div>
    </div>

    {{-- ── Tétel neve ── --}}
    <h3 class="text-white font-semibold text-base leading-tight truncate
               transition-colors duration-200 group-hover:text-slate-50">
        Főbejárat kulcs
    </h3>

    {{-- ── Státusz-specifikus meta tartalom ── --}}
    <div class="mt-3 min-h-[1.25rem] text-xs" aria-live="polite">

        <div x-show="status === 'available'"
             x-transition:enter="transition ease-out duration-200"
             x-transition:enter-start="opacity-0 translate-y-1"
             x-transition:enter-end="opacity-100 translate-y-0"
             x-transition:leave="transition ease-in duration-150"
             x-transition:leave-start="opacity-100 translate-y-0"
             x-transition:leave-end="opacity-0 translate-y-1"
             class="flex items-center gap-2 text-emerald-400/70"
             style="display:none;">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Elvihető · Kulcstárban</span>
        </div>

        <div x-show="status === 'assigned'"
             x-transition:enter="transition ease-out duration-200"
             x-transition:enter-start="opacity-0 translate-y-1"
             x-transition:enter-end="opacity-100 translate-y-0"
             x-transition:leave="transition ease-in duration-150"
             x-transition:leave-start="opacity-100 translate-y-0"
             x-transition:leave-end="opacity-0 translate-y-1"
             class="flex items-center gap-2 text-slate-400"
             style="display:none;">
            <svg class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span class="text-slate-300 font-medium">Nagy János</span>
            <span class="text-slate-600">·</span>
            <span class="text-slate-500">2 napja</span>
        </div>

        <div x-show="status === 'lost'"
             x-transition:enter="transition ease-out duration-200"
             x-transition:enter-start="opacity-0 translate-y-1"
             x-transition:enter-end="opacity-100 translate-y-0"
             x-transition:leave="transition ease-in duration-150"
             x-transition:leave-start="opacity-100 translate-y-0"
             x-transition:leave-end="opacity-0 translate-y-1"
             class="flex items-center gap-2 text-red-400/80"
             style="display:none;">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span>Azonnali intézkedés szükséges</span>
        </div>

        <div x-show="status === 'maintenance'"
             x-transition:enter="transition ease-out duration-200"
             x-transition:enter-start="opacity-0 translate-y-1"
             x-transition:enter-end="opacity-100 translate-y-0"
             x-transition:leave="transition ease-in duration-150"
             x-transition:leave-start="opacity-100 translate-y-0"
             x-transition:leave-end="opacity-0 translate-y-1"
             class="flex items-center gap-2 text-amber-400/80"
             style="display:none;">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <span>Karbantartás alatt · Visszatérés: jövő héten</span>
        </div>
    </div>

    {{-- Helyszín --}}
    <div class="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
        <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span>Irodaház · B szárny</span>
    </div>

    {{-- ── Állapot váltó gombok (demo) ── --}}
    <div class="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap gap-1.5" role="group" aria-label="Státusz váltó">
        <template x-for="s in statuses" :key="s">
            <button @click="setStatus(s)"
                    :class="status === s
                        ? 'bg-slate-700 text-white ring-1 ring-slate-600'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'"
                    :aria-pressed="status === s"
                    class="px-2.5 py-1 rounded-lg text-xs font-medium
                           transition-all duration-200 cursor-pointer focus-visible:outline-none
                           focus-visible:ring-2 focus-visible:ring-blue-500"
                    x-text="labels[s]">
            </button>
        </template>
    </div>

    {{-- RFID antenna dekoráció --}}
    <div aria-hidden="true"
         class="absolute bottom-3 right-3 pointer-events-none rotate-90
                opacity-[0.05] group-hover:opacity-[0.12]
                transition-opacity duration-500">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
             stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
            <path d="M4.222 12.222c4.296-4.296 11.26-4.296 15.556 0"/>
            <path d="M7.05 15.05c2.734-2.734 7.166-2.734 9.9 0"/>
            <circle cx="12" cy="19" r="1" fill="white"/>
        </svg>
    </div>
</div>
