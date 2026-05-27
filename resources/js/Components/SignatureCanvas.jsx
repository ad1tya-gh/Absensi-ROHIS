import React, { useRef, useEffect, useCallback } from 'react';
import SignaturePad from 'react-signature-canvas';

export default function SignatureCanvas({ label, onChange, value }) {
    const padRef = useRef(null);
    const containerRef = useRef(null);

    // ✅ FIX: Resize internal canvas agar cocok dengan ukuran visual
    const resizeCanvas = useCallback(() => {
        const pad = padRef.current;
        if (!pad) return;

        const canvas = pad.getCanvas();
        const container = containerRef.current;
        if (!canvas || !container) return;

        // Simpan data signature yang sudah ada (jika ada)
        const data = pad.toData();

        // Set ukuran internal canvas = ukuran visual container
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;

        // Restore data signature setelah resize
        pad.clear();
        if (data && data.length > 0) {
            pad.fromData(data);
        }
    }, []);

    useEffect(() => {
        // Resize saat pertama kali mount
        resizeCanvas();

        // Resize juga kalau window berubah ukuran (responsive)
        const observer = new ResizeObserver(resizeCanvas);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [resizeCanvas]);

    const handleClear = () => {
        padRef.current.clear();
        onChange(null);
    };

    const handleEnd = () => {
        if (padRef.current.isEmpty()) {
            onChange(null);
        } else {
            const dataUrl = padRef.current.getTrimmedCanvas().toDataURL('image/png');
            onChange(dataUrl);
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label} <span className="text-red-500">*</span>
                </label>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-2 bg-slate-50 relative overflow-hidden group hover:border-primary transition-all duration-300">
                {/* ✅ FIX: tambahkan ref di sini untuk mengukur ukuran visual */}
                <div ref={containerRef} className="w-full h-48">
                    <SignaturePad
                        ref={padRef}
                        canvasProps={{
                            className: 'w-full h-full bg-white rounded-xl cursor-crosshair border border-gray-100 shadow-inner'
                        }}
                        onEnd={handleEnd}
                    />
                </div>

                <div className="absolute bottom-4 right-4 flex space-x-2">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shadow-sm focus:outline-none"
                    >
                        Hapus Coretan
                    </button>
                </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">
                Gunakan jari Anda (layar sentuh) atau mouse untuk menandatangani di dalam area kotak di atas.
            </p>
        </div>
    );
}