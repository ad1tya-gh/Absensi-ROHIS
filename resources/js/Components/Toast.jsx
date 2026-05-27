import React, { useEffect } from 'react';

const icons = {
    success: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
    ),
    info: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error:   'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info:    'bg-blue-50 border-blue-200 text-blue-700',
};

const iconBg = {
    success: 'bg-emerald-100 text-emerald-600',
    error:   'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-600',
    info:    'bg-blue-100 text-blue-600',
};

/**
 * Toast component - shows a styled popup notification
 * Props:
 *   message  {string}  - The message to display
 *   type     {string}  - 'success' | 'error' | 'warning' | 'info'
 *   onClose  {func}    - Called when toast is dismissed
 *   duration {number}  - Auto-dismiss delay in ms (default 3500)
 */
export default function Toast({ message, type = 'info', onClose, duration = 3500 }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    return (
        <div className="fixed top-5 right-5 z-[9999] pointer-events-auto" style={{ minWidth: 300, maxWidth: 420 }}>
            <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-xl shadow-slate-200/60 backdrop-blur-md animate-fade-in ${styles[type] || styles.info}`}>
                <span className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${iconBg[type] || iconBg.info}`}>
                    {icons[type] || icons.info}
                </span>
                <p className="flex-1 text-sm font-semibold leading-snug pt-1">{message}</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-shrink-0 mt-0.5 text-current opacity-50 hover:opacity-100 transition-opacity focus:outline-none"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

/**
 * useToast hook - provides showToast function and Toast component ready to render
 * Usage:
 *   const { toast, showToast } = useToast();
 *   showToast('Berhasil!', 'success');
 *   return <>{toast} <YourPage /></>;
 */
export function useToast() {
    const [toastState, setToastState] = React.useState({ message: '', type: 'info' });

    const showToast = React.useCallback((message, type = 'info') => {
        setToastState({ message, type });
    }, []);

    const hideToast = React.useCallback(() => {
        setToastState({ message: '', type: 'info' });
    }, []);

    const toastEl = toastState.message ? (
        <Toast message={toastState.message} type={toastState.type} onClose={hideToast} />
    ) : null;

    return { toast: toastEl, showToast };
}
