<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jabatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JabatanController extends Controller
{
    public function index()
    {
        $jabatanList = Jabatan::orderBy('nama_jabatan', 'asc')->get();
        return Inertia::render('Admin/Jabatan/Index', [
            'jabatanList' => $jabatanList
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_jabatan' => 'required|string|max:50|unique:jabatan,nama_jabatan',
        ], [
            'nama_jabatan.required' => 'Nama jabatan wajib diisi.',
            'nama_jabatan.unique' => 'Nama jabatan sudah terdaftar.',
            'nama_jabatan.max' => 'Nama jabatan maksimal 50 karakter.',
        ]);

        Jabatan::create([
            'nama_jabatan' => trim($request->nama_jabatan),
        ]);

        return redirect()->back()->with('message', 'Jabatan berhasil ditambahkan.');
    }

    public function destroy($id)
    {
        $jabatan = Jabatan::findOrFail($id);
        
        // Cek jika jabatan ini sedang digunakan oleh anggota
        $isUsed = \App\Models\Anggota::where('jabatan', $jabatan->nama_jabatan)->exists();
        
        if ($isUsed) {
            return redirect()->back()->withErrors([
                'error' => 'Jabatan "' . $jabatan->nama_jabatan . '" tidak dapat dihapus karena sedang digunakan oleh anggota.'
            ]);
        }

        $jabatan->delete();

        return redirect()->back()->with('message', 'Jabatan berhasil dihapus.');
    }
}
