import React from 'react';

/**
 * ConfirmDialog - Beautiful modal to replace window.confirm()
 * Props:
 *   show      {bool}    - Whether dialog is visible
 *   title     {string}  - Dialog title
 *   message   {string}  - Message body
 *   onConfirm {func}    - Called when user confirms
 *   onCancel  {func}    - Called when user cancels
 *   confirmText  {string} - Confirm button text (default: 'Ya, Hapus')
 *   cancelText   {string} - Cancel button text (default: 'Batal')
 *   type      {string}  - 'danger' | 'warning' | 'info' (default: 'danger')
 */
export default function ConfirmDialog({
    show,
    title = 'Konfirmasi',
    message,
    onConfirm,
    onCancel,
    confirmText = 'Ya, Hapus',
    cancelText = 'Batal',
    type = 'danger'
}) {
    if (!show) return null;

    const confirmStyle = {
        danger:  'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
        info:    'bg-primary hover:bg-primary/90 text-white shadow-primary/20',
    };

    const iconEl = type === 'danger' ? (
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </div>
    ) : (
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onCancel}
            />
            {/* Dialog */}
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-300/50 p-8 w-full max-w-sm text-center animate-fade-in">
                {iconEl}
                <h3 className="text-lg font-extrabold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold shadow-md transition-all ${confirmStyle[type] || confirmStyle.danger}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
