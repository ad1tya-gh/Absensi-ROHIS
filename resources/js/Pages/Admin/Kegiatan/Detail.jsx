import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import ConfirmDialog from '@/Components/ConfirmDialog';

export default function Detail({ kegiatan, absensi, qrCodeSvg }) {
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [confirmState, setConfirmState] = useState({ show: false, item: null });

    const handleDeleteAbsensi = (item) => {
        setConfirmState({ show: true, item });
    };

    const confirmDelete = () => {
        router.delete(route('admin.absensi.destroy', confirmState.item.id), {
            onFinish: () => setConfirmState({ show: false, item: null })
        });
    };

    const formatDate = (dateStr) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    };

    const formatTime = (timeStr) => {
        return timeStr.substring(0, 5);
    };

    return (
        <AdminLayout title="Detail & Daftar Hadir Kegiatan">
            <Head title={`Detail - ${kegiatan.nama_kegiatan}`} />

            {/* Navigation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Link
                    href={route('admin.kegiatan.index')}
                    className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Kembali ke Daftar Kegiatan</span>
                </Link>

                <a
                    href={route('admin.kegiatan.export-pdf', kegiatan.id)}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Unduh PDF</span>
                </a>
            </div>

            {/* Event Summary Dashboard Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${
                            kegiatan.is_active
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50'
                                : 'bg-red-50 text-red-600 border-red-200/50'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${kegiatan.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {kegiatan.is_active ? 'Absensi Terbuka / Aktif' : 'Absensi Ditutup / Selesai'}
                        </span>
                        
                        <h2 className="text-2xl font-extrabold text-slate-800">{kegiatan.nama_kegiatan}</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(kegiatan.tanggal)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Jam {formatTime(kegiatan.waktu_mulai)} WIB</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="font-bold text-slate-700">{absensi.length} Orang Hadir</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Kode Absensi</span>
                        <span className="font-mono text-3xl font-extrabold text-secondary tracking-widest">{kegiatan.kode_absen}</span>
                    </div>

                    <button
                        onClick={() => setIsQrModalOpen(true)}
                        className="py-4 px-6 bg-secondary hover:bg-slate-800 text-white font-semibold text-sm rounded-2xl transition-all shadow-md shadow-secondary/15 flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a8 8 0 11-16 0 8 8 0 0116 0z" />
                        </svg>
                        <span>Tampilkan QR Code</span>
                    </button>
                </div>
            </div>

            {/* Attendance Table Panel */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-6">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Daftar Kehadiran Anggota</h3>
                        <p className="text-xs text-slate-400">Daftar hadir real-time untuk kegiatan ini</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="py-4 px-6 text-center w-12">No</th>
                                <th className="py-4 px-6">NIS</th>
                                <th className="py-4 px-6">Nama Lengkap</th>
                                <th className="py-4 px-6">Kelas</th>
                                <th className="py-4 px-6">Jabatan</th>
                                <th className="py-4 px-6 text-center">Tanda Tangan</th>
                                <th className="py-4 px-6">Waktu Absen</th>
                                <th className="py-4 px-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {absensi.length > 0 ? (
                                absensi.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6 text-center text-slate-400 font-medium">
                                            {index + 1}
                                        </td>
                                        <td className="py-4 px-6 font-mono text-xs text-slate-500">
                                            {item.nis}
                                        </td>
                                        <td className="py-4 px-6 font-bold text-slate-800">
                                            {item.anggota?.nama}
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 font-medium">
                                            {item.anggota?.kelas}
                                        </td>
                                        <td className="py-4 px-6 text-slate-600">
                                            {item.anggota?.jabatan}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {item.tanda_tangan ? (
                                                <div className="inline-block p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                    <img 
                                                        src={item.tanda_tangan} 
                                                        alt="Ttd Absen" 
                                                        className="h-8 max-w-[80px] object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Tidak Ada</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 font-medium">
                                            {new Date(item.waktu_absen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleDeleteAbsensi(item)}
                                                className="py-1.5 px-3 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold text-red-600 transition-all focus:outline-none"
                                            >
                                                Batalkan Kehadiran
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center text-slate-400 text-sm italic">
                                        Belum ada anggota yang melakukan absensi untuk kegiatan ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* QR Code Presentation Modal */}
            <Modal show={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} maxWidth="md">
                <div className="p-6 md:p-8 text-center flex flex-col items-center justify-center">
                    <div className="flex items-center justify-between w-full pb-4 border-b border-slate-100 mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Scan QR Code Absensi</h3>
                        <button type="button" onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <h4 className="text-xl font-bold text-slate-800 mb-1">{kegiatan.nama_kegiatan}</h4>
                    <p className="text-xs text-slate-400 mb-6">{formatDate(kegiatan.tanggal)}</p>

                    {/* QR Code Injected SVG */}
                    <div 
                        className="p-4 bg-white border-2 border-slate-100 rounded-3xl shadow-sm mb-6 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                    />

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full mb-6 text-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 block">Kode Absensi Alternatif</span>
                        <span className="font-mono text-3xl font-extrabold text-secondary tracking-widest">{kegiatan.kode_absen}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsQrModalOpen(false)}
                        className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all w-full"
                    >
                        Tutup Tampilan
                    </button>
                </div>
            </Modal>

            <ConfirmDialog
                show={confirmState.show}
                title="Batalkan Kehadiran"
                message={`Apakah Anda yakin ingin menghapus catatan kehadiran untuk ${confirmState.item?.anggota?.nama}?`}
                onConfirm={confirmDelete}
                onCancel={() => setConfirmState({ show: false, item: null })}
            />
        </AdminLayout>
    );
}
