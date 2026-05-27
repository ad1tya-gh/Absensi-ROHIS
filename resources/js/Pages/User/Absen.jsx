import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import SignatureCanvas from '@/Components/SignatureCanvas';
import QRScanner from '@/Components/QRScanner';
import axios from 'axios';

export default function Absen({ anggota }) {
    const [step, setStep] = useState(1);
    const [activeTab, setActiveTab] = useState('manual'); // manual | qr
    const [kodeAbsen, setKodeAbsen] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Validated activity info
    const [kegiatan, setKegiatan] = useState(null);

    // Signature state
    const [signature, setSignature] = useState(null);

    // Success info
    const [successData, setSuccessData] = useState(null);

    const handleValidateCode = (codeToValidate) => {
        const targetCode = codeToValidate || kodeAbsen;
        if (!targetCode) {
            setErrorMsg('Harap masukkan kode absensi.');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        axios.post(route('absen.validate'), {
            kode_absen: targetCode
        }).then(response => {
            if (response.data.valid) {
                setKegiatan(response.data.kegiatan);
                setKodeAbsen(targetCode);
                setStep(2);
            }
        }).catch(err => {
            const message = err.response?.data?.message || 'Gagal memvalidasi kode absensi.';
            setErrorMsg(message);
        }).finally(() => {
            setLoading(false);
        });
    };

    const handleQrScanSuccess = (decodedText) => {
        // Automatically try to validate scanned text as code
        handleValidateCode(decodedText);
    };

    const handleQrScanError = (err) => {
        // Usually safe to ignore scan frame errors, but save last error if helpful
    };

    const handleSubmitAttendance = () => {
        if (!signature) {
            alert('Harap isi tanda tangan Anda terlebih dahulu.');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        axios.post(route('absen.submit'), {
            kode_absen: kodeAbsen,
            tanda_tangan: signature
        }).then(response => {
            if (response.data.success) {
                setSuccessData(response.data.data);
                setStep(3);
            }
        }).catch(err => {
            const message = err.response?.data?.message || 'Gagal mengirim absensi.';
            setErrorMsg(message);
            setStep(1); // Go back to step 1 on failure
        }).finally(() => {
            setLoading(false);
        });
    };

    const handleBackToStep1 = () => {
        setStep(1);
        setSignature(null);
        setErrorMsg('');
    };

    return (
        <UserLayout title="Pengisian Kehadiran (Absensi)">
            <Head title="Isi Kehadiran" />

            <div className="max-w-md mx-auto">
                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-8 px-4">
                    <div className="flex flex-col items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? 'bg-primary text-white ring-4 ring-primary/10' : 'bg-slate-200 text-slate-500'
                            }`}>
                            1
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-1">Token Absen</span>
                    </div>
                    <div className={`flex-1 h-0.5 mx-2 transition-all ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`}></div>
                    <div className="flex flex-col items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? 'bg-primary text-white ring-4 ring-primary/10' : 'bg-slate-200 text-slate-500'
                            }`}>
                            2
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-1">Tanda Tangan</span>
                    </div>
                    <div className={`flex-1 h-0.5 mx-2 transition-all ${step >= 3 ? 'bg-primary' : 'bg-slate-200'}`}></div>
                    <div className="flex flex-col items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 3 ? 'bg-primary text-white ring-4 ring-primary/10' : 'bg-slate-200 text-slate-500'
                            }`}>
                            3
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-1">Selesai</span>
                    </div>
                </div>

                {/* STEP 1: VALIDATE CODE */}
                {step === 1 && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                        <div className="text-center">
                            <h3 className="font-bold text-slate-800 text-lg">Validasi Kegiatan</h3>
                            <p className="text-xs text-slate-400 mt-1">Masukkan kode absen manual atau scan QR Code yang dibagikan admin</p>
                        </div>

                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-xs text-center font-medium">
                                {errorMsg}
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => { setActiveTab('manual'); setErrorMsg(''); }}
                                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                Input Manual
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveTab('qr'); setErrorMsg(''); }}
                                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'qr' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                Scan Kamera QR
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'manual' ? (
                            <form onSubmit={(e) => { e.preventDefault(); handleValidateCode(); }} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Kode Absensi</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: AB12CD"
                                        value={kodeAbsen}
                                        onChange={(e) => setKodeAbsen(e.target.value.toUpperCase())}
                                        disabled={loading}
                                        className="block w-full rounded-2xl border-slate-200 focus:border-primary focus:ring-primary shadow-sm text-center font-mono text-2xl tracking-widest uppercase py-3 disabled:opacity-50"
                                        required
                                        maxLength={10}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 px-4 bg-primary hover:bg-opacity-95 text-white rounded-2xl text-sm font-semibold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                                >
                                    {loading ? 'Memvalidasi...' : 'Cek Kode Absen'}
                                </button>
                            </form>
                        ) : (
                            <div className="py-2">
                                <QRScanner
                                    onScanSuccess={handleQrScanSuccess}
                                    onScanError={handleQrScanError}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: DRAW SIGNATURE */}
                {step === 2 && kegiatan && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Kegiatan Ditemukan</span>
                            <h4 className="font-extrabold text-slate-800 text-lg mt-1">{kegiatan.nama_kegiatan}</h4>
                            <p className="text-xs text-slate-500 mt-1">
                                {new Date(kegiatan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-xs text-center font-medium">
                                {errorMsg}
                            </div>
                        )}

                        <div>
                            <SignatureCanvas
                                label="Bubuhkan Tanda Tangan"
                                onChange={setSignature}
                            />
                        </div>

                        <div className="flex space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={handleBackToStep1}
                                disabled={loading}
                                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50"
                            >
                                Kembali
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitAttendance}
                                disabled={loading || !signature}
                                className="flex-2 py-3 px-6 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/95 hover:to-emerald-500/95 text-white rounded-2xl text-sm font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Mengirim...' : 'Hadir & Kirim'}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: SUCCESS CONFIRMATION */}
                {step === 3 && successData && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6 text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center shadow-inner shadow-emerald-500/5">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <div>
                            <h3 className="font-extrabold text-slate-800 text-xl">Absensi Berhasil!</h3>
                            <p className="text-xs text-slate-400 mt-1">Kehadiran Anda telah sukses dicatat di database</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 w-full space-y-3 text-left">
                            <div>
                                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">Kegiatan</span>
                                <span className="text-sm font-bold text-slate-700">{successData.nama_kegiatan}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">Nama Anggota</span>
                                    <span className="text-xs font-semibold text-slate-600">{anggota.nama}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">Waktu Absen</span>
                                    <span className="text-xs font-semibold text-slate-600">{successData.waktu_absen}</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={route('dashboard')}
                            className="w-full py-3.5 px-4 bg-secondary hover:bg-slate-800 text-white rounded-2xl text-sm font-semibold transition-all shadow-md shadow-secondary/10"
                        >
                            Kembali ke Dashboard
                        </Link>
                    </div>
                )}
            </div>
        </UserLayout>
    );
}
