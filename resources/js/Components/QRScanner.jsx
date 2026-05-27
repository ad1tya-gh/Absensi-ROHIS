import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess, onScanError }) {
    const [scannerActive, setScannerActive] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    const qrScannerRef = useRef(null);
    const scannerId = 'qr-reader-container';

    useEffect(() => {
        // Request cameras list
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length > 0) {
                setCameras(devices);
                // Default to back camera if available, otherwise first camera
                const backCamera = devices.find(device => 
                    device.label.toLowerCase().includes('back') || 
                    device.label.toLowerCase().includes('rear')
                );
                setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
            } else {
                setErrorMsg('Tidak ada kamera terdeteksi.');
            }
        }).catch(err => {
            setErrorMsg('Gagal mengakses kamera: ' + err.message);
            if (onScanError) onScanError(err);
        });

        return () => {
            // Stop scanning if component unmounts
            if (qrScannerRef.current && qrScannerRef.current.isScanning) {
                qrScannerRef.current.stop().catch(err => console.error("Error stopping scanner:", err));
            }
        };
    }, []);

    const startScanning = () => {
        if (!selectedCameraId) return;

        setErrorMsg('');
        const html5QrCode = new Html5Qrcode(scannerId);
        qrScannerRef.current = html5QrCode;

        html5QrCode.start(
            selectedCameraId,
            {
                fps: 10,
                qrbox: { width: 220, height: 220 }
            },
            (decodedText, decodedResult) => {
                // Success
                if (html5QrCode.isScanning) {
                    html5QrCode.stop().then(() => {
                        setScannerActive(false);
                        onScanSuccess(decodedText);
                    }).catch(err => {
                        console.error("Error stopping scanner on success:", err);
                        onScanSuccess(decodedText); // fallback call
                    });
                }
            },
            (errorMessage) => {
                // Error scanning (fired on every frame if no QR found, so we don't spam the callback)
                if (onScanError) {
                    // console.log(errorMessage);
                }
            }
        ).then(() => {
            setScannerActive(true);
        }).catch(err => {
            setErrorMsg('Gagal menjalankan scanner: ' + err.message);
        });
    };

    const stopScanning = () => {
        if (qrScannerRef.current && qrScannerRef.current.isScanning) {
            qrScannerRef.current.stop().then(() => {
                setScannerActive(false);
            }).catch(err => {
                setErrorMsg('Gagal menghentikan scanner: ' + err.message);
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-md mx-auto">
            {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs w-full text-center">
                    {errorMsg}
                </div>
            )}

            <div 
                id={scannerId} 
                className="w-full aspect-square max-w-[280px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner mb-4 relative"
            >
                {!scannerActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                        <svg className="w-12 h-12 mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a8 8 0 11-16 0 8 8 0 0116 0z" />
                        </svg>
                        <p className="text-xs">Scanner dinonaktifkan</p>
                    </div>
                )}
            </div>

            {cameras.length > 1 && !scannerActive && (
                <div className="mb-4 w-full">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Pilih Kamera:</label>
                    <select
                        value={selectedCameraId}
                        onChange={(e) => setSelectedCameraId(e.target.value)}
                        className="w-full text-sm rounded-xl border-gray-200 focus:border-primary focus:ring-primary shadow-sm"
                    >
                        {cameras.map(camera => (
                            <option key={camera.id} value={camera.id}>
                                {camera.label || `Kamera ${cameras.indexOf(camera) + 1}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex space-x-3 w-full">
                {!scannerActive ? (
                    <button
                        type="button"
                        onClick={startScanning}
                        disabled={!selectedCameraId}
                        className="flex-1 py-3 px-4 bg-primary hover:bg-opacity-90 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Aktifkan Kamera
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={stopScanning}
                        className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-gray-600/20"
                    >
                        Matikan Kamera
                    </button>
                )}
            </div>
        </div>
    );
}
