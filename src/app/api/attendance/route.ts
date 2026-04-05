import { NextRequest, NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';
import { UAParser } from 'ua-parser-js';

export async function POST(request: NextRequest) {
  try {
    // Inisialisasi DB jika belum (bisa juga dipindah ke tempat lain jika lebih proper)
    await initDb();

    // Secondary check: Pastikan dari mobile device
    const userAgent = request.headers.get('user-agent') || '';
    const parser = new UAParser(userAgent);
    const deviceType = parser.getDevice().type;
    const isMobile = deviceType === 'mobile' || deviceType === 'tablet';

    if (!isMobile) {
      return NextResponse.json(
        { error: 'Akses ditolak. Gunakan perangkat mobile.' },
        { status: 403 }
      );
    }
    
    // Ambil data user dari middleware header
    const userId = request.headers.get('x-user-id');
    const userNameHeader = request.headers.get('x-user-name');

    if (!userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { latitude, longitude } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Data lokasi tidak lengkap.' },
        { status: 400 }
      );
    }

    const deviceInfo = `${parser.getBrowser().name || 'Unknown Browser'} on ${parser.getOS().name || 'Unknown OS'}`;

    const connection = await pool.getConnection();
    try {
      // 1. Ambil pengaturan sistem (lokasi kantor & radius valid)
      const [settingsRows]: any = await connection.execute('SELECT office_lat, office_lng, valid_radius FROM settings LIMIT 1');
      
      if (settingsRows.length === 0) {
        return NextResponse.json({ error: 'Pengaturan sistem belum dikonfigurasi. Hubungi Admin.' }, { status: 500 });
      }

      const { office_lat, office_lng, valid_radius } = settingsRows[0];

      // 2. Hitung jarak menggunakan rumus Haversine
      const toRad = (value: number) => (value * Math.PI) / 180;
      const R = 6371e3; // Radius bumi dalam meter
      const lat1 = toRad(Number(office_lat));
      const lat2 = toRad(Number(latitude));
      const deltaLat = toRad(Number(latitude) - Number(office_lat));
      const deltaLng = toRad(Number(longitude) - Number(office_lng));

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Jarak dalam meter

      // 3. Validasi radius
      if (distance > valid_radius) {
        // Catat sebagai invalid atau tolak langsung
        return NextResponse.json({ 
          error: `Anda berada di luar radius kantor yang diizinkan. Jarak Anda: ${Math.round(distance)} meter. Radius maksimal: ${valid_radius} meter.` 
        }, { status: 400 });
      }

      // 4. Catat kehadiran jika lolos validasi
      await connection.execute(
        `INSERT INTO attendance (user_id, user_name, latitude, longitude, device_info, status) VALUES (?, ?, ?, ?, ?, 'on_time')`,
        [userId, userNameHeader, latitude, longitude, deviceInfo]
      );
    } finally {
      connection.release();
    }

    return NextResponse.json(
      { success: true, message: 'Absensi berhasil dicatat' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error handling attendance submission:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memproses absensi.' },
      { status: 500 }
    );
  }
}