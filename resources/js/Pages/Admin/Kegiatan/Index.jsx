import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import ConfirmDialog from '@/Components/ConfirmDialog';

export default function Index({ kegiatan, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedKegiatan, setSelectedKegiatan] = useState(null);
    const [confirmState, setConfirmState] = useState({ show: false, item: null });

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_kegiatan: '',
        tanggal: '',
        waktu_mulai: '',
        kode_absen: '',
        is_active: true
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('admin.kegiatan.index'), { search }, { preserveState: true });
    };

    const handleClearSearch = () => {
        setSearch('');
        router.get(route('admin.kegiatan.index'), {}, { preserveState: true });
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
        setSelectedKegiatan(item);
        // Format time properly (e.g. 08:00:00 to 08:00)
        const formattedTime = item.waktu_mulai.substring(0, 5);
        setData({
            nama_kegiatan: item.nama_kegiatan,
            tanggal: item.tanggal.substring(0, 10),
            waktu_mulai: formattedTime,
            kode_absen: item.kode_absen,
            is_active: item.is_active
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedKegiatan(null);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('admin.kegiatan.store'), {
            onSuccess: () => {
                closeCreateModal();
                reset();
            }
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(route('admin.kegiatan.update', selectedKegiatan.id), {
            onSuccess: () => {
                closeEditModal();
                reset();
            }
        });
    };

    const handleDelete = (item) => {
        setConfirmState({ show: true, item });
    };

    const confirmDelete = () => {
        destroy(route('admin.kegiatan.destroy', confirmState.item.id), {
            onFinish: () => setConfirmState({ show: false, item: null })
        });
    };

    const handleToggleStatus = (item) => {
        router.post(route('admin.kegiatan.toggle', item.id), {}, { preserveScroll: true });
    };

    const formatDate = (dateStr) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    };

    return (
        <AdminLayout title="Kelola Kegiatan & Pertemuan">
            <Head title="Daftar Kegiatan" />

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
                            placeholder="Cari nama kegiatan atau kode..."
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

                {/* Add Event Button */}
                <button
                    onClick={openCreateModal}
                    className="py-2.5 px-4 bg-primary hover:bg-opacity-90 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Tambah Kegiatan</span>
                </button>
            </div>

            {/* Data Table Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="py-4 px-6 text-center w-12">No</th>
                                <th className="py-4 px-6">Nama Kegiatan</th>
                                <th className="py-4 px-6">Tanggal Pelaksanaan</th>
                                <th className="py-4 px-6">Jam Mulai</th>
                                <th className="py-4 px-6 text-center">Kode Absen</th>
                                <th className="py-4 px-6 text-center">Status</th>
                                <th className="py-4 px-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {kegiatan.data.length > 0 ? (
                                kegiatan.data.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6 text-center text-slate-400 font-medium">
                                            {kegiatan.from + index}
                                        </td>
                                        <td className="py-4 px-6 font-bold text-slate-800">
                                            {item.nama_kegiatan}
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 font-medium">
                                            {formatDate(item.tanggal)}
                                        </td>
                                        <td className="py-4 px-6 text-slate-600">
                                            {item.waktu_mulai.substring(0, 5)} WIB
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200/50 text-xs font-bold tracking-wider">
                                                {item.kode_absen}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(item)}
                                                title="Klik untuk mengubah status"
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm border transition-all ${
                                                    item.is_active
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100'
                                                        : 'bg-red-50 text-red-600 border-red-200/50 hover:bg-red-100'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                {item.is_active ? 'Aktif' : 'Selesai'}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                            <Link
                                                href={route('admin.kegiatan.show', item.id)}
                                                className="py-1.5 px-3 bg-secondary hover:bg-opacity-90 rounded-lg text-xs font-bold text-white transition-all inline-block"
                                            >
                                                Detail
                                            </Link>
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
                                        Data kegiatan tidak ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {kegiatan.links && kegiatan.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                        <div className="flex items-center text-xs text-slate-500">
                            Menampilkan {kegiatan.from} - {kegiatan.to} dari {kegiatan.total} kegiatan
                        </div>
                        <div className="flex space-x-1">
                            {kegiatan.links.map((link, i) => {
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

            {/* Create Kegiatan Modal */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="md">
                <form onSubmit={handleCreateSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Buat Kegiatan Pertemuan Baru</h3>
                        <button type="button" onClick={closeCreateModal} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div>
                            <InputLabel htmlFor="create-nama" value="Nama Kegiatan" className="font-semibold" />
                            <input
                                id="create-nama"
                                type="text"
                                placeholder="Contoh: Pertemuan Mingguan #5"
                                value={data.nama_kegiatan}
                                onChange={(e) => setData('nama_kegiatan', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                required
                            />
                            <InputError message={errors.nama_kegiatan} className="mt-1 text-xs" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="create-tanggal" value="Tanggal Pelaksanaan" className="font-semibold" />
                                <input
                                    id="create-tanggal"
                                    type="date"
                                    value={data.tanggal}
                                    onChange={(e) => setData('tanggal', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                />
                                <InputError message={errors.tanggal} className="mt-1 text-xs" />
                            </div>
                            <div>
                                <InputLabel htmlFor="create-waktu" value="Jam Mulai" className="font-semibold" />
                                <input
                                    id="create-waktu"
                                    type="time"
                                    value={data.waktu_mulai}
                                    onChange={(e) => setData('waktu_mulai', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                />
                                <InputError message={errors.waktu_mulai} className="mt-1 text-xs" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="create-kode" value="Kode Absen (Opsional)" className="font-semibold" />
                            <input
                                id="create-kode"
                                type="text"
                                placeholder="Kosongkan untuk generate kode otomatis 6 karakter unik"
                                value={data.kode_absen}
                                onChange={(e) => setData('kode_absen', e.target.value.toUpperCase())}
                                className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm font-mono tracking-wider"
                                maxLength={10}
                            />
                            <p className="mt-1.5 text-xs text-gray-400">Jika diisi manual, kode harus unik alfanumerik maksimal 10 karakter.</p>
                            <InputError message={errors.kode_absen} className="mt-1 text-xs" />
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
                            Buat Kegiatan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Kegiatan Modal */}
            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="md">
                <form onSubmit={handleEditSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Ubah Data Kegiatan</h3>
                        <button type="button" onClick={closeEditModal} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div>
                            <InputLabel htmlFor="edit-nama" value="Nama Kegiatan" className="font-semibold" />
                            <input
                                id="edit-nama"
                                type="text"
                                value={data.nama_kegiatan}
                                onChange={(e) => setData('nama_kegiatan', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                required
                            />
                            <InputError message={errors.nama_kegiatan} className="mt-1 text-xs" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="edit-tanggal" value="Tanggal Pelaksanaan" className="font-semibold" />
                                <input
                                    id="edit-tanggal"
                                    type="date"
                                    value={data.tanggal}
                                    onChange={(e) => setData('tanggal', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                />
                                <InputError message={errors.tanggal} className="mt-1 text-xs" />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit-waktu" value="Jam Mulai" className="font-semibold" />
                                <input
                                    id="edit-waktu"
                                    type="time"
                                    value={data.waktu_mulai}
                                    onChange={(e) => setData('waktu_mulai', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                />
                                <InputError message={errors.waktu_mulai} className="mt-1 text-xs" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="edit-kode" value="Kode Absen" className="font-semibold" />
                                <input
                                    id="edit-kode"
                                    type="text"
                                    value={data.kode_absen}
                                    onChange={(e) => setData('kode_absen', e.target.value.toUpperCase())}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm font-mono tracking-wider"
                                    required
                                    maxLength={10}
                                />
                                <InputError message={errors.kode_absen} className="mt-1 text-xs" />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit-status" value="Status Kegiatan" className="font-semibold" />
                                <select
                                    id="edit-status"
                                    value={data.is_active ? '1' : '0'}
                                    onChange={(e) => setData('is_active', e.target.value === '1')}
                                    className="mt-1 block w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                >
                                    <option value="1">Aktif (Absensi Dibuka)</option>
                                    <option value="0">Selesai (Absensi Ditutup)</option>
                                </select>
                                <InputError message={errors.is_active} className="mt-1 text-xs" />
                            </div>
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

            <ConfirmDialog
                show={confirmState.show}
                title="Hapus Kegiatan"
                message={`Apakah Anda yakin ingin menghapus kegiatan ${confirmState.item?.nama_kegiatan}? Seluruh catatan kehadiran untuk kegiatan ini juga akan dihapus.`}
                onConfirm={confirmDelete}
                onCancel={() => setConfirmState({ show: false, item: null })}
            />
        </AdminLayout>
    );
}
