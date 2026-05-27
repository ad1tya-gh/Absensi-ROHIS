<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Kegiatan;
use App\Models\Absensi;
use App\Models\Anggota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AbsenController extends Controller
{
    /**
     * Show the user dashboard.
     */
    public function dashboard()
    {
        $user = Auth::user();
        
        // If user is admin, redirect to admin dashboard
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        $anggota = Anggota::where('user_id', $user->id)->first();

        // Get attendance history
        $riwayat = [];
        if ($anggota) {
            $riwayat = Absensi::with('kegiatan')
                ->where('nisn', $anggota->nisn)
                ->orderBy('waktu_absen', 'desc')
                ->get();
        }

        return Inertia::render('User/Dashboard', [
            'anggota' => $anggota,
            'riwayat' => $riwayat,
        ]);
    }

    /**
     * Show the attendance page.
     */
    public function index()
    {
        $user = Auth::user();
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard')->with('error', 'Admin tidak perlu melakukan absensi.');
        }

        $anggota = Anggota::where('user_id', $user->id)->first();
        if (!$anggota) {
            return redirect()->route('dashboard')->with('error', 'Data anggota Anda belum terdaftar.');
        }

        return Inertia::render('User/Absen', [
            'anggota' => $anggota,
        ]);
    }

    /**
     * Validate the attendance code.
     */
    public function validateCode(Request $request)
    {
        $request->validate([
            'kode_absen' => 'required|string',
        ]);

        $user = Auth::user();
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admin tidak dapat melakukan absensi.'], 403);
        }

        $anggota = Anggota::where('user_id', $user->id)->first();
        if (!$anggota) {
            return response()->json(['message' => 'Data anggota Anda tidak ditemukan.'], 403);
        }

        $kode = strtoupper(trim($request->input('kode_absen')));
        $kegiatan = Kegiatan::where('kode_absen', $kode)->first();

        if (!$kegiatan) {
            return response()->json(['message' => 'Kode absensi tidak valid atau tidak ditemukan.'], 404);
        }

        if (!$kegiatan->is_active) {
            return response()->json(['message' => 'Kegiatan ini sudah tidak aktif / selesai.'], 400);
        }

        // Check duplicate attendance
        $sudahAbsen = Absensi::where('kegiatan_id', $kegiatan->id)
            ->where('nisn', $anggota->nisn)
            ->exists();

        if ($sudahAbsen) {
            return response()->json(['message' => 'Anda sudah melakukan absensi untuk kegiatan ini.'], 400);
        }

        return response()->json([
            'valid' => true,
            'kegiatan' => $kegiatan,
        ]);
    }

    /**
     * Submit attendance.
     */
    public function submit(Request $request)
    {
        $request->validate([
            'kode_absen' => 'required|string',
            'tanda_tangan' => 'required|string', // Base64 data URL
        ]);

        $user = Auth::user();
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admin tidak dapat melakukan absensi.'], 403);
        }

        $anggota = Anggota::where('user_id', $user->id)->first();
        if (!$anggota) {
            return response()->json(['message' => 'Data anggota Anda tidak ditemukan.'], 403);
        }

        $kode = strtoupper(trim($request->input('kode_absen')));
        $kegiatan = Kegiatan::where('kode_absen', $kode)->first();

        if (!$kegiatan) {
            return response()->json(['message' => 'Kode absensi tidak valid atau tidak ditemukan.'], 404);
        }

        if (!$kegiatan->is_active) {
            return response()->json(['message' => 'Kegiatan ini sudah tidak aktif / selesai.'], 400);
        }

        // Double check duplicate attendance in transaction
        return DB::transaction(function () use ($kegiatan, $anggota, $request) {
            $sudahAbsen = Absensi::where('kegiatan_id', $kegiatan->id)
                ->where('nisn', $anggota->nisn)
                ->exists();

            if ($sudahAbsen) {
                return response()->json(['message' => 'Anda sudah melakukan absensi untuk kegiatan ini.'], 400);
            }

            // Create attendance entry
            $absensi = Absensi::create([
                'kegiatan_id' => $kegiatan->id,
                'nisn' => $anggota->nisn,
                'waktu_absen' => now(),
                'tanda_tangan' => $request->input('tanda_tangan'),
            ]);

            // Save default profile signature if empty
            if (empty($anggota->tanda_tangan)) {
                $anggota->tanda_tangan = $request->input('tanda_tangan');
                $anggota->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Kehadiran Anda berhasil dicatat!',
                'data' => [
                    'nama_kegiatan' => $kegiatan->nama_kegiatan,
                    'waktu_absen' => $absensi->waktu_absen->format('H:i') . ' WIB',
                ]
            ]);
        });
    }
}
