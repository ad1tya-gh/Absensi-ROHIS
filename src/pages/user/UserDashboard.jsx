import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../layouts/UserLayout';
import { getRiwayatAbsen, getAnggotaByUserId } from '../../lib/supabaseQueries';

export default function UserDashboard() {
    const { user } = useAuth();
    const [riwayat, setRiwayat] = useState([]);
    const [anggota, setAnggota] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const dataAnggota = await getAnggotaByUserId(user.id);
            setAnggota(dataAnggota);
            
            if (dataAnggota) {
                const dataRiwayat = await getRiwayatAbsen(dataAnggota.nis);
                setRiwayat(dataRiwayat || []);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-slate-500">Memuat data...</div>;
    }

    if (!anggota) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center border border-red-100">
                    Data anggota tidak ditemukan. Silakan hubungi admin.
                </div>
            </div>
        );
    }

    return (
        <UserLayout>
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                <div className="w-20 h-20 bg-gradient-to-tr from-primary to-emerald-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/30">
                    {anggota.nama.charAt(0)}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{anggota.nama}</h2>
                    <div className="text-slate-500 mt-1 space-x-2">
                        <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold">{anggota.nis}</span>
                        <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold">{anggota.kelas}</span>
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-xs font-bold">{anggota.jabatan}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">Riwayat Kehadiran</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-bold">Tanggal</th>
                                <th className="px-6 py-4 font-bold">Kegiatan</th>
                                <th className="px-6 py-4 font-bold">Waktu Absen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riwayat.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                                        Belum ada riwayat absensi.
                                    </td>
                                </tr>
                            ) : (
                                riwayat.map((absen) => (
                                    <tr key={absen.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {absen.kegiatan?.tanggal}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            {absen.kegiatan?.nama_kegiatan}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(absen.waktu_absen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </UserLayout>
    );
}
