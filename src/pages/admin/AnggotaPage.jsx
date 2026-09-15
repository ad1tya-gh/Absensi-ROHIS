import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useToast } from '../../components/Toast';
import {
    getAnggotaList,
    createAnggota,
    updateAnggota,
    deleteAnggota,
    getJabatanList,
} from '../../lib/supabaseQueries';

const emptyForm = { nis: '', nama: '', kelas: '', jabatan: '', angkatan: new Date().getFullYear().toString() };

export default function AnggotaPage() {
    const [anggota, setAnggota] = useState([]);
    const [jabatanList, setJabatanList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Modal Tambah
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState(emptyForm);

    // Modal Edit
    const [showEdit, setShowEdit] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const { toast, showToast } = useToast();

    useEffect(() => { loadAnggota(); }, [search]);
    useEffect(() => { loadJabatan(); }, []);

    const loadAnggota = async () => {
        try {
            setLoading(true);
            const { data } = await getAnggotaList({ search, perPage: 100 });
            setAnggota(data || []);
        } catch (err) {
            showToast('Gagal memuat data anggota', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadJabatan = async () => {
        try {
            const data = await getJabatanList();
            setJabatanList(data || []);
        } catch (err) {
            console.error('Gagal memuat jabatan:', err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createAnggota(form);
            showToast('Anggota berhasil ditambahkan! Email & password otomatis dibuat.', 'success');
            setShowCreate(false);
            setForm(emptyForm);
            loadAnggota();
        } catch (err) {
            showToast(err.message || 'Gagal menambahkan anggota', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const openEdit = (item) => {
        setEditItem({ ...item });
        setShowEdit(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateAnggota(editItem.nis, {
                nama: editItem.nama,
                kelas: editItem.kelas,
                jabatan: editItem.jabatan,
            });
            showToast('Data anggota berhasil diperbarui!', 'success');
            setShowEdit(false);
            setEditItem(null);
            loadAnggota();
        } catch (err) {
            showToast(err.message || 'Gagal memperbarui data', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (nis, nama) => {
        if (!window.confirm(`Hapus anggota "${nama}"?\n\nAkun login-nya juga akan dihapus permanen.`)) return;
        try {
            await deleteAnggota(nis);
            showToast(`Anggota ${nama} berhasil dihapus`, 'success');
            loadAnggota();
        } catch (err) {
            showToast(err.message || 'Gagal menghapus anggota', 'error');
        }
    };

    const inputClass = 'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';
    const labelClass = 'block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider';

    return (
        <AdminLayout title="Data Anggota">
            {toast}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Daftar Anggota</h1>
                    <p className="text-sm text-slate-500 mt-1">{anggota.length} anggota terdaftar</p>
                </div>
                <div className="w-full sm:w-auto flex gap-2">
                    <input
                        type="text"
                        placeholder="Cari nama / NIS / kelas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-64"
                    />
                    <button
                        onClick={() => { setForm(emptyForm); setShowCreate(true); }}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all whitespace-nowrap flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah
                    </button>
                </div>
            </div>

            {/* Tabel */}
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
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="w-6 h-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                            </svg>
                                            Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : anggota.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        Tidak ada data anggota ditemukan
                                    </td>
                                </tr>
                            ) : (
                                anggota.map((item) => (
                                    <tr key={item.nis} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-600 bg-slate-50/50">{item.nis}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">{item.nama}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.kelas}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-semibold">{item.jabatan}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="text-primary font-semibold text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                                                >Edit</button>
                                                <button
                                                    onClick={() => handleDelete(item.nis, item.nama)}
                                                    className="text-red-500 font-semibold text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                >Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah Anggota */}
            {showCreate && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">Tambah Anggota</h2>
                        <p className="text-sm text-slate-500 mb-6">Email & password login otomatis dibuat dari nama + angkatan.</p>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>NIS</label>
                                    <input type="text" required value={form.nis}
                                        onChange={e => setForm({ ...form, nis: e.target.value })}
                                        placeholder="2401001" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Angkatan</label>
                                    <input type="text" required value={form.angkatan}
                                        onChange={e => setForm({ ...form, angkatan: e.target.value })}
                                        placeholder="2024" className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Nama Lengkap</label>
                                <input type="text" required value={form.nama}
                                    onChange={e => setForm({ ...form, nama: e.target.value })}
                                    placeholder="Ahmad Fauzi" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Kelas</label>
                                <input type="text" required value={form.kelas}
                                    onChange={e => setForm({ ...form, kelas: e.target.value })}
                                    placeholder="XI RPL 1" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Jabatan</label>
                                <select required value={form.jabatan}
                                    onChange={e => setForm({ ...form, jabatan: e.target.value })}
                                    className={inputClass}>
                                    <option value="">-- Pilih Jabatan --</option>
                                    {jabatanList.map(j => (
                                        <option key={j.id} value={j.nama_jabatan}>{j.nama_jabatan}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-3 text-xs text-slate-500 border border-slate-100">
                                📧 Email: <strong>{form.nama ? `${form.nama.trim().toLowerCase().split(/\s+/).slice(0, 2).join('')}.${form.angkatan}@rohis.id` : 'nama.angkatan@rohis.id'}</strong><br/>
                                🔑 Password default: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">RohisBisa2026</code>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreate(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold transition-all">Batal</button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-70">
                                    {submitting ? 'Menyimpan...' : 'Tambah Anggota'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Anggota */}
            {showEdit && editItem && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit Anggota</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className={labelClass}>NIS (tidak bisa diubah)</label>
                                <input type="text" disabled value={editItem.nis}
                                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-400 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className={labelClass}>Nama Lengkap</label>
                                <input type="text" required value={editItem.nama}
                                    onChange={e => setEditItem({ ...editItem, nama: e.target.value })}
                                    className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Kelas</label>
                                <input type="text" required value={editItem.kelas}
                                    onChange={e => setEditItem({ ...editItem, kelas: e.target.value })}
                                    className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Jabatan</label>
                                <select required value={editItem.jabatan}
                                    onChange={e => setEditItem({ ...editItem, jabatan: e.target.value })}
                                    className={inputClass}>
                                    <option value="">-- Pilih Jabatan --</option>
                                    {jabatanList.map(j => (
                                        <option key={j.id} value={j.nama_jabatan}>{j.nama_jabatan}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowEdit(false); setEditItem(null); }}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold transition-all">Batal</button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-70">
                                    {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
