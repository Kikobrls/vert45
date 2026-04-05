import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { startDate, endDate, reason } = body;

    if (!startDate || !endDate || !reason) {
      return NextResponse.json({ error: 'Harap lengkapi semua data pengajuan cuti' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `INSERT INTO leave_requests (user_id, start_date, end_date, reason) VALUES (?, ?, ?, ?)`,
        [userId, startDate, endDate, reason]
      );
      return NextResponse.json({ success: true, message: 'Pengajuan cuti berhasil dikirim' }, { status: 201 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error submitting leave:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}