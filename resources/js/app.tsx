import './bootstrap';
import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from './Components/ErrorBoundary';
import PWAInstallGuard from './Components/PWAInstallGuard';

// ── localStorage séma-verzió őr ────────────────────────────
// Ha a kliens-oldali state-séma breaking módon változik, EMELD ezt a számot.
// Ekkor a régi (esetleg összeomlást okozó) state törlődik. Sima deploy NEM
// emeli — így a felhasználói beállítások (pl. oktatás-progress) megmaradnak.
const STORAGE_VERSION = '1';
try {
    const stored = localStorage.getItem('__app_storage_version');
    if (stored !== STORAGE_VERSION) {
        if (stored !== null) localStorage.clear(); // csak valódi verzióváltásnál
        localStorage.setItem('__app_storage_version', STORAGE_VERSION);
    }
} catch { /* privát mód / letiltott storage — nem kritikus */ }

// ── Page transition overlay ───────────────────────────────
let ptOverlay: HTMLDivElement | null = null;

router.on('start', () => {
    if ((window as Window & { __silentReload?: boolean }).__silentReload) {
        (window as Window & { __silentReload?: boolean }).__silentReload = false;
        document.documentElement.classList.add('no-progress');
        return;
    }
    if (ptOverlay) return;
    ptOverlay = document.createElement('div');
    ptOverlay.id = 'page-trans-overlay';
    document.body.appendChild(ptOverlay);
    requestAnimationFrame(() => ptOverlay?.classList.add('pt-active'));
});

router.on('finish', () => {
    document.documentElement.classList.remove('no-progress');
    if (!ptOverlay) return;
    const el = ptOverlay;
    ptOverlay = null;
    el.classList.remove('pt-active');
    setTimeout(() => el.remove(), 250);

    // Re-init scroll reveal for freshly rendered [data-sr] elements
    requestAnimationFrame(() => {
        const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-sr]:not(.sr-visible)'));
        if (!targets.length) return;
        targets.forEach(el => el.classList.add('sr-hidden'));
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const t = e.target as HTMLElement;
                setTimeout(() => {
                    t.classList.remove('sr-hidden');
                    t.classList.add('sr-visible');
                }, parseInt(t.dataset.srDelay ?? '0', 10));
                obs.unobserve(t);
            });
        }, { threshold: 0.07, rootMargin: '0px 0px -48px 0px' });
        targets.forEach(el => obs.observe(el));
    });
});

createInertiaApp({
    title: (title) => title ? `${title} – KK Nyilvántartó` : 'KK Nyilvántartó',
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ErrorBoundary>
                <App {...props} />
                <PWAInstallGuard />
            </ErrorBoundary>
        );
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
