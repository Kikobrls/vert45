import { NextRequest, NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-hris';

export async function POST(request: NextRequest) {
  try {
    await initDb();
    
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    let rows: any;
    try {
      [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    } finally {
      connection.release();
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Kredensial tidak valid' }, { status: 401 });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Kredensial tidak valid' }, { status: 401 });
    }

    // Generate JWT
    const secret = new TextEncoder().encode(JWT_SECRET);
    const alg = 'HS256';

    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: { id: user.id, email: user.email, role: user.role, name: user.name }
    }, { status: 200 });

    // Set cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 // 8 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}