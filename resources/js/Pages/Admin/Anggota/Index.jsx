import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import SignatureCanvas from '@/Components/SignatureCanvas';

export default function Index({ anggota, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAnggota, setSelectedAnggota] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nisn: '',
        nama: '',
        kelas: '',
        jabatan: '',
        angkatan: new Date().getFullYear(),
        tanda_tangan: null
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('admin.anggota.index'), { search }, { preserveState: true });
    };

    const handleClearSearch = () => {
        setSearch('');
        router.get(route('admin.anggota.index'), {}, { preserveState: true });
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const openEditModal = (item) => {
        clearErrors();
        setSelectedAnggota(item);
        setData({
            nisn: item.nisn,
            nama: item.nama,
            kelas: item.kelas,
            jabatan: item.jabatan,
            tanda_tangan: item.tanda_tangan
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedAnggota(null);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('admin.anggota.store'), {
            onSuccess: () => {
                closeCreateModal();
                reset();
            }
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(route('admin.anggota.update', selectedAnggota.nisn), {
            onSuccess: () => {
                closeEditModal();
                reset();
            }
        });
    };

    const handleDelete = (item) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data anggota ${item.nama}? Tindakan ini juga akan menghapus akun login yang terhubung.`)) {
            destroy(route('admin.anggota.destroy', item.nisn));
        }
    };

    return (
        <AdminLayout title="Kelola Data Anggota">
            <Head title="Data Anggota" />

            {/* Actions & Filters Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:max-w-md">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Cari NISN, nama, kelas, atau jabatan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 pr-8 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm py-2.5"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="py-2.5 px-4 bg-secondary hover:bg-opacity-90 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
                    >
                        Cari
                    </button>
                </form>

                {/* Add Member Button */}
                <button
                    onClick={openCreateModal}
                    className="py-2.5 px-5 bg-primary hover:bg-opacity-90 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary/10 flex items-center justify-center space-x-2"
                >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Tambah Anggota Baru</span>
                </button>
            </div>

            {/* Data Table Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="py-4 px-6 text-center w-12">No</th>
                                <th className="py-4 px-6">NISN</th>
                                <th className="py-4 px-6">Nama Lengkap</th>
                                <th className="py-4 px-6">Kelas</th>
                                <th className="py-4 px-6">Jabatan</th>
                                <th className="py-4 px-6 text-center">Tanda Tangan</th>
                                <th className="py-4 px-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {anggota.data.length > 0 ? (
                                anggota.data.map((item, index) => (
                                    <tr key={item.nisn} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6 text-center text-slate-400 font-medium">
                                            {anggota.from + index}
                                        </td>
                                        <td className="py-4 px-6 font-mono text-xs text-slate-500">
                                            {item.nisn}
                                        </td>
                                        <td className="py-4 px-6 font-bold text-slate-800">
                                            {item.nama}
                                            {item.user && (
                                                <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                                                    {item.user.email}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 font-medium">
                                            {item.kelas}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                item.jabatan.toLowerCase() === 'ketua'
                                                    ? 'bg-amber-50 text-amber-600 border border-amber-200/50'
                                                    : item.jabatan.toLowerCase() === 'sekretaris' || item.jabatan.toLowerCase() === 'bendahara'
                                                    ? 'bg-blue-50 text-blue-600 border border-blue-200/50'
                                                    : 'bg-slate-50 text-slate-500 border border-slate-200/50'
                                            }`}>
                                                {item.jabatan}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {item.tanda_tangan ? (
                                                <div className="inline-block p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                    <img 
                                                        src={item.tanda_tangan} 
                                                        alt="Ttd" 
                                                        className="h-8 max-w-[80px] object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Belum Ada</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="py-1.5 px-3 bg-slate-100 hover:bg-primary hover:text-white rounded-lg text-xs font-bold text-slate-600 transition-all focus:outline-none"
                                            >
                                                Ubah
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="py-1.5 px-3 bg-slate-100 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold text-slate-600 transition-all focus:outline-none"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-10 text-center text-slate-400 text-sm">
                                        Data anggota tidak ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {anggota.links && anggota.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                        <div className="flex items-center text-xs text-slate-500">
                            Menampilkan {anggota.from} - {anggota.to} dari {anggota.total} anggota
                        </div>
                        <div className="flex space-x-1">
                            {anggota.links.map((link, i) => {
                                const active = link.active;
                                return link.url ? (
                                    <button
                                        key={i}
                                        onClick={() => router.get(link.url, { search }, { preserveState: true })}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                            active
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed select-none"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Anggota Modal */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="lg">
                <form onSubmit={handleCreateSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Tambah Anggota Baru</h3>
                        <button type="button" onClick={closeCreateModal} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="create-nisn" value="NISN Anggota" className="font-semibold" />
                                <input
                                    id="create-nisn"
                                    type="text"
                                    value={data.nisn}
                                    onChange={(e) => setData('nisn', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                    maxLength={20}
                                />
                                <InputError message={errors.nisn} className="mt-1 text-xs" />
                            </div>
                            <div>
                                <InputLabel htmlFor="create-nama" value="Nama Lengkap" className="font-semibold" />
                                <input
                                    id="create-nama"
                                    type="text"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                />
                                <InputError message={errors.nama} className="mt-1 text-xs" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <InputLabel htmlFor="create-kelas" value="Kelas" className="font-semibold" />
                                <input
                                    id="create-kelas"
                                    type="text"
                                    placeholder="Contoh: X-IPA-1"
                                    value={data.kelas}
                                    onChange={(e) => setData('kelas', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                />
                                <InputError message={errors.kelas} className="mt-1 text-xs" />
                            </div>
                            <div>
                                <InputLabel htmlFor="create-jabatan" value="Jabatan" className="font-semibold" />
                                <select
                                    id="create-jabatan"
                                    value={data.jabatan}
                                    onChange={(e) => setData('jabatan', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                >
                                    <option value="">Pilih Jabatan</option>
                                    <option value="Ketua">Ketua</option>
                                    <option value="Wakil Ketua">Wakil Ketua</option>
                                    <option value="Sekretaris">Sekretaris</option>
                                    <option value="Bendahara">Bendahara</option>
                                    <option value="Anggota">Anggota</option>
                                </select>
                                <InputError message={errors.jabatan} className="mt-1 text-xs" />
                            </div>
                            <div>
                                <InputLabel htmlFor="create-angkatan" value="Tahun Angkatan" className="font-semibold" />
                                <input
                                    id="create-angkatan"
                                    type="number"
                                    value={data.angkatan}
                                    onChange={(e) => setData('angkatan', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                />
                                <InputError message={errors.angkatan} className="mt-1 text-xs" />
                            </div>
                        </div>

                        <div>
                            <SignatureCanvas 
                                label="Tanda Tangan Profil Default (Opsional)" 
                                onChange={(val) => setData('tanda_tangan', val)} 
                            />
                            <InputError message={errors.tanda_tangan} className="mt-1 text-xs" />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="py-2.5 px-5 bg-primary hover:bg-opacity-90 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary/10 disabled:opacity-50"
                        >
                            Simpan Data
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Anggota Modal */}
            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="lg">
                <form onSubmit={handleEditSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Ubah Data Anggota</h3>
                        <button type="button" onClick={closeEditModal} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="edit-nisn" value="NISN Anggota" className="font-semibold" />
                                <input
                                    id="edit-nisn"
                                    type="text"
                                    value={data.nisn}
                                    onChange={(e) => setData('nisn', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary shadow-sm text-sm cursor-not-allowed"
                                    required
                                    disabled
                                />
                                <InputError message={errors.nisn} className="mt-1 text-xs" />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit-nama" value="Nama Lengkap" className="font-semibold" />
                                <input
                                    id="edit-nama"
                                    type="text"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                />
                                <InputError message={errors.nama} className="mt-1 text-xs" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="edit-kelas" value="Kelas" className="font-semibold" />
                                <input
                                    id="edit-kelas"
                                    type="text"
                                    value={data.kelas}
                                    onChange={(e) => setData('kelas', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                />
                                <InputError message={errors.kelas} className="mt-1 text-xs" />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit-jabatan" value="Jabatan" className="font-semibold" />
                                <select
                                    id="edit-jabatan"
                                    value={data.jabatan}
                                    onChange={(e) => setData('jabatan', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                >
                                    <option value="">Pilih Jabatan</option>
                                    <option value="Ketua">Ketua</option>
                                    <option value="Wakil Ketua">Wakil Ketua</option>
                                    <option value="Sekretaris">Sekretaris</option>
                                    <option value="Bendahara">Bendahara</option>
                                    <option value="Anggota">Anggota</option>
                                </select>
                                <InputError message={errors.jabatan} className="mt-1 text-xs" />
                            </div>
                        </div>

                        <div>
                            {data.tanda_tangan && (
                                <div className="mb-4">
                                    <span className="block text-xs font-semibold text-gray-500 mb-1.5">Tanda Tangan Saat Ini:</span>
                                    <div className="inline-block p-2 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                                        <img src={data.tanda_tangan} alt="Ttd Saat Ini" className="h-16 max-w-[120px] object-contain" />
                                    </div>
                                </div>
                            )}
                            <SignatureCanvas 
                                label="Gambar Ulang Tanda Tangan (Mengganti yang Lama)" 
                                onChange={(val) => setData('tanda_tangan', val)} 
                            />
                            <InputError message={errors.tanda_tangan} className="mt-1 text-xs" />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={closeEditModal}
                            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="py-2.5 px-5 bg-primary hover:bg-opacity-90 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary/10 disabled:opacity-50"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
