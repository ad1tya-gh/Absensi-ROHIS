import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess, onScanError, isActive }) {
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [scannerActive, setScannerActive] = useState(false);
    
    const html5QrCodeRef = useRef(null);
    const scannerId = 'qr-reader-container-view';

    // 1. Dapatkan daftar kamera setelah komponen termuat
    useEffect(() => {
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length > 0) {
                setCameras(devices);
                // Pilih kamera belakang secara default jika tersedia
                const backCamera = devices.find(device => 
                    device.label.toLowerCase().includes('back') || 
                    device.label.toLowerCase().includes('rear')
                );
                setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
            } else {
                setErrorMsg('Tidak ada kamera terdeteksi. Silakan berikan izin akses kamera.');
            }
        }).catch(err => {
            setErrorMsg('Gagal mengakses kamera: ' + err.message);
            if (onScanError) onScanError(err);
        });

        // Cleanup: pastikan kamera dimatikan saat pindah halaman / tab
        return () => {
            if (html5QrCodeRef.current) {
                const scanner = html5QrCodeRef.current;
                if (scanner.isScanning) {
                    scanner.stop().catch(e => console.error(e));
                }
            }
        };
    }, []);

    // 2. Auto-start scanner saat selectedCameraId terpilih/berubah DAN scanner aktif
    useEffect(() => {
        if (isActive && selectedCameraId) {
            startScanner(selectedCameraId);
        } else {
            stopScanner();
        }
    }, [selectedCameraId, isActive]);

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            if (html5QrCodeRef.current.isScanning) {
                try {
                    await html5QrCodeRef.current.stop();
                } catch (err) {
                    console.error("Gagal menghentikan scanner:", err);
                }
            }
            html5QrCodeRef.current = null;
            setScannerActive(false);
        }
    };

    const startScanner = async (cameraId) => {
        setErrorMsg('');
        setScannerActive(false);

        // Hentikan scanner aktif terlebih dahulu jika ada
        await stopScanner();

        // Buat instance baru
        const html5QrCode = new Html5Qrcode(scannerId);
        html5QrCodeRef.current = html5QrCode;

        try {
            await html5QrCode.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 200, height: 200 }
                },
                (decodedText) => {
                    // Berhasil scan!
                    stopScanner().then(() => {
                        onScanSuccess(decodedText);
                    }).catch(() => {
                        onScanSuccess(decodedText);
                    });
                },
                (errorMessage) => {
                    // Frame scan biasa (abaikan agar tidak spam)
                }
            );
            setScannerActive(true);
        } catch (err) {
            setErrorMsg('Kamera gagal diaktifkan. Pastikan izin akses kamera diaktifkan: ' + err.message);
            setScannerActive(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-sm mx-auto">
            {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs w-full text-center font-semibold">
                    {errorMsg}
                </div>
            )}

            {/* Container scanner. ID ini harus stabil & tidak boleh di-remove dari DOM agar library html5-qrcode tidak rusak */}
            <div 
                id={scannerId} 
                className="w-full aspect-square max-w-[260px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner mb-4 relative"
            >
                {!scannerActive && !errorMsg && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center z-10 bg-slate-900">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
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
                        className="w-full text-xs rounded-xl border-gray-200 focus:border-primary focus:ring-primary shadow-sm py-2"
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
