import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, hours, reason } = body;

    if (!date || !hours || !reason) {
      return NextResponse.json({ error: 'Harap lengkapi semua data pengajuan lembur' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `INSERT INTO overtime_requests (user_id, date, hours, reason) VALUES (?, ?, ?, ?)`,
        [userId, date, hours, reason]
      );
      return NextResponse.json({ success: true, message: 'Pengajuan lembur berhasil dikirim' }, { status: 201 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error submitting overtime:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}