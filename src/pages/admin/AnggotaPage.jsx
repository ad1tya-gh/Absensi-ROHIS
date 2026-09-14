import React, { useState, useEffect } from 'react';
import { getAnggotaList } from '../../lib/supabaseQueries';

export default function AnggotaPage() {
    const [anggota, setAnggota] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadAnggota();
    }, [search]);

    const loadAnggota = async () => {
        try {
            setLoading(true);
            const { data } = await getAnggotaList({ search, perPage: 50 });
            setAnggota(data || []);
        } catch (error) {
            console.error('Error loading anggota:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-extrabold text-slate-800">Daftar Anggota</h1>
                <div className="w-full sm:w-auto flex gap-2">
                    <input
                        type="text"
                        placeholder="Cari nama / NIS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-64"
                    />
                    <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all">
                        + Tambah
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-bold">NIS</th>
                                <th className="px-6 py-4 font-bold">Nama</th>
                                <th className="px-6 py-4 font-bold">Kelas</th>
                                <th className="px-6 py-4 font-bold">Jabatan</th>
                                <th className="px-6 py-4 font-bold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : anggota.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data anggota
                                    </td>
                                </tr>
                            ) : (
                                anggota.map((item) => (
                                    <tr key={item.nis} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{item.nis}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">{item.nama}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.kelas}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.jabatan}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-primary hover:text-primary/80 font-semibold mr-3">Edit</button>
                                            <button className="text-red-500 hover:text-red-600 font-semibold">Hapus</button>
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
