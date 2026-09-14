import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import SignatureCanvas from 'react-signature-canvas';
import { useAuth } from '../../context/AuthContext';
import { validateKodeAbsen, submitAbsen } from '../../lib/supabaseQueries';

export default function AbsenPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1); // 1: Input/Scan, 2: Signature
    const [kode, setKode] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [kegiatanInfo, setKegiatanInfo] = useState(null);
    
    const videoRef = useRef(null);
    const scannerRef = useRef(null);
    const sigCanvas = useRef(null);

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.destroy();
            }
        };
    }, []);

    const startScanner = async () => {
        setIsScanning(true);
        setError('');
        
        try {
            const hasCamera = await QrScanner.hasCamera();
            if (!hasCamera) throw new Error('Kamera tidak ditemukan');

            scannerRef.current = new QrScanner(
                videoRef.current,
                result => handleScanResult(result.data),
                {
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }
            );
            await scannerRef.current.start();
        } catch (err) {
            setError(err.message || 'Gagal mengakses kamera');
            setIsScanning(false);
        }
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.destroy();
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    const handleScanResult = async (resultCode) => {
        stopScanner();
        setKode(resultCode);
        await processKode(resultCode);
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        await processKode(kode);
    };

    const processKode = async (kodeAbsen) => {
        if (!kodeAbsen.trim()) return;
        setError('');
        setLoading(true);

        try {
            const result = await validateKodeAbsen(kodeAbsen, user.id);
            if (result.valid) {
                setKegiatanInfo(result.kegiatan);
                setStep(2); // Lanjut ke tanda tangan
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat memvalidasi kode.');
        } finally {
            setLoading(false);
        }
    };

    const handleClearSignature = () => {
        sigCanvas.current.clear();
    };

    const handleAbsenSubmit = async () => {
        if (sigCanvas.current.isEmpty()) {
            setError('Silakan tanda tangan terlebih dahulu.');
            return;
        }

        setError('');
        setLoading(true);
        const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

        try {
            await submitAbsen(kode, dataURL, user.id);
            alert('Absen berhasil!');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.message || 'Gagal mengirim absen.');
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-lg mx-auto">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-extrabold text-slate-800">Absen Kehadiran</h2>
                            <p className="text-sm text-slate-500 mt-1">Masukkan kode unik atau scan QR Code</p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        {!isScanning ? (
                            <>
                                <form onSubmit={handleManualSubmit} className="space-y-4">
                                    <div>
                                        <input 
                                            type="text"
                                            value={kode}
                                            onChange={(e) => setKode(e.target.value.toUpperCase())}
                                            placeholder="Kode Absen (cth: AB12C)"
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
                                            required
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-70"
                                    >
                                        {loading ? 'Memvalidasi...' : 'Validasi Kode'}
                                    </button>
                                </form>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-slate-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">ATAU</span>
                                    <div className="flex-grow border-t border-slate-200"></div>
                                </div>

                                <button 
                                    onClick={startScanner}
                                    className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-800/20 transition-all flex items-center justify-center gap-2"
                                >
                                    📷 Scan QR Code
                                </button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square">
                                    <video ref={videoRef} className="w-full h-full object-cover"></video>
                                    <div className="absolute inset-0 border-[40px] border-black/50"></div>
                                </div>
                                <button 
                                    onClick={stopScanner}
                                    className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-sm font-bold transition-all"
                                >
                                    Batal Scan
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-extrabold text-slate-800">Tanda Tangan</h2>
                            <p className="text-sm text-slate-500 mt-1">Konfirmasi kehadiran: <strong className="text-primary">{kegiatanInfo?.nama_kegiatan}</strong></p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden relative">
                            <SignatureCanvas 
                                ref={sigCanvas}
                                penColor="black"
                                canvasProps={{ className: 'w-full h-64' }} 
                            />
                            <div className="absolute bottom-2 right-2 flex gap-2">
                                <button 
                                    onClick={handleClearSignature}
                                    className="px-3 py-1 bg-white text-slate-500 rounded-lg text-xs font-bold shadow-sm border border-slate-200 hover:bg-slate-50"
                                >
                                    Hapus TTD
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold transition-all"
                            >
                                Kembali
                            </button>
                            <button 
                                onClick={handleAbsenSubmit}
                                disabled={loading}
                                className="flex-[2] py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-70"
                            >
                                {loading ? 'Memproses...' : 'Kirim Absen'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
