import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const connection = await pool.getConnection();
    try {
      const [rows]: any = await connection.execute(
        'SELECT p.*, u.name FROM payroll p JOIN users u ON p.user_id = u.id WHERE p.user_id = ? ORDER BY p.year DESC, p.month DESC',
        [userId]
      );
      return NextResponse.json({ success: true, payslips: rows }, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching payslips:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}