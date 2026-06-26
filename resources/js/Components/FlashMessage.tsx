import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '../types';

function Toast({ type, message, onClose }: { type: 'success' | 'error'; message: string; onClose: () => void }) {
    const [leaving, setLeaving] = useState(false);

    function dismiss() {
        setLeaving(true);
        setTimeout(onClose, 220);
    }

    useEffect(() => {
        if (type === 'success') {
            const t = setTimeout(dismiss, 5000);
            return () => clearTimeout(t);
        }
    }, []);

    const isSuccess = type === 'success';
    return (
        <div className={`pointer-events-auto relative flex items-center gap-3 px-4 py-3.5 bg-white shadow-xl rounded-2xl min-w-[280px] max-w-sm overflow-hidden ${isSuccess ? 'border border-green-200' : 'border border-red-200'} ${leaving ? 'animate-slide-out-r' : 'animate-slide-in-r'}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                {isSuccess ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                ) : (
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                )}
            </div>
            <p className="text-sm font-semibold text-slate-700 flex-1">{message}</p>
            <button onClick={dismiss} className="text-slate-300 hover:text-slate-500 transition-colors ml-1 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
            {isSuccess && (
                <div className="absolute bottom-0 left-0 h-0.5 bg-green-400 rounded-full animate-toast-bar"/>
            )}
        </div>
    );
}

export default function FlashMessage() {
    const { flash } = usePage<PageProps>().props;
    const [toasts, setToasts] = useState<Array<{ id: number; type: 'success' | 'error'; message: string }>>([]);
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        if (flash.success) {
            const id = counter + 1;
            setCounter(id);
            setToasts(prev => [...prev, { id, type: 'success', message: flash.success! }]);
        }
    }, [flash.success]);

    useEffect(() => {
        if (flash.error) {
            const id = counter + 1;
            setCounter(id);
            setToasts(prev => [...prev, { id, type: 'error', message: flash.error! }]);
        }
    }, [flash.error]);

    function remove(id: number) {
        setToasts(prev => prev.filter(t => t.id !== id));
    }

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <Toast key={t.id} type={t.type} message={t.message} onClose={() => remove(t.id)}/>
            ))}
        </div>
    );
}
