import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UAParser } from 'ua-parser-js';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-hris';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Lewati pengecekan untuk asset statis, halaman not-mobile, dan halaman login
  // API login dibiarkan lewat, API lain akan dicek auth-nya
  if (
    pathname.startsWith('/_next') ||
    pathname === '/api/auth/login' ||
    pathname === '/not-mobile' ||
    pathname === '/login' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 1. Pengecekan Perangkat Mobile
  // (Jika admin, kita bisa mengizinkan akses dari desktop. Kita cek nanti setelah auth)
  const userAgent = request.headers.get('user-agent') || '';
  const parser = new UAParser(userAgent);
  const deviceType = parser.getDevice().type;
  const isMobile = deviceType === 'mobile' || deviceType === 'tablet';

  // 2. Pengecekan Autentikasi dan JWT
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // Return 401 untuk akses API tanpa token
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Redirect ke login jika mencoba mengakses rute terproteksi tanpa token
    if (pathname.startsWith('/admin') || pathname.startsWith('/atasan') || pathname.startsWith('/dashboard') || pathname === '/') {
       return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    // Set header custom agar API route bisa membaca payload
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', String(payload.id));
    requestHeaders.set('x-user-role', String(payload.role));
    requestHeaders.set('x-user-name', String(payload.name));

    const role = payload.role as string;

    // RBAC: Role-Based Access Control
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (pathname.startsWith('/atasan') && role !== 'atasan') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Jika mencoba akses dashboard/absen tapi bukan mobile dan bukan admin -> Blokir
    if (!isMobile && role !== 'admin') {
      return NextResponse.rewrite(new URL('/not-mobile', request.url));
    }

    // Jika mengakses root '/' arahkan sesuai role
    if (pathname === '/') {
       if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
       if (role === 'atasan') return NextResponse.redirect(new URL('/atasan', request.url));
       return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  } catch (err) {
    // Jika akses API invalid token, kembalikan 401
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Jika token invalid/expired, hapus cookie dan redirect ke login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
