import { useRef, useState, useCallback, useEffect } from 'react';

/* ─── 3D tilt + shine ─────────────────────────────────────── */
export function useTilt(intensity = 7) {
    const ref = useRef<HTMLDivElement>(null);
    const [s, setS] = useState({ rx: 0, ry: 0, hot: false, sx: 50, sy: 50 });

    const onMove = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        setS(prev => ({
            ...prev,
            rx: -dy * intensity,
            ry:  dx * intensity,
            sx: ((e.clientX - r.left) / r.width)  * 100,
            sy: ((e.clientY - r.top)  / r.height) * 100,
        }));
    }, [intensity]);

    const onEnter = useCallback(() => setS(p => ({ ...p, hot: true })),  []);
    const onLeave = useCallback(() => setS({ rx: 0, ry: 0, hot: false, sx: 50, sy: 50 }), []);

    const tiltStyle: React.CSSProperties = {
        transform: `perspective(700px) rotateX(${s.rx}deg) rotateY(${s.ry}deg) scale(${s.hot ? 1.025 : 1})`,
        transition: s.hot ? 'transform 0.08s ease-out' : 'transform 0.55s cubic-bezier(.16,1,.3,1)',
        willChange: 'transform',
    };

    const shineStyle: React.CSSProperties = {
        background: s.hot
            ? `radial-gradient(circle at ${s.sx}% ${s.sy}%, rgba(255,255,255,0.16) 0%, transparent 55%)`
            : 'none',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        borderRadius: 'inherit',
        zIndex: 10,
    };

    return { ref, hot: s.hot, tiltStyle, shineStyle, onMove, onEnter, onLeave };
}

/* ─── Cursor spotlight on card ───────────────────────────── */
export function useSpotlight(color = 'rgba(59,130,246,0.12)') {
    const ref = useRef<HTMLDivElement>(null);
    const [spot, setSpot] = useState({ x: 50, y: 50, on: false });

    const onMove = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
    }, []);
    const onLeave = useCallback(() => setSpot(p => ({ ...p, on: false })), []);

    const spotStyle: React.CSSProperties = {
        background: spot.on
            ? `radial-gradient(circle at ${spot.x}% ${spot.y}%, ${color} 0%, transparent 60%)`
            : 'transparent',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        borderRadius: 'inherit',
        transition: 'background 0.12s ease',
        zIndex: 5,
    };

    return { ref, onMove, onLeave, spotStyle };
}

/* ─── Magnetic pull on element ───────────────────────────── */
export function useMagnetic(strength = 0.35) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        function move(e: MouseEvent) {
            if (!el) return;
            const r = el.getBoundingClientRect();
            const ox = (e.clientX - r.left - r.width  / 2) * strength;
            const oy = (e.clientY - r.top  - r.height / 2) * strength;
            el.style.transform  = `translate(${ox}px, ${oy}px)`;
            el.style.transition = 'transform 0.12s ease-out';
        }
        function leave() {
            if (!el) return;
            el.style.transform  = '';
            el.style.transition = 'transform 0.55s cubic-bezier(.16,1,.3,1)';
        }

        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', leave);
        return () => {
            el.removeEventListener('mousemove', move);
            el.removeEventListener('mouseleave', leave);
        };
    }, [strength]);

    return ref as React.RefObject<HTMLElement>;
}

/* ─── Scroll reveal via IntersectionObserver ─────────────── */
export function useScrollReveal(rootMargin = '0px 0px -48px 0px') {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const targets = Array.from(container.querySelectorAll<HTMLElement>('[data-sr]'));
        if (!targets.length) return;

        targets.forEach(el => el.classList.add('sr-hidden'));

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el  = entry.target as HTMLElement;
                const delay = parseInt(el.dataset.srDelay ?? '0', 10);
                setTimeout(() => {
                    el.classList.remove('sr-hidden');
                    el.classList.add('sr-visible');
                }, delay);
                observer.unobserve(el);
            });
        }, { threshold: 0.07, rootMargin });

        targets.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [rootMargin]);

    return containerRef;
}
