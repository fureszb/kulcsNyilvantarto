import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    recovering: boolean;
}

// A blade-ből kiexportált, EGYETLEN forrású önjavító segédek
declare global {
    interface Window {
        __reloadFresh?: () => boolean;
        __isStaleChunkError?: (msg: string) => boolean;
    }
}

/**
 * Rugalmas komponens-burkoló: elkapja a React render- és lazy-chunk hibákat.
 *
 * - Elavult chunk (deploy utáni ChunkLoadError) → a blade globális
 *   reloadFresh()-ét hívja: egyetlen, cache-kerülő, SW-ürítő újratöltés
 *   (a sessionStorage loop-guard megakadályozza a végtelen hurkot).
 * - Egyéb render-hiba → letisztult fallback UI, nem fehér/sötét képernyő.
 */
export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, recovering: false };

    static getDerivedStateFromError(error: unknown): State {
        const msg = error instanceof Error ? error.message : String(error);
        const stale = typeof window !== 'undefined'
            && typeof window.__isStaleChunkError === 'function'
            && window.__isStaleChunkError(msg);
        return { hasError: true, recovering: !!stale };
    }

    componentDidCatch(error: unknown, _info: ErrorInfo): void {
        const msg = error instanceof Error ? error.message : String(error);
        if (typeof window !== 'undefined'
            && typeof window.__isStaleChunkError === 'function'
            && window.__isStaleChunkError(msg)
            && typeof window.__reloadFresh === 'function') {
            window.__reloadFresh(); // egyszeri, cache-kerülő friss újratöltés
        }
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        // Elavult chunk → épp fut a reloadFresh; ne villantsunk hibát, csak spinnert
        if (this.state.recovering) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-500">
                    <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <p className="text-sm font-medium">Új verzió betöltése…</p>
                </div>
            );
        }

        // Egyéb (nem chunk) render-hiba → letisztult fallback + kézi újratöltés
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-slate-50 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-800">Váratlan hiba történt</h1>
                    <p className="text-sm text-slate-500 mt-1">Kérjük, töltse be újra az oldalt.</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Újratöltés
                </button>
            </div>
        );
    }
}
