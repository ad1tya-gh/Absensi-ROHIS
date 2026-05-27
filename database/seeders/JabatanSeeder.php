<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Jabatan;

class JabatanSeeder extends Seeder
{
    public function run()
    {
        $jabatans = ['Ketua', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 'Anggota'];
        
        foreach ($jabatans as $j) {
            Jabatan::firstOrCreate([
                'nama_jabatan' => $j
            ]);
        }
    }
}
