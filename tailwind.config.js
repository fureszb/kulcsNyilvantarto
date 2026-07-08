/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './resources/**/*.blade.php',
        './resources/**/*.{js,ts,jsx,tsx}',
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    ],
    safelist: [
        'from-emerald-400/40', 'bg-emerald-50', 'text-emerald-700', 'border-emerald-200', 'bg-emerald-500', 'text-emerald-600',
        'from-blue-400/40',    'bg-blue-50',    'text-blue-700',    'border-blue-200',    'bg-blue-500',
        'from-red-400/40',     'bg-red-50',     'text-red-700',     'border-red-200',     'bg-red-500',    'text-red-600',
        'from-amber-400/40',   'bg-amber-50',   'text-amber-700',   'border-amber-200',   'bg-amber-500',  'text-amber-600',
        'bg-teal-50',  'bg-teal-100',  'bg-teal-600',  'bg-teal-700',
        'text-teal-400', 'text-teal-600', 'text-teal-700',
        'border-teal-100', 'border-teal-200',
        'hover:bg-teal-600', 'hover:bg-teal-700', 'focus:border-teal-400',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Szemantikus alias-réteg a projektben MÁR élő színekre (nav/footer
                // "chrome" héj + kék akcent), hogy új komponensek ne hex-kódot vagy
                // találomra választott slate/blue árnyalatot írjanak be, hanem a
                // meglévő brand-jelentést. Nem helyettesíti a nyers Tailwind
                // paletta-osztályokat (bg-slate-900 stb. érintetlen marad).
                brand: {
                    chrome: '#0f172a',   // header/footer sötét héj (AppLayout, app.blade.php loader)
                    accent: '#3b82f6',   // kék CTA/akcent (logó, loader, linkek)
                    'accent-light': '#60a5fa',
                },
            },
            keyframes: {
                'shimmer-once': {
                    '0%':   { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(200%)' },
                },
            },
            animation: {
                'shimmer-once': 'shimmer-once 0.8s ease-in-out forwards',
            },
        },
    },
    plugins: [],
};
