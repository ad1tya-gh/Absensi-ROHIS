import React, { useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useToast } from '@/Components/Toast';

export default function UserLayout({ children, title }) {
    const { auth, flash, errors } = usePage().props;
    const { toast, showToast } = useToast();

    useEffect(() => {
        if (flash?.message) {
            showToast(flash.message, 'success');
        }
        if (flash?.error) {
            showToast(flash.error, 'error');
        }
    }, [flash]);

    useEffect(() => {
        if (errors?.error) {
            showToast(errors.error, 'error');
        }
    }, [errors]);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {toast}
            {/* User Header */}
            <header className="bg-secondary text-white shadow-lg sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img src="/images/logo-rohis.png" alt="Logo ROHIS" className="w-8 h-8 object-contain rounded-lg" />
                        <Link href={route('dashboard')} className="font-bold text-base tracking-wider hover:text-primary transition-colors">
                            ROHIS 7
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="hidden sm:inline text-xs text-gray-300">
                            {auth.user.name}
                        </span>
                        
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1.5 py-1.5 px-3 bg-white/10 hover:bg-red-600/20 hover:text-red-300 rounded-xl text-xs font-semibold text-gray-200 border border-white/5 transition-all focus:outline-none"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Title / Banner (conditional) */}
            {title && (
                <div className="bg-white border-b border-slate-100 py-4 px-4 sticky top-16 z-30">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-800">{title}</h2>
                        <Link
                            href={route('dashboard')}
                            className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Kembali</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 pb-20">
                {children}
            </main>
        </div>
    );
}
