import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmDialog from '@/Components/ConfirmDialog';

export default function Index({ jabatanList }) {
    const { errors: pageErrors } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_jabatan: ''
    });
    const [confirmState, setConfirmState] = useState({ show: false, id: null, nama: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.jabatan.store'), {
            onSuccess: () => reset()
        });
    };

    const handleDelete = (id, nama) => {
        setConfirmState({ show: true, id, nama });
    };

    const confirmDelete = () => {
        router.delete(route('admin.jabatan.destroy', confirmState.id), {
            onFinish: () => setConfirmState({ show: false, id: null, nama: '' })
        });
    };

    return (
        <AdminLayout title="Manajemen Jabatan">
            <Head title="Manajemen Jabatan" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Tambah Jabatan */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg border-b border-slate-50 pb-2 mb-4">
                            Tambah Jabatan Baru
                        </h3>

                        {pageErrors && pageErrors.error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold">
                                {pageErrors.error}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                                    Nama Jabatan
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Ketua Umum"
                                    value={data.nama_jabatan}
                                    onChange={(e) => setData('nama_jabatan', e.target.value)}
                                    className="block w-full rounded-2xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-sm"
                                    required
                                />
                                {errors.nama_jabatan && (
                                    <span className="text-red-500 text-xs mt-1 block">{errors.nama_jabatan}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2.5 px-4 bg-primary hover:bg-opacity-95 text-white rounded-2xl text-sm font-semibold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Tambah Jabatan'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Daftar Jabatan */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Daftar Jabatan</h3>
                            <p className="text-xs text-slate-400">Semua jabatan aktif dalam ROHIS</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <th className="py-4 px-6 text-center w-16">No</th>
                                    <th className="py-4 px-6">Nama Jabatan</th>
                                    <th className="py-4 px-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {jabatanList.length > 0 ? (
                                    jabatanList.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6 text-center text-slate-400 font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="py-4 px-6 font-bold text-slate-800">
                                                {item.nama_jabatan}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(item.id, item.nama_jabatan)}
                                                    className="py-1.5 px-3 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold text-red-600 transition-all focus:outline-none"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="py-12 text-center text-slate-400 text-sm italic">
                                            Belum ada jabatan yang ditambahkan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <ConfirmDialog
                show={confirmState.show}
                title="Hapus Jabatan"
                message={`Apakah Anda yakin ingin menghapus jabatan "${confirmState.nama}"?`}
                onConfirm={confirmDelete}
                onCancel={() => setConfirmState({ show: false, id: null, nama: '' })}
            />
        </AdminLayout>
    );
}
