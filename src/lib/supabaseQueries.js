import { supabase } from './supabase';

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data;
}

// ─── ANGGOTA ─────────────────────────────────────────────────────────────────

export async function getAnggotaList({ search = '', page = 1, perPage = 10 } = {}) {
    let query = supabase
        .from('anggota')
        .select('*, profiles!anggota_user_id_fkey(email)', { count: 'exact' });

    if (search) {
        query = query.or(`nis.ilike.%${search}%,nama.ilike.%${search}%,kelas.ilike.%${search}%,jabatan.ilike.%${search}%`);
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await query
        .order('nama', { ascending: true })
        .range(from, to);

    if (error) throw error;
    return { data, count, page, perPage };
}

export async function getAnggotaByUserId(userId) {
    const { data, error } = await supabase
        .from('anggota')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
    if (error) throw error;
    return data || null;
}

export async function createAnggota({ nis, nama, kelas, jabatan, angkatan }) {
    // 1. Generate email
    const nameParts = nama.trim().toLowerCase().split(/\s+/);
    let namePart = '';
    if (nameParts.length >= 2) {
        namePart = nameParts[0].replace(/[^a-z0-9]/g, '') + nameParts[1].replace(/[^a-z0-9]/g, '');
    } else {
        namePart = nameParts[0].replace(/[^a-z0-9]/g, '');
    }

    let email = `${namePart}.${angkatan}@rohis.id`;
    let password = 'RohisBisa2026';

    // 2. Buat client dengan service_role
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
        throw new Error("VITE_SUPABASE_SERVICE_ROLE_KEY belum diset di .env");
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    // 3. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { role: 'user' }
    });

    if (authError) throw authError;

    // 4. Pastikan data profile terbuat (Upsert)
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({ 
            id: authData.user.id,
            email: email,
            role: 'user' 
        });
        
    if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw profileError;
    }

    // 5. Insert ke tabel anggota
    const { data: anggotaData, error: anggotaError } = await supabaseAdmin
        .from('anggota')
        .insert({
            nis: nis,
            nama: nama,
            kelas: kelas,
            jabatan: jabatan,
            user_id: authData.user.id
        })
        .select()
        .single();

    if (anggotaError) {
        // Rollback auth user jika insert anggota gagal
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw anggotaError;
    }

    return anggotaData;
}

export async function updateAnggota(nis, { nama, kelas, jabatan }) {
    const { data, error } = await supabase
        .from('anggota')
        .update({ nama, kelas, jabatan, updated_at: new Date().toISOString() })
        .eq('nis', nis)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteAnggota(nis) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
        throw new Error("VITE_SUPABASE_SERVICE_ROLE_KEY belum diset di .env");
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. Dapatkan user_id dari tabel anggota
    const { data: anggota, error: getError } = await supabase
        .from('anggota')
        .select('user_id')
        .eq('nis', nis)
        .single();
    
    if (getError) throw getError;

    // 2. Hapus auth user (otomatis menghapus profile dan anggota karena ON DELETE CASCADE)
    if (anggota && anggota.user_id) {
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(anggota.user_id);
        if (deleteAuthError) throw deleteAuthError;
    } else {
        // Fallback jika user_id tidak ada
        const { error } = await supabase.from('anggota').delete().eq('nis', nis);
        if (error) throw error;
    }

    return true;
}

// ─── JABATAN ─────────────────────────────────────────────────────────────────

export async function getJabatanList() {
    const { data, error } = await supabase
        .from('jabatan')
        .select('*')
        .order('nama_jabatan', { ascending: true });
    if (error) throw error;
    return data;
}

