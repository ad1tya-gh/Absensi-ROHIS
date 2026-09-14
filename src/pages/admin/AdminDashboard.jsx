import React, { useState, useEffect } from 'react';
import { getAdminDashboardStats } from '../../lib/supabaseQueries';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalAnggota: 0,
        totalKegiatan: 0,
        kegiatanAktif: 0,
        recentAbsensi: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await getAdminDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded"></div>
                            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-8">Dashboard Admin</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span className="text-slate-500 font-semibold mb-2">Total Anggota</span>
                    <span className="text-4xl font-black text-primary">{stats.totalAnggota}</span>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span className="text-slate-500 font-semibold mb-2">Total Kegiatan</span>
                    <span className="text-4xl font-black text-secondary">{stats.totalKegiatan}</span>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span className="text-slate-500 font-semibold mb-2">Kegiatan Aktif</span>
                    <span className="text-4xl font-black text-emerald-500">{stats.kegiatanAktif}</span>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Absensi Terbaru</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 font-bold">Waktu</th>
                                <th className="px-6 py-4 font-bold">Anggota</th>
                                <th className="px-6 py-4 font-bold">Kegiatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentAbsensi.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                                        Belum ada data absensi
                                    </td>
                                </tr>
                            ) : (
                                stats.recentAbsensi.map((absen) => (
                                    <tr key={absen.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {new Date(absen.waktu_absen).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{absen.anggota?.nama}</div>
                                            <div className="text-xs text-slate-500">{absen.anggota?.nis} - {absen.anggota?.kelas}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {absen.kegiatan?.nama_kegiatan}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
