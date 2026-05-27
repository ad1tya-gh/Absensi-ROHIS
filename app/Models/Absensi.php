<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Absensi extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database.
     */
    protected $table = 'absensi';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'kegiatan_id',
        'nisn',
        'waktu_absen',
        'tanda_tangan',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'waktu_absen' => 'datetime',
    ];

    /**
     * Relasi ke kegiatan.
     */
    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class);
    }

    /**
     * Relasi ke anggota (melalui nisn).
     */
    public function anggota()
    {
        return $this->belongsTo(Anggota::class, 'nisn', 'nisn');
    }
}
