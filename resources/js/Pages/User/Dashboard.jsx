import React from 'react';
import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';

export default function Dashboard({ anggota, riwayat }) {
    const formatDate = (dateStr) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    };

    const formatTime = (timeStr) => {
        return new Date(timeStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    };

    return (
        <UserLayout>
            <Head title="Dashboard Anggota" />

            <div className="space-y-6">
                {/* Welcome Card banner */}
                <div className="bg-gradient-to-r from-secondary to-primary text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
                    <div className="absolute right-12 top-6 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
                    
                    <div className="relative z-10 space-y-2">
                        <span className="text-xs uppercase font-bold tracking-widest text-primary-content/75 bg-white/10 px-3 py-1 rounded-full border border-white/5">
                            Anggota ROHIS 7
                        </span>
                        <h1 className="text-2xl md:text-3xl font-extrabold">Selamat Datang, {anggota?.nama}!</h1>
                        <p className="text-sm text-gray-200">Semoga harimu penuh berkah. Jangan lupa untuk mengisi absensi setiap kali mengikuti kegiatan.</p>
                    </div>
                </div>

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Member Profile Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 flex flex-col justify-between">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 text-lg border-b border-slate-50 pb-2">Profil Anggota</h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">Nama Lengkap</span>
                                    <span className="text-sm font-bold text-slate-700">{anggota?.nama}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">NISN</span>
                                    <span className="text-sm font-mono text-slate-600">{anggota?.nisn}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">Kelas</span>
                                        <span className="text-sm font-semibold text-slate-600">{anggota?.kelas}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">Jabatan</span>
                                        <span className="text-sm font-semibold text-slate-600">{anggota?.jabatan}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Saved Signature */}
                        <div className="border-t border-slate-50 pt-4 space-y-2">
                            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">Tanda Tangan Profil</span>
                            {anggota?.tanda_tangan ? (
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center h-20 shadow-inner">
                                    <img src={anggota.tanda_tangan} alt="Tanda Tangan Profil" className="max-h-full max-w-[150px] object-contain" />
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400">
                                    <p className="text-xs italic">Belum tersimpan</p>
                                    <p className="text-[10px] mt-0.5">Ttd akan otomatis tersimpan saat pertama kali absen.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attendance Action & History Column */}
                    <div className="md:col-span-2 space-y-6">
                        {/* ABSEN NOW CTA */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Kehadiran Kegiatan</h3>
                                <p className="text-xs text-slate-400">Sudah berada di tempat pertemuan?</p>
                            </div>
                            
                            <Link
                                href={route('absen.index')}
                                className="py-4 px-6 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/95 hover:to-emerald-500/95 text-white font-bold text-center rounded-2xl shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
                            >
                                Absen Sekarang
                            </Link>
                        </div>

                        {/* History Log */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 text-lg mb-6">Riwayat Kehadiran</h3>

                            <div className="relative border-l border-slate-100 ml-4 pl-6 space-y-6">
                                {riwayat.length > 0 ? (
                                    riwayat.map((item) => (
                                        <div key={item.id} className="relative">
                                            {/* Line marker */}
                                            <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-[10px] text-emerald-600 font-bold shadow-sm">
                                                ✓
                                            </span>
                                            
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-slate-800 text-sm">
                                                    {item.kegiatan?.nama_kegiatan}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                                                    <span>{formatDate(item.kegiatan?.tanggal)}</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                                    <span>Absen masuk: {formatTime(item.waktu_absen)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-slate-400 py-8 text-xs italic -ml-6">
                                        Anda belum memiliki riwayat kehadiran.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
