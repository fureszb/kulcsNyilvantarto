/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    ],
    safelist: [
        // key-card komponens dinamikus státusz osztályai (light theme)
        'from-emerald-400/40', 'bg-emerald-50', 'text-emerald-700', 'border-emerald-200', 'bg-emerald-500', 'text-emerald-600',
        'from-blue-400/40',    'bg-blue-50',    'text-blue-700',    'border-blue-200',    'bg-blue-500',
        'from-red-400/40',     'bg-red-50',     'text-red-700',     'border-red-200',     'bg-red-500',    'text-red-600',
        'from-amber-400/40',   'bg-amber-50',   'text-amber-700',   'border-amber-200',   'bg-amber-500',  'text-amber-600',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            colors: {
                corp: {
                    dark: '#1e3a5f',
                    mid:  '#2c5282',
                    light: '#ebf4ff',
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
