import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getKegiatanById, getAbsensiByKegiatan, toggleKegiatanStatus } from '../../lib/supabaseQueries';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function KegiatanDetail() {
    const { id } = useParams();
    const [kegiatan, setKegiatan] = useState(null);
    const [absensi, setAbsensi] = useState([]);
    const [loading, setLoading] = useState(true);
    const pdfRef = useRef();

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const dataKegiatan = await getKegiatanById(id);
            setKegiatan(dataKegiatan);
            const dataAbsensi = await getAbsensiByKegiatan(id);
            setAbsensi(dataAbsensi || []);
        } catch (error) {
            console.error('Error loading detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            const updated = await toggleKegiatanStatus(id, kegiatan.is_active);
            setKegiatan(updated);
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const handleDownloadPDF = async () => {
        const input = pdfRef.current;
        if (!input) return;

        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Absensi_${kegiatan.nama_kegiatan.replace(/\s+/g, '_')}.pdf`);
    };

    if (loading) return <div className="p-6 text-center text-slate-500">Memuat data...</div>;
    if (!kegiatan) return <div className="p-6 text-center text-slate-500">Kegiatan tidak ditemukan.</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Link to="/admin/kegiatan" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-2 mb-4">
                ← Kembali ke Daftar Kegiatan
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bagian Info & QR Code */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-slate-800">{kegiatan.nama_kegiatan}</h2>
                        </div>
                        <div className="space-y-3 mb-6 text-sm text-slate-600">
                            <p><strong>Tanggal:</strong> {kegiatan.tanggal}</p>
                            <p><strong>Waktu:</strong> {kegiatan.waktu_mulai}</p>
                            <p><strong>Status:</strong> {kegiatan.is_active ? 'Aktif' : 'Selesai'}</p>
                        </div>
                        <button 
                            onClick={handleToggleStatus}
                            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${kegiatan.is_active ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        >
                            {kegiatan.is_active ? 'Tutup Absensi' : 'Buka Absensi'}
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">QR Code Absensi</h3>
                        <p className="text-xs text-slate-500 mb-6">Scan QR code ini melalui halaman absen anggota.</p>
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 inline-block">
                            <QRCodeSVG value={kegiatan.kode_absen} size={200} level="H" />
                        </div>
                        <div className="text-sm font-mono bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-slate-700">
                            Kode Manual: <span className="font-bold text-primary text-xl tracking-wider">{kegiatan.kode_absen}</span>
                        </div>
                    </div>
                </div>

                {/* Bagian Daftar Hadir */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Daftar Hadir</h3>
                                <p className="text-sm text-slate-500">Total: {absensi.length} anggota hadir</p>
                            </div>
                            <button 
                                onClick={handleDownloadPDF}
                                className="px-4 py-2 bg-secondary hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 transition-all flex items-center gap-2"
                            >
                                ↓ Download PDF
                            </button>
                        </div>

                        <div className="overflow-x-auto" ref={pdfRef}>
                            <div className="p-4 bg-white">
                                {/* Header untuk PDF (tersembunyi saat di web biasa jika perlu, tapi kita tampilkan saja) */}
                                <div className="mb-4 pb-4 border-b border-slate-200 hidden print:block">
                                    <h2 className="text-2xl font-bold text-center">Daftar Hadir {kegiatan.nama_kegiatan}</h2>
                                    <p className="text-center text-sm">Tanggal: {kegiatan.tanggal} | Waktu: {kegiatan.waktu_mulai}</p>
                                </div>
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-3 font-bold">Waktu</th>
                                            <th className="px-4 py-3 font-bold">NIS</th>
                                            <th className="px-4 py-3 font-bold">Nama</th>
                                            <th className="px-4 py-3 font-bold">Kelas</th>
                                            <th className="px-4 py-3 font-bold text-center">TTD</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {absensi.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                                                    Belum ada yang absen.
                                                </td>
                                            </tr>
                                        ) : (
                                            absensi.map((absen) => (
                                                <tr key={absen.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 font-medium text-slate-900">
                                                        {new Date(absen.waktu_absen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">{absen.anggota?.nis}</td>
                                                    <td className="px-4 py-3 font-semibold text-slate-800">{absen.anggota?.nama}</td>
                                                    <td className="px-4 py-3 text-slate-600">{absen.anggota?.kelas}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        {absen.tanda_tangan ? (
                                                            <img src={absen.tanda_tangan} alt="TTD" className="h-8 mx-auto" />
                                                        ) : '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
