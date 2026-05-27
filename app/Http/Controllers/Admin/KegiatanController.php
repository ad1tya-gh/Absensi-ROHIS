<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kegiatan;
use App\Models\Absensi;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class KegiatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Kegiatan::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('nama_kegiatan', 'like', "%{$search}%")
                  ->orWhere('kode_absen', 'like', "%{$search}%");
        }

        $kegiatan = $query->orderBy('tanggal', 'desc')
                          ->orderBy('waktu_mulai', 'desc')
                          ->paginate(10)
                          ->withQueryString();

        return Inertia::render('Admin/Kegiatan/Index', [
            'kegiatan' => $kegiatan,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kegiatan' => 'required|string|max:150',
            'tanggal' => 'required|date',
            'waktu_mulai' => 'required',
            'kode_absen' => 'nullable|string|max:10|unique:kegiatan,kode_absen',
        ]);

        if (empty($validated['kode_absen'])) {
            $validated['kode_absen'] = Kegiatan::generateUniqueCode();
        } else {
            $validated['kode_absen'] = Str::upper($validated['kode_absen']);
        }

        Kegiatan::create([
            'nama_kegiatan' => $validated['nama_kegiatan'],
            'tanggal' => $validated['tanggal'],
            'waktu_mulai' => $validated['waktu_mulai'],
            'kode_absen' => $validated['kode_absen'],
            'is_active' => true,
        ]);

        return redirect()->route('admin.kegiatan.index')->with('success', 'Kegiatan berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);
        $absensi = Absensi::with('anggota')
            ->where('kegiatan_id', $id)
            ->orderBy('waktu_absen', 'asc')
            ->get();

        // Generate QR code SVG content
        $qrCodeSvg = '';
        try {
            $qrCodeSvg = QrCode::size(250)->generate($kegiatan->kode_absen)->toHtml();
        } catch (\Exception $e) {
            $qrCodeSvg = 'Error generating QR Code: ' . $e->getMessage();
        }

        return Inertia::render('Admin/Kegiatan/Detail', [
            'kegiatan' => $kegiatan,
            'absensi' => $absensi,
            'qrCodeSvg' => $qrCodeSvg,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $kegiatan = Kegiatan::findOrFail($id);

        $validated = $request->validate([
            'nama_kegiatan' => 'required|string|max:150',
            'tanggal' => 'required|date',
            'waktu_mulai' => 'required',
            'kode_absen' => 'required|string|max:10|unique:kegiatan,kode_absen,' . $id,
            'is_active' => 'required|boolean',
        ]);

        $validated['kode_absen'] = Str::upper($validated['kode_absen']);

        $kegiatan->update($validated);

        return redirect()->route('admin.kegiatan.index')->with('success', 'Kegiatan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);
        $kegiatan->delete();

        return redirect()->route('admin.kegiatan.index')->with('success', 'Kegiatan berhasil dihapus.');
    }

    /**
     * Toggle active status of a kegiatan.
     */
    public function toggleStatus($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);
        $kegiatan->is_active = !$kegiatan->is_active;
        $kegiatan->save();

        return redirect()->back()->with('success', 'Status kegiatan berhasil diubah.');
    }

    /**
     * Export attendance list to PDF.
     */
    public function exportPdf($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);
        $absensi = Absensi::with('anggota')
            ->where('kegiatan_id', $id)
            ->orderBy('waktu_absen', 'asc')
            ->get();

        $pdf = Pdf::loadView('pdf.absensi', compact('kegiatan', 'absensi'))
            ->setPaper('a4', 'portrait');

        return $pdf->download('Daftar_Hadir_' . str_replace(' ', '_', $kegiatan->nama_kegiatan) . '.pdf');
    }

    /**
     * Delete a single attendance entry.
     */
    public function destroyAbsensi($id)
    {
        $absensi = Absensi::findOrFail($id);
        $kegiatanId = $absensi->kegiatan_id;
        $absensi->delete();

        return redirect()->route('admin.kegiatan.show', $kegiatanId)->with('success', 'Kehadiran anggota berhasil dihapus.');
    }
}
