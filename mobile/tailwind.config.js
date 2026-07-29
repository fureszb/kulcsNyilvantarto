/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Ugyanaz a brand alias-réteg, mint a fő webes app
                // tailwind.config.js-ében (resources/js), hogy a mobil UI
                // vizuálisan egyezzen a webes felülettel.
                brand: {
                    chrome: '#0f172a',
                    accent: '#3b82f6',
                    'accent-light': '#60a5fa',
                },
            },
        },
    },
    plugins: [],
};
