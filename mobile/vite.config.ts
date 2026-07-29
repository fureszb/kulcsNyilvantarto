import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Kimenet: mobile/www — ezt szinkronizálja a Capacitor CLI (`npx cap sync`) az
// ios/android natív projektek asset-mappáiba. Nem a fő Laravel `resources/js`
// Inertia buildhez tartozik — önálló SPA, saját entry ponttal.
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'www',
        emptyOutDir: true,
    },
    server: {
        port: 5180,
    },
});
