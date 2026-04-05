import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const role = request.headers.get('x-user-role');
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
      );
      return NextResponse.json({ success: true, users: rows }, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const role = request.headers.get('x-user-role');
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, password, role: newRole } = body;

    if (!name || !email || !password || !newRole) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const connection = await pool.getConnection();
    try {
      // Periksa apakah email sudah ada
      const [existingUsers]: any = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
      }

      await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, newRole]
      );
      return NextResponse.json({ success: true, message: 'Pengguna berhasil ditambahkan' }, { status: 201 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}