import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Dashboard({ totalAnggota, totalKegiatan, kegiatanAktif, recentAbsensi }) {
    return (
        <AdminLayout title="Dashboard Overview">
            <Head title="Admin Dashboard" />

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Anggota */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Anggota</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{totalAnggota}</h3>
                        <p className="text-xs text-primary font-medium mt-1">Terdaftar aktif</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>

                {/* Total Kegiatan */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kegiatan</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{totalKegiatan}</h3>
                        <p className="text-xs text-slate-400 mt-1">Keseluruhan agenda</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                {/* Kegiatan Aktif */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kegiatan Aktif</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{kegiatanAktif}</h3>
                        <p className="text-xs text-emerald-500 font-medium mt-1">Token absen menyala</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Main Dashboard Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Recent Activities Log */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Kehadiran Terbaru</h3>
                            <p className="text-xs text-slate-400">Daftar kehadiran anggota teraktual</p>
                        </div>
                        <Link 
                            href={route('admin.kegiatan.index')}
                            className="text-xs font-semibold text-primary hover:underline"
                        >
                            Lihat Kegiatan
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="py-3 px-4 font-semibold">NIS</th>
                                    <th className="py-3 px-4 font-semibold">Nama Anggota</th>
                                    <th className="py-3 px-4 font-semibold">Kelas</th>
                                    <th className="py-3 px-4 font-semibold">Kegiatan</th>
                                    <th className="py-3 px-4 font-semibold text-right">Waktu Absen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentAbsensi.length > 0 ? (
                                    recentAbsensi.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-4 text-xs font-mono text-slate-500">{item.anggota?.nis}</td>
                                            <td className="py-3 px-4 font-semibold text-slate-700">{item.anggota?.nama}</td>
                                            <td className="py-3 px-4 text-slate-600">{item.anggota?.kelas}</td>
                                            <td className="py-3 px-4 text-slate-600">{item.kegiatan?.nama_kegiatan}</td>
                                            <td className="py-3 px-4 text-right text-xs font-medium text-slate-400">
                                                {new Date(item.waktu_absen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                                            Belum ada log absensi hari ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick actions panel */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg mb-2">Aksi Cepat</h3>
                        <p className="text-xs text-slate-400 mb-6">Navigasi langsung untuk mengelola sistem</p>

                        <div className="space-y-3">
                            <Link
                                href={route('admin.anggota.index')}
                                className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-primary/5 text-slate-700 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-bold group-hover:text-primary transition-colors">Tambah Anggota</h4>
                                    <p className="text-xs text-slate-400">Daftarkan anggota & buat akun</p>
                                </div>
                            </Link>

                            <Link
                                href={route('admin.kegiatan.index')}
                                className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-100 hover:border-secondary/20 hover:bg-secondary/5 text-slate-700 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-9-4h18c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-bold group-hover:text-secondary transition-colors">Buat Kegiatan</h4>
                                    <p className="text-xs text-slate-400">Buka absensi pertemuan baru</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-50 text-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">Sistem Absensi v1.0</span>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
