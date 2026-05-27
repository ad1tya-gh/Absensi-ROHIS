import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

export default function AdminLayout({ children, title }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        {
            name: 'Dashboard',
            route: 'admin.dashboard',
            href: route('admin.dashboard'),
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: 'Data Anggota',
            route: 'admin.anggota.index',
            href: route('admin.anggota.index'),
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
        },
        {
            name: 'Daftar Kegiatan',
            route: 'admin.kegiatan.index',
            href: route('admin.kegiatan.index'),
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
    ];

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const isRouteActive = (routePattern) => {
        // Simple check if current URL starts with corresponding path
        return route().current(routePattern);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-secondary text-white shadow-xl flex-shrink-0">
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 bg-slate-950/20 border-b border-white/5">
                    <div className="flex items-center space-x-2">
                        <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-md shadow-primary/20">R</span>
                        <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-white to-primary/80 bg-clip-text text-transparent">ROHIS 7 Admin</span>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = isRouteActive(item.route);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                    active
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

                {/* User Info / Logout */}
                <div className="p-4 bg-slate-950/10 border-t border-white/5">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-semibold text-white">
                            {auth.user.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="text-sm font-semibold truncate">{auth.user.name}</h4>
                            <p className="text-xs text-gray-400 truncate">Administrator</p>
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
            </aside>

            {/* Mobile Sidebar Slideover */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
                    <div className="relative flex flex-col w-full max-w-xs bg-secondary text-white shadow-2xl animate-slide-in">
                        <div className="h-16 flex items-center justify-between px-6 bg-slate-950/20 border-b border-white/5">
                            <div className="flex items-center space-x-2">
                                <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white">R</span>
                                <span className="font-bold text-lg">ROHIS 7 Admin</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                            {navItems.map((item) => {
                                const active = isRouteActive(item.route);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                            active ? 'bg-primary text-white font-semibold shadow-lg' : 'text-gray-300 hover:bg-white/5'
                                        }`}
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="p-4 border-t border-white/5 bg-slate-950/10">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-semibold text-white">
                                    {auth.user.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold truncate">{auth.user.name}</h4>
                                    <p className="text-xs text-gray-400">Administrator</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white/5 hover:bg-red-600/10 hover:text-red-500 rounded-xl text-xs font-semibold text-gray-300 border border-white/5 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Keluar Aplikasi</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top header bar */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-bold text-slate-800 ml-2 md:ml-0">{title}</h1>
                    </div>
                    
                    {/* Organization Banner */}
                    <div className="flex items-center space-x-3">
                        <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                            ROHIS SMA Negeri 7
                        </span>
                    </div>
                </header>

                {/* Content body */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
