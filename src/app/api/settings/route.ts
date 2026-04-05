import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows]: any = await connection.execute('SELECT * FROM settings LIMIT 1');
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, settings: rows[0] }, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Hanya admin yang bisa mengubah setting
  const role = request.headers.get('x-user-role');
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { office_lat, office_lng, valid_radius, work_start, work_end } = body;

    if (office_lat === undefined || office_lng === undefined || valid_radius === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE settings SET office_lat = ?, office_lng = ?, valid_radius = ?, work_start = ?, work_end = ?',
        [office_lat, office_lng, valid_radius, work_start || '09:00:00', work_end || '17:00:00']
      );
      return NextResponse.json({ success: true, message: 'Settings berhasil diperbarui' }, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}