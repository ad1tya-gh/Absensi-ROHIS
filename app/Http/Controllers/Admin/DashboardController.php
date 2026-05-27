<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use App\Models\Kegiatan;
use App\Models\Absensi;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Show the admin dashboard.
     */
    public function index()
    {
        $totalAnggota = Anggota::count();
        $totalKegiatan = Kegiatan::count();
        $kegiatanAktif = Kegiatan::where('is_active', true)->count();
        
        // Get recent check-ins (limit 5) for dashboard activity log
        $recentAbsensi = Absensi::with(['anggota', 'kegiatan'])
            ->orderBy('waktu_absen', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'totalAnggota' => $totalAnggota,
            'totalKegiatan' => $totalKegiatan,
            'kegiatanAktif' => $kegiatanAktif,
            'recentAbsensi' => $recentAbsensi,
        ]);
    }
}
