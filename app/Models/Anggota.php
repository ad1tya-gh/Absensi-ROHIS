<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anggota extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database.
     */
    protected $table = 'anggota';

    /**
     * Primary key adalah NIS (string), bukan auto-increment.
     */
    protected $primaryKey = 'nis';
    public $incrementing  = false;
    protected $keyType    = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nis',
        'nama',
        'kelas',
        'jabatan',
        'tanda_tangan',
        'user_id',
    ];

    /**
     * Relasi ke akun user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke daftar absensi anggota ini.
     */
    public function absensis()
    {
        return $this->hasMany(Absensi::class, 'nis', 'nis');
    }
}
