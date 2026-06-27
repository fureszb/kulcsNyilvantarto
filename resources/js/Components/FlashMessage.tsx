import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '../types';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

const alertClass: Record<ToastType, string> = {
    success: 'dui-alert-success',
    error: 'dui-alert-error',
    warning: 'dui-alert-warning',
    info: 'dui-alert-info',
};

function SuccessIcon() {
    return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
        </svg>
    );
}

function ErrorIcon() {
    return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
    );
}

function WarningIcon() {
    return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
    );
}

function InfoIcon() {
    return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
    );
}

const icons: Record<ToastType, () => JSX.Element> = {
    success: SuccessIcon,
    error: ErrorIcon,
    warning: WarningIcon,
    info: InfoIcon,
};

function Toast({ type, message, onClose }: { type: ToastType; message: string; onClose: () => void }) {
    const [leaving, setLeaving] = useState(false);

    function dismiss() {
        setLeaving(true);
        setTimeout(onClose, 220);
    }

    useEffect(() => {
        const t = setTimeout(dismiss, 4500);
        return () => clearTimeout(t);
    }, []);

    const Icon = icons[type];

    return (
        <div className={`dui-alert ${alertClass[type]} shadow-lg ${leaving ? 'animate-slide-out-r' : 'animate-slide-in-r'}`}>
            <Icon />
            <span>{message}</span>
            <button
                onClick={dismiss}
                className="dui-btn dui-btn-ghost dui-btn-xs dui-btn-circle ml-auto"
                aria-label="Bezárás"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    );
}

export default function FlashMessage() {
    const { flash } = usePage<PageProps>().props;
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [counter, setCounter] = useState(0);

    function addToast(type: ToastType, message: string) {
        setCounter(prev => {
            const id = prev + 1;
            setToasts(prevToasts => [...prevToasts, { id, type, message }]);
            return id;
        });
    }

    useEffect(() => {
        if (flash.success) addToast('success', flash.success);
    }, [flash.success]);

    useEffect(() => {
        if (flash.error) addToast('error', flash.error);
    }, [flash.error]);

    useEffect(() => {
        if (flash.warning) addToast('warning', flash.warning);
    }, [flash.warning]);

    useEffect(() => {
        if (flash.info) addToast('info', flash.info);
    }, [flash.info]);

    function remove(id: number) {
        setToasts(prev => prev.filter(t => t.id !== id));
    }

    if (toasts.length === 0) return null;

    return (
        <div className="dui-toast dui-toast-top dui-toast-end z-[9990]">
            {toasts.map(t => (
                <Toast key={t.id} type={t.type} message={t.message} onClose={() => remove(t.id)} />
            ))}
        </div>
    );
}
