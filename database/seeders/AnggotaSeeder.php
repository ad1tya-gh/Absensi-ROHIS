<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Anggota;

class AnggotaSeeder extends Seeder
{
    /**
     * Seed beberapa data anggota dummy untuk testing.
     *
     * @return void
     */
    public function run()
    {
        $anggotaDummy = [
            [
                'nisn'    => '1234567890',
                'nama'    => 'Ahmad Fauzi Akbar',
                'kelas'   => 'X-IPA-1',
                'jabatan' => 'Ketua',
                'angkatan'=> 2024,
                'email'   => 'ahmadfauzi.2024@rohis.id',
            ],
            [
                'nisn'    => '1234567891',
                'nama'    => 'Siti Rahma Wati',
                'kelas'   => 'XI-IPS-2',
                'jabatan' => 'Sekretaris',
                'angkatan'=> 2025,
                'email'   => 'sitirahma.2025@rohis.id',
            ],
            [
                'nisn'    => '1234567892',
                'nama'    => 'Budi Santoso',
                'kelas'   => 'X-IPA-2',
                'jabatan' => 'Anggota',
                'angkatan'=> 2024,
                'email'   => 'budisantoso.2024@rohis.id',
            ],
            [
                'nisn'    => '1234567893',
                'nama'    => 'Dewi Lestari',
                'kelas'   => 'XI-IPA-1',
                'jabatan' => 'Bendahara',
                'angkatan'=> 2025,
                'email'   => 'dewilestari.2025@rohis.id',
            ],
            [
                'nisn'    => '1234567894',
                'nama'    => 'Rizky Pratama',
                'kelas'   => 'XII-IPS-1',
                'jabatan' => 'Anggota',
                'angkatan'=> 2023,
                'email'   => 'rizkypratama.2023@rohis.id',
            ],
        ];

        foreach ($anggotaDummy as $data) {
            // Buat atau temukan akun user
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'     => $data['nama'],
                    'password' => Hash::make('RohisBisa2026'),
                    'role'     => 'user',
                ]
            );

            // Buat atau temukan data anggota
            Anggota::firstOrCreate(
                ['nisn' => $data['nisn']],
                [
                    'nama'         => $data['nama'],
                    'kelas'        => $data['kelas'],
                    'jabatan'      => $data['jabatan'],
                    'tanda_tangan' => null,
                    'user_id'      => $user->id,
                ]
            );
        }
    }
}