export async function createJabatan(nama_jabatan) {
    const { data, error } = await supabase
        .from('jabatan')
        .insert({ nama_jabatan })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteJabatan(id) {
    const { error } = await supabase.from('jabatan').delete().eq('id', id);
    if (error) throw error;
}

// ─── KEGIATAN ─────────────────────────────────────────────────────────────────

export async function getKegiatanList({ search = '', page = 1, perPage = 10 } = {}) {
    let query = supabase
        .from('kegiatan')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.or(`nama_kegiatan.ilike.%${search}%,kode_absen.ilike.%${search}%`);
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await query
        .order('tanggal', { ascending: false })
        .order('waktu_mulai', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return { data, count, page, perPage };
}

export async function getKegiatanById(id) {
    const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function createKegiatan({ nama_kegiatan, tanggal, waktu_mulai, kode_absen }) {
    let kode = kode_absen ? kode_absen.toUpperCase() : generateCode();
    const { data, error } = await supabase
        .from('kegiatan')
        .insert({ nama_kegiatan, tanggal, waktu_mulai, kode_absen: kode, is_active: true })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateKegiatan(id, fields) {
    if (fields.kode_absen) fields.kode_absen = fields.kode_absen.toUpperCase();
    const { data, error } = await supabase
        .from('kegiatan')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteKegiatan(id) {
    const { error } = await supabase.from('kegiatan').delete().eq('id', id);
    if (error) throw error;
}

export async function toggleKegiatanStatus(id, currentStatus) {
    const { data, error } = await supabase
        .from('kegiatan')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ─── ABSENSI ─────────────────────────────────────────────────────────────────

export async function getAbsensiByKegiatan(kegiatanId) {
    const { data, error } = await supabase
        .from('absensi')
        .select('*, anggota(nis, nama, kelas, jabatan)')
        .eq('kegiatan_id', kegiatanId)
        .order('waktu_absen', { ascending: true });
    if (error) throw error;
    return data;
}

export async function deleteAbsensi(id) {
    const { error } = await supabase.from('absensi').delete().eq('id', id);
    if (error) throw error;
}

export async function validateKodeAbsen(kode, userId) {
    const kodeUpper = kode.trim().toUpperCase();

    // Cari kegiatan
    const { data: kegiatan, error: kegiatanError } = await supabase
        .from('kegiatan')
        .select('*')
        .eq('kode_absen', kodeUpper)
        .single();

    if (kegiatanError || !kegiatan) {
        return { valid: false, message: 'Kode absensi tidak valid atau tidak ditemukan.' };
    }
    if (!kegiatan.is_active) {
        return { valid: false, message: 'Kegiatan ini sudah tidak aktif / selesai.' };
    }

    // Cari anggota
    const anggota = await getAnggotaByUserId(userId);
    if (!anggota) {
        return { valid: false, message: 'Data anggota Anda tidak ditemukan.' };
    }

    // Cek duplikat absen
    const { data: existing } = await supabase
        .from('absensi')
        .select('id')
        .eq('kegiatan_id', kegiatan.id)
        .eq('nis', anggota.nis)
        .maybeSingle();

    if (existing) {
        return { valid: false, message: 'Anda sudah melakukan absensi untuk kegiatan ini.' };
    }

    return { valid: true, kegiatan, anggota };
}

export async function submitAbsen(kode, tandaTangan, userId) {
    const validation = await validateKodeAbsen(kode, userId);
    if (!validation.valid) throw new Error(validation.message);

    const { kegiatan, anggota } = validation;

    const waktuAbsen = new Date().toISOString();
    
    // Insert absensi (tanpa .select().single() untuk menghindari 406 Not Acceptable dari RLS)
    const { error } = await supabase
        .from('absensi')
        .insert({
            kegiatan_id: kegiatan.id,
            nis: anggota.nis,
            waktu_absen: waktuAbsen,
            tanda_tangan: tandaTangan,
        });

    if (error) throw error;

    // Simpan tanda tangan profil jika belum ada
    if (!anggota.tanda_tangan) {
        await supabase
            .from('anggota')
            .update({ tanda_tangan: tandaTangan, updated_at: new Date().toISOString() })
            .eq('nis', anggota.nis);
    }

    return {
        nama_kegiatan: kegiatan.nama_kegiatan,
        waktu_absen: new Date(waktuAbsen).toLocaleTimeString('id-ID', {
            hour: '2-digit', minute: '2-digit'
        }) + ' WIB',
    };
}

export async function getRiwayatAbsen(nis) {
    const { data, error } = await supabase
        .from('absensi')
        .select('*, kegiatan(nama_kegiatan, tanggal)')
        .eq('nis', nis)
        .order('waktu_absen', { ascending: false });
    if (error) throw error;
    return data;
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────

export async function getAdminDashboardStats() {
    const [
        { count: totalAnggota },
        { count: totalKegiatan },
        { count: kegiatanAktif },
        { data: recentAbsensi },
    ] = await Promise.all([
        supabase.from('anggota').select('*', { count: 'exact', head: true }),
        supabase.from('kegiatan').select('*', { count: 'exact', head: true }),
        supabase.from('kegiatan').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase
            .from('absensi')
            .select('*, anggota(nis, nama, kelas), kegiatan(nama_kegiatan)')
            .order('waktu_absen', { ascending: false })
            .limit(10),
    ]);

    return { totalAnggota, totalKegiatan, kegiatanAktif, recentAbsensi: recentAbsensi || [] };
}
