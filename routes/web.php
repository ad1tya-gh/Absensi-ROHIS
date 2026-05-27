<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\AnggotaController;
use App\Http\Controllers\Admin\KegiatanController;
use App\Http\Controllers\User\AbsenController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Home redirection
Route::get('/', function () {
    if (auth()->check()) {
        return auth()->user()->role === 'admin' 
            ? redirect('/admin/dashboard') 
            : redirect('/dashboard');
    }
    return redirect()->route('login');
});

// Member Dashboard & Attendance Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [AbsenController::class, 'dashboard'])->name('dashboard');
    Route::get('/absen', [AbsenController::class, 'index'])->name('absen.index');
    
    // API-like routes for attendance operations (via web middleware for session/CSRF protection)
    Route::post('/api/absen/validasi-kode', [AbsenController::class, 'validateCode'])->name('absen.validate');
    Route::post('/api/absen/submit', [AbsenController::class, 'submit'])->name('absen.submit');
    
    // Profile Management (Breeze standard)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Panel Routes (Protected by Auth and IsAdmin Middleware)
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // CRUD Anggota
    Route::get('/anggota', [AnggotaController::class, 'index'])->name('anggota.index');
    Route::post('/anggota', [AnggotaController::class, 'store'])->name('anggota.store');
    Route::put('/anggota/{nis}', [AnggotaController::class, 'update'])->name('anggota.update');
    Route::delete('/anggota/{nis}', [AnggotaController::class, 'destroy'])->name('anggota.destroy');
    
    // CRUD & Operations Kegiatan
    Route::get('/kegiatan', [KegiatanController::class, 'index'])->name('kegiatan.index');
    Route::post('/kegiatan', [KegiatanController::class, 'store'])->name('kegiatan.store');
    Route::get('/kegiatan/{id}', [KegiatanController::class, 'show'])->name('kegiatan.show');
    Route::put('/kegiatan/{id}', [KegiatanController::class, 'update'])->name('kegiatan.update');
    Route::delete('/kegiatan/{id}', [KegiatanController::class, 'destroy'])->name('kegiatan.destroy');
    
    // Toggle Kegiatan Status
    Route::post('/kegiatan/{id}/toggle', [KegiatanController::class, 'toggleStatus'])->name('kegiatan.toggle');
    
    // Export PDF Daftar Hadir
    Route::get('/kegiatan/{id}/export-pdf', [KegiatanController::class, 'exportPdf'])->name('kegiatan.export-pdf');
    
    // Delete Absensi Record
    Route::delete('/absensi/{id}', [KegiatanController::class, 'destroyAbsensi'])->name('absensi.destroy');
    
    // CRUD Jabatan
    Route::get('/jabatan', [\App\Http\Controllers\Admin\JabatanController::class, 'index'])->name('jabatan.index');
    Route::post('/jabatan', [\App\Http\Controllers\Admin\JabatanController::class, 'store'])->name('jabatan.store');
    Route::delete('/jabatan/{id}', [\App\Http\Controllers\Admin\JabatanController::class, 'destroy'])->name('jabatan.destroy');
});

require __DIR__.'/auth.php';
