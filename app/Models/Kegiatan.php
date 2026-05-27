<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Kegiatan extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database.
     */
    protected $table = 'kegiatan';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nama_kegiatan',
        'tanggal',
        'waktu_mulai',
        'kode_absen',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tanggal'   => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Relasi ke daftar absensi kegiatan ini.
     */
    public function absensis()
    {
        return $this->hasMany(Absensi::class);
    }

    /**
     * Generate kode absen unik 6 karakter alfanumerik (uppercase).
     * Dicek keunikannya di database sebelum digunakan.
     */
    public static function generateUniqueCode(): string
    {
        do {
            $kode = Str::upper(Str::random(6));
        } while (static::where('kode_absen', $kode)->exists());

        return $kode;
    }
}
