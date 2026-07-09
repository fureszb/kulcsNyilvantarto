import { useEffect, useRef } from 'react';
import SignaturePadLib from 'signature_pad';

interface Props {
    label: string;
    value: string | null;
    onChange: (base64: string | null) => void;
}

/** Aláírás-canvas wrapper a `signature_pad` könyvtárra építve — a kirajzolt
 *  aláírást base64 PNG dataURL-ként adja tovább (`onChange`). */
export default function SignaturePad({ label, value, onChange }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const padRef = useRef<SignaturePadLib | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        function resize() {
            if (!canvas) return;
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext('2d')?.scale(ratio, ratio);
            padRef.current?.clear();
        }

        const pad = new SignaturePadLib(canvas, { backgroundColor: 'rgb(255,255,255)' });
        pad.addEventListener('endStroke', () => {
            onChange(pad.isEmpty() ? null : pad.toDataURL('image/png'));
        });
        padRef.current = pad;

        resize();
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
            pad.off();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function clear() {
        padRef.current?.clear();
        onChange(null);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-600">{label}</label>
                {value && (
                    <button type="button" onClick={clear} className="text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer">
                        Törlés
                    </button>
                )}
            </div>
            <canvas
                ref={canvasRef}
                className="w-full h-32 rounded-xl border border-slate-200 bg-white touch-none"
            />
        </div>
    );
}
