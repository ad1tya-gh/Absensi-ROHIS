<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Daftar Hadir - {{ $kegiatan->nama_kegiatan }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #008298;
            padding-bottom: 10px;
        }
        .header h2 {
            margin: 0;
            color: #0f2846;
            font-size: 20px;
            text-transform: uppercase;
        }
        .header p {
            margin: 5px 0 0 0;
            color: #6b7280;
            font-size: 14px;
        }
        .info-table {
            width: 100%;
            margin-bottom: 25px;
            border-collapse: collapse;
        }
        .info-table td {
            padding: 4px 8px;
            font-size: 12px;
        }
        .info-label {
            font-weight: bold;
            color: #0f2846;
            width: 15%;
        }
        .info-value {
            width: 35%;
        }
        .attendance-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .attendance-table th, .attendance-table td {
            border: 1px solid #e2e8f0;
            padding: 8px 10px;
            text-align: left;
        }
        .attendance-table th {
            background-color: #0f2846;
            color: #ffffff;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .attendance-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .signature-img {
            max-height: 40px;
            max-width: 100px;
            display: block;
        }
        .center {
            text-align: center;
        }
        .text-muted {
            color: #94a3b8;
            font-style: italic;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
        }
    </style>
</head>
<body>

    <div class="header">
        <h2>Daftar Hadir ROHIS SMK TI</h2>
        <p>SMK TI Bali GLobal Badung</p>
    </div>

    <table class="info-table">
        <tr>
            <td class="info-label">Kegiatan:</td>
            <td class="info-value">{{ $kegiatan->nama_kegiatan }}</td>
            <td class="info-label">Tanggal:</td>
            <td class="info-value">{{ \Carbon\Carbon::parse($kegiatan->tanggal)->translatedFormat('d F Y') }}</td>
        </tr>
        <tr>
            <td class="info-label">Waktu:</td>
            <td class="info-value">{{ \Carbon\Carbon::parse($kegiatan->waktu_mulai)->format('H:i') }} WIB</td>
            <td class="info-label">Total Hadir:</td>
            <td class="info-value"><strong>{{ $absensi->count() }} orang</strong></td>
        </tr>
    </table>

    <table class="attendance-table">
        <thead>
            <tr>
                <th class="center" style="width: 5%;">No</th>
                <th style="width: 15%;">NIS</th>
                <th style="width: 25%;">Nama Lengkap</th>
                <th style="width: 12%;">Kelas</th>
                <th style="width: 15%;">Jabatan</th>
                <th class="center" style="width: 15%;">Tanda Tangan</th>
                <th style="width: 13%;">Waktu Absen</th>
            </tr>
        </thead>
        <tbody>
            @forelse($absensi as $index => $item)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>{{ $item->nis }}</td>
                    <td><strong>{{ $item->anggota->nama }}</strong></td>
                    <td>{{ $item->anggota->kelas }}</td>
                    <td>{{ $item->anggota->jabatan }}</td>
                    <td class="center">
                        @if($item->tanda_tangan)
                            <img class="signature-img" src="{{ $item->tanda_tangan }}" alt="Ttd" />
                        @else
                            <span class="text-muted">Tidak ada</span>
                        @endif
                    </td>
                    <td>{{ \Carbon\Carbon::parse($item->waktu_absen)->format('H:i') }} WIB</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="center text-muted" style="padding: 20px;">
                        Belum ada anggota yang mengisi absensi untuk kegiatan ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak otomatis oleh Sistem Absensi ROHIS SMK TI Bali Global Badung pada {{ \Carbon\Carbon::now()->format('d-m-Y H:i') }} WIB
    </div>

</body>
</html>
