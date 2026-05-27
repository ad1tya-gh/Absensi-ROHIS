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
                $q->where('nisn', 'like', "%{$search}%")
                  ->orWhere('nama', 'like', "%{$search}%")
                  ->orWhere('kelas', 'like', "%{$search}%")
                  ->orWhere('jabatan', 'like', "%{$search}%");
            });
        }

        $anggota = $query->orderBy('nama', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('Admin/Anggota/Index', [
            'anggota' => $anggota,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nisn' => 'required|string|max:20|unique:anggota,nisn',
            'nama' => 'required|string|max:100',
            'kelas' => 'required|string|max:20',
            'jabatan' => 'required|string|max:50',
            'angkatan' => 'required|integer|between:2000,2100',
            'tanda_tangan' => 'nullable|string',
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
                'nisn' => $validated['nisn'],
                'nama' => $validated['nama'],
                'kelas' => $validated['kelas'],
                'jabatan' => $validated['jabatan'],
                'tanda_tangan' => $validated['tanda_tangan'] ?? null,
                'user_id' => $user->id,
            ]);
        });

        return redirect()->route('admin.anggota.index')->with('success', 'Anggota berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $nisn)
    {
        $anggota = Anggota::findOrFail($nisn);
        
        $validated = $request->validate([
            'nisn' => 'required|string|max:20|unique:anggota,nisn,' . $nisn . ',nisn',
            'nama' => 'required|string|max:100',
            'kelas' => 'required|string|max:20',
            'jabatan' => 'required|string|max:50',
            'tanda_tangan' => 'nullable|string',
        ]);

        DB::transaction(function () use ($anggota, $validated) {
            $anggota->update([
                'nisn' => $validated['nisn'],
                'nama' => $validated['nama'],
                'kelas' => $validated['kelas'],
                'jabatan' => $validated['jabatan'],
                'tanda_tangan' => $validated['tanda_tangan'] ?? $anggota->tanda_tangan,
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
    public function destroy($nisn)
    {
        $anggota = Anggota::findOrFail($nisn);

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
