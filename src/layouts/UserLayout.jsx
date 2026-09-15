import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../lib/supabaseQueries';
import { useToast } from '../components/Toast';

export default function UserLayout({ children }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast, showToast } = useToast();

    const navItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: 'Absensi',
            href: '/absen',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (e) {
            showToast('Gagal logout. Coba lagi.', 'error');
        }
    };

    const isActive = (href) => location.pathname === href;

    const SidebarContent = () => (
        <>
            <div className="h-16 flex items-center px-6 bg-slate-950/20 border-b border-white/5">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-sm">R</div>
                    <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-white to-primary/80 bg-clip-text text-transparent">ROHIS SMK TI</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${active
                                ? 'bg-primary text-white font-semibold shadow-lg shadow-primary/20'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 bg-slate-950/10 border-t border-white/5">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-semibold text-white text-sm">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <h4 className="text-sm font-semibold text-white truncate">{user?.email}</h4>
                        <p className="text-xs text-gray-400">Anggota</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white/5 hover:bg-red-600/10 hover:text-red-500 rounded-xl text-xs font-semibold text-gray-300 border border-white/5 hover:border-red-500/20 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Keluar Aplikasi</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {toast}

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-secondary text-white shadow-xl flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden" role="dialog">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex flex-col w-full max-w-xs bg-secondary text-white shadow-2xl animate-slide-in">
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex items-center ml-2 md:ml-0">
                            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-xs mr-2 md:hidden">R</div>
                            <h1 className="text-lg font-bold text-slate-800">
                                {navItems.find(item => isActive(item.href))?.name ?? 'ROHIS'}
                            </h1>
                        </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        SMK TI Bali Global Badung
                    </span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
