import React, { useState, useEffect } from 'react';
import { getJabatanList, createJabatan, deleteJabatan } from '../../lib/supabaseQueries';

export default function JabatanPage() {
    const [jabatan, setJabatan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newJabatan, setNewJabatan] = useState('');

    useEffect(() => {
        loadJabatan();
    }, []);

    const loadJabatan = async () => {
        try {
            setLoading(true);
            const data = await getJabatanList();
            setJabatan(data || []);
        } catch (error) {
            console.error('Error loading jabatan:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newJabatan.trim()) return;
        
        try {
            await createJabatan(newJabatan);
            setNewJabatan('');
            loadJabatan();
        } catch (error) {
            console.error('Error creating jabatan:', error);
            alert('Gagal membuat jabatan');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus jabatan ini?')) return;
        try {
            await deleteJabatan(id);
            loadJabatan();
        } catch (error) {
            console.error('Error deleting jabatan:', error);
            alert('Gagal menghapus jabatan');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-800">Manajemen Jabatan</h1>

            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                <form onSubmit={handleCreate} className="flex gap-4">
                    <input 
                        type="text" 
                        value={newJabatan}
                        onChange={(e) => setNewJabatan(e.target.value)}
                        placeholder="Nama Jabatan Baru..."
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <button 
                        type="submit"
                        disabled={!newJabatan.trim()}
                        className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-slate-300 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all whitespace-nowrap"
                    >
                        Tambah Jabatan
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-bold">Nama Jabatan</th>
                            <th className="px-6 py-4 font-bold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="2" className="px-6 py-8 text-center text-slate-500">Memuat data...</td>
                            </tr>
                        ) : jabatan.length === 0 ? (
                            <tr>
                                <td colSpan="2" className="px-6 py-8 text-center text-slate-500">Belum ada data jabatan</td>
                            </tr>
                        ) : (
                            jabatan.map((item) => (
                                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-semibold text-slate-800">{item.nama_jabatan}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-500 hover:text-red-600 font-semibold text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
