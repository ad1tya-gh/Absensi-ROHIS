import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

export default function QRScanner({ onScanSuccess, onScanError, isActive }) {
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [scannerActive, setScannerActive] = useState(false);

    const videoRef = useRef(null);
    const qrScannerRef = useRef(null);

    // 1. Ambil daftar kamera sekali saja saat komponen dimuat
    useEffect(() => {
        QrScanner.listCameras(true).then(devices => {
            if (devices && devices.length > 0) {
                setCameras(devices);
                // Cari kamera belakang secara default
                const backCamera = devices.find(device =>
                    device.label.toLowerCase().includes('back') ||
                    device.label.toLowerCase().includes('rear') ||
                    device.label.toLowerCase().includes('lingkungan')
                );
                setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
            } else {
                setErrorMsg('Tidak ada kamera terdeteksi.');
            }
        }).catch(err => {
            setErrorMsg('Gagal memuat daftar kamera: ' + err.message);
        });

        // Cleanup total saat komponen dibongkar (unmount)
        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.destroy();
                qrScannerRef.current = null;
            }
        };
    }, []);

    // 2. Kontrol jalannya scanner berdasarkan status aktif dan kamera yang dipilih
    useEffect(() => {
        if (isActive && selectedCameraId && videoRef.current) {
            // Berikan jeda sedikit agar DOM video benar-benar siap
            const timer = setTimeout(() => {
                startScanner(selectedCameraId);
            }, 300);

            return () => clearTimeout(timer);
        } else {
            stopScanner();
        }
    }, [selectedCameraId, isActive]);

    const stopScanner = () => {
        if (qrScannerRef.current) {
            try {
                qrScannerRef.current.stop();
                qrScannerRef.current.destroy();
            } catch (err) {
                console.log("Scanner sudah dibersihkan.");
            }
            qrScannerRef.current = null;
        }
        setScannerActive(false);
    };

    const startScanner = (cameraId) => {
        setErrorMsg('');

        // Bersihkan objek lama jika ada tanpa memicu re-render state
        if (qrScannerRef.current) {
            try { qrScannerRef.current.destroy(); } catch (e) { }
        }

        if (!videoRef.current) return;

        // Inisialisasi QrScanner baru secara langsung dan aman
        const qrScanner = new QrScanner(
            videoRef.current,
            (result) => {
                // Berhasil scan! Matikan scanner dulu baru jalankan fungsi sukses
                if (qrScannerRef.current) {
                    qrScannerRef.current.stop();
                }
                if (onScanSuccess) {
                    onScanSuccess(result.data);
                }
            },
            {
                onDecodeError: () => { /* Abaikan logs mencari frame QR */ },
                preferredCamera: cameraId,
                highlightScanRegion: true,
                maxScansPerSecond: 6,
            }
        );

        qrScannerRef.current = qrScanner;

        // Jalankan dan set status aktif hanya jika berhasil resolve
        qrScanner.start()
            .then(() => {
                setScannerActive(true);
            })
            .catch(err => {
                console.error(err);
                setErrorMsg('Kamera gagal diaktifkan. Berikan izin akses kamera dan pastikan menggunakan HTTPS.');
                setScannerActive(false);
            });
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-sm mx-auto">
            {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs w-full text-center font-semibold">
                    {errorMsg}
                </div>
            )}

            <div className="w-full aspect-square max-w-[260px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner mb-4 relative">
                {/* Tag video dipaksa playsInline agar tidak membuka full-screen di iOS */}
                <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />

                {/* Overlay Loading hanya muncul jika scanner belum ready beneran */}
                {!scannerActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center z-10 bg-slate-900">
                        <div className="w-10 h-10 border-4 border-t-transparent border-emerald-500 rounded-full animate-spin mb-3"></div>
                        <p className="text-xs">Mengaktifkan kamera...</p>
                    </div>
                )}
            </div>

            {cameras.length > 1 && (
                <div className="w-full">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Pilih Kamera:</label>
                    <select
                        value={selectedCameraId}
                        onChange={(e) => setSelectedCameraId(e.target.value)}
                        className="w-full text-xs rounded-xl border-gray-200 shadow-sm py-2"
                    >
                        {cameras.map(camera => (
                            <option key={camera.id} value={camera.id}>
                                {camera.label || `Kamera ${cameras.indexOf(camera) + 1}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}