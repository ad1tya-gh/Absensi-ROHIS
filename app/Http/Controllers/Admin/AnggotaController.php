<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AnggotaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Anggota::with('user');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nis', 'like', "%{$search}%")
                  ->orWhere('nama', 'like', "%{$search}%")
                  ->orWhere('kelas', 'like', "%{$search}%")
                  ->orWhere('jabatan', 'like', "%{$search}%");
            });
        }

        $anggota = $query->orderBy('nama', 'asc')->paginate(10)->withQueryString();
        $jabatanList = \App\Models\Jabatan::orderBy('nama_jabatan', 'asc')->get();

        return Inertia::render('Admin/Anggota/Index', [
            'anggota' => $anggota,
            'filters' => $request->only(['search']),
            'jabatanList' => $jabatanList,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nis' => 'required|string|max:20|unique:anggota,nis',
            'nama' => 'required|string|max:100',
            'kelas' => 'required|string|max:20',
            'jabatan' => 'required|string|max:50',
            'angkatan' => 'required|integer|between:2000,2100',
        ]);

        DB::transaction(function () use ($validated) {
            // Generate email based on 2 first names and angkatan
            $nameParts = preg_split('/\s+/', trim(strtolower($validated['nama'])));
            $namePart = '';
            if (count($nameParts) >= 2) {
                $namePart = preg_replace('/[^a-z0-9]/', '', $nameParts[0]) . preg_replace('/[^a-z0-9]/', '', $nameParts[1]);
            } else if (count($nameParts) == 1) {
                $namePart = preg_replace('/[^a-z0-9]/', '', $nameParts[0]);
            }
            
            $baseEmail = $namePart . '.' . $validated['angkatan'] . '@rohis.id';
            $email = $baseEmail;
            $counter = 1;
            
            while (User::where('email', $email)->exists()) {
                $email = $namePart . '.' . $validated['angkatan'] . $counter . '@rohis.id';
                $counter++;
            }

            // Create user
            $user = User::create([
                'name' => $validated['nama'],
                'email' => $email,
                'password' => Hash::make('RohisBisa2026'),
                'role' => 'user',
            ]);

            // Create anggota
            Anggota::create([
                'nis' => $validated['nis'],
                'nama' => $validated['nama'],
                'kelas' => $validated['kelas'],
                'jabatan' => $validated['jabatan'],
                'tanda_tangan' => null,
                'user_id' => $user->id,
            ]);
        });

        return redirect()->route('admin.anggota.index')->with('success', 'Anggota berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $nis)
    {
        $anggota = Anggota::findOrFail($nis);
        
        $validated = $request->validate([
            'nis' => 'required|string|max:20|unique:anggota,nis,' . $nis . ',nis',
            'nama' => 'required|string|max:100',
            'kelas' => 'required|string|max:20',
            'jabatan' => 'required|string|max:50',
        ]);

        DB::transaction(function () use ($anggota, $validated) {
            $anggota->update([
                'nis' => $validated['nis'],
                'nama' => $validated['nama'],
                'kelas' => $validated['kelas'],
                'jabatan' => $validated['jabatan'],
            ]);

            if ($anggota->user) {
                $anggota->user->update([
                    'name' => $validated['nama'],
                ]);
            }
        });

        return redirect()->route('admin.anggota.index')->with('success', 'Data anggota berhasil diubah.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($nis)
    {
        $anggota = Anggota::findOrFail($nis);

        DB::transaction(function () use ($anggota) {
            $user = $anggota->user;
            $anggota->delete();
            if ($user) {
                $user->delete();
            }
        });

        return redirect()->route('admin.anggota.index')->with('success', 'Anggota berhasil dihapus.');
    }
}
