<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('absensi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kegiatan_id')->constrained('kegiatan')->cascadeOnDelete();
            $table->string('nis', 20);
            $table->foreign('nis')->references('nis')->on('anggota')->cascadeOnDelete();
            $table->timestamp('waktu_absen');
            $table->text('tanda_tangan'); // Base64 data URL
            $table->timestamps();

            // Constraint: satu anggota hanya bisa absen sekali per kegiatan
            $table->unique(['kegiatan_id', 'nis']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('absensi');
    }
};
