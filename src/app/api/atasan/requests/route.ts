import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const role = request.headers.get('x-user-role');
  if (role !== 'atasan' && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const connection = await pool.getConnection();
    try {
      // Get pending leave requests
      const [leaveRows]: any = await connection.execute(`
        SELECT l.id, l.user_id, u.name as user_name, l.start_date, l.end_date, l.reason, l.status, 'leave' as type 
        FROM leave_requests l JOIN users u ON l.user_id = u.id 
        WHERE l.status = 'pending'
      `);
      
      // Get pending overtime requests
      const [overtimeRows]: any = await connection.execute(`
        SELECT o.id, o.user_id, u.name as user_name, o.date, o.hours, o.reason, o.status, 'overtime' as type 
        FROM overtime_requests o JOIN users u ON o.user_id = u.id 
        WHERE o.status = 'pending'
      `);

      return NextResponse.json({ success: true, requests: [...leaveRows, ...overtimeRows] }, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const role = request.headers.get('x-user-role');
  if (role !== 'atasan' && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, type, status, managerNotes } = body;

    if (!id || !type || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      if (type === 'leave') {
        await connection.execute(
          'UPDATE leave_requests SET status = ?, manager_notes = ? WHERE id = ?',
          [status, managerNotes || '', id]
        );
      } else if (type === 'overtime') {
        await connection.execute(
          'UPDATE overtime_requests SET status = ?, manager_notes = ? WHERE id = ?',
          [status, managerNotes || '', id]
        );
      }
      return NextResponse.json({ success: true, message: 'Status berhasil diubah' }, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}