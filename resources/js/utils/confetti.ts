const COLORS = ['#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316'];

interface Piece {
    x: number; y: number;
    vx: number; vy: number;
    color: string; size: number;
    life: number; rot: number; rotV: number;
    shape: 'rect' | 'circle';
}

export function launchConfetti(origin?: HTMLElement | null) {
    const canvas = document.createElement('canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;

    let ox = canvas.width  / 2;
    let oy = canvas.height * 0.55;
    if (origin) {
        const r = origin.getBoundingClientRect();
        ox = r.left + r.width  / 2;
        oy = r.top  + r.height / 2;
    }

    const pieces: Piece[] = Array.from({ length: 95 }, () => {
        const angle = (Math.random() * Math.PI * 1.5) - Math.PI * 0.25;
        const speed = 4 + Math.random() * 11;
        return {
            x: ox, y: oy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 7,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size:  5 + Math.random() * 7,
            life:  1,
            rot:   Math.random() * Math.PI * 2,
            rotV:  (Math.random() - 0.5) * 0.18,
            shape: Math.random() > 0.4 ? 'rect' : 'circle',
        };
    });

    let raf: number;
    function frame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = 0;
        for (const p of pieces) {
            p.x  += p.vx;
            p.y  += p.vy;
            p.vy += 0.28;
            p.vx *= 0.986;
            p.life -= 0.014;
            p.rot  += p.rotV;
            if (p.life <= 0) continue;
            alive++;
            ctx.save();
            ctx.globalAlpha = Math.min(1, p.life * 1.5);
            ctx.fillStyle   = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
            }
            ctx.restore();
        }
        if (alive > 0) raf = requestAnimationFrame(frame);
        else           canvas.remove();
    }
    raf = requestAnimationFrame(frame);
    setTimeout(() => { cancelAnimationFrame(raf); canvas.remove(); }, 5500);
}
