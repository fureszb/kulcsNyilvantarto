import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

createInertiaApp({
    title: (title) => title ? `${title} – KK Nyilvántartó` : 'KK Nyilvántartó',
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#3b82f6',
    },
}).catch((err: unknown) => {
    const app = document.getElementById('app');
    if (!app) return;
    const msg = err instanceof Error ? err.message + '\n\n' + (err.stack ?? '') : String(err);
    app.innerHTML =
        `<div style="padding:24px;color:#fca5a5;font:13px/1.6 monospace;background:#0f172a;min-height:100vh;word-break:break-word;white-space:pre-wrap">` +
        `<b style="color:#f87171;font-size:15px">Inertia init error</b>\n\n${msg}</div>`;
});
