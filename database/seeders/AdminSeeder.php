<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Buat akun admin utama jika belum ada
        User::firstOrCreate(
            ['email' => 'admin@rohis.id'],
            [
                'name'     => 'Admin ROHIS 7',
                'password' => Hash::make('RohisBisa2026'),
                'role'     => 'admin',
            ]
        );
    }
}
