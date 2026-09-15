import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { useToast } from '../../components/Toast';
import { getKegiatanList, createKegiatan, deleteKegiatan, toggleKegiatanStatus } from '../../lib/supabaseQueries';

export default function KegiatanPage() {
    const [kegiatans, setKegiatans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [newKegiatan, setNewKegiatan] = useState({ nama_kegiatan: '', tanggal: '', waktu_mulai: '' });
    const { toast, showToast } = useToast();

    useEffect(() => {
        loadKegiatan();
    }, [search]);

    const loadKegiatan = async () => {
        try {
            setLoading(true);
            const { data } = await getKegiatanList({ search, perPage: 50 });
            setKegiatans(data || []);
        } catch (error) {
            console.error('Error loading kegiatan:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createKegiatan(newKegiatan);
            showToast('Kegiatan berhasil dibuat!', 'success');
            setShowModal(false);
            setNewKegiatan({ nama_kegiatan: '', tanggal: '', waktu_mulai: '' });
            loadKegiatan();
        } catch (error) {
            showToast(error.message || 'Gagal membuat kegiatan', 'error');
        }
    };

    const handleDelete = async (id, nama) => {
        if (!window.confirm(`Hapus kegiatan "${nama}"?\n\nSemua data absensi kegiatan ini juga akan terhapus.`)) return;
        try {
            await deleteKegiatan(id);
            showToast('Kegiatan berhasil dihapus', 'success');
            loadKegiatan();
        } catch (error) {
            showToast(error.message || 'Gagal menghapus kegiatan', 'error');
        }
    };

    const handleToggle = async (id, currentStatus) => {
        try {
            await toggleKegiatanStatus(id, currentStatus);
            showToast(currentStatus ? 'Absensi ditutup' : 'Absensi dibuka', 'success');
            loadKegiatan();
        } catch (error) {
            showToast(error.message || 'Gagal mengubah status', 'error');
        }
    };

    return (
        <AdminLayout title="Daftar Kegiatan">
            {toast}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-extrabold text-slate-800">Daftar Kegiatan</h1>
                <div className="w-full sm:w-auto flex gap-2">
                    <input
                        type="text"
                        placeholder="Cari kegiatan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-64"
                    />
                    <button 
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all whitespace-nowrap"
                    >
                        + Buat Kegiatan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center text-slate-500 py-10">Memuat data...</div>
                ) : kegiatans.length === 0 ? (
                    <div className="col-span-full text-center text-slate-500 py-10">Tidak ada kegiatan ditemukan</div>
                ) : (
                    kegiatans.map((kegiatan) => (
                        <div key={kegiatan.id} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col hover:border-primary/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-slate-800 line-clamp-2">{kegiatan.nama_kegiatan}</h3>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${kegiatan.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {kegiatan.is_active ? 'Aktif' : 'Selesai'}
                                </span>
                            </div>
                            <div className="mt-auto space-y-2 mb-6">
                                <div className="text-sm text-slate-600 flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center">📅</span>
                                    {kegiatan.tanggal}
                                </div>
                                <div className="text-sm text-slate-600 flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center">⏰</span>
                                    {kegiatan.waktu_mulai}
                                </div>
                                <div className="text-sm font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 mt-2 text-slate-700 inline-block">
                                    Kode: <span className="font-bold text-primary">{kegiatan.kode_absen}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link 
                                    to={`/admin/kegiatan/${kegiatan.id}`}
                                    className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-bold text-center transition-all"
                                >
                                    Detail & Absensi
                                </Link>
                                <button
                                    onClick={() => handleToggle(kegiatan.id, kegiatan.is_active)}
                                    className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${kegiatan.is_active ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                                    title={kegiatan.is_active ? 'Tutup Absensi' : 'Buka Absensi'}
                                >
                                    {kegiatan.is_active ? '🔒' : '🔓'}
                                </button>
                                <button
                                    onClick={() => handleDelete(kegiatan.id, kegiatan.nama_kegiatan)}
                                    className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-bold transition-all"
                                    title="Hapus Kegiatan"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Tambah Kegiatan */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Buat Kegiatan Baru</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Nama Kegiatan</label>
                                <input 
                                    type="text" required
                                    value={newKegiatan.nama_kegiatan}
                                    onChange={e => setNewKegiatan({...newKegiatan, nama_kegiatan: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Tanggal</label>
                                <input 
                                    type="date" required
                                    value={newKegiatan.tanggal}
                                    onChange={e => setNewKegiatan({...newKegiatan, tanggal: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Waktu Mulai</label>
                                <input 
                                    type="time" required
                                    value={newKegiatan.waktu_mulai}
                                    onChange={e => setNewKegiatan({...newKegiatan, waktu_mulai: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold transition-all">Batal</button>
                                <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
