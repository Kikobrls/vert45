import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Selamat datang di panel Admin. Pilih menu di bawah atau di navigasi atas untuk mengelola sistem.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/users" className="block group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group-hover:border-blue-500 transition-colors">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">👥 Manajemen Pengguna</h2>
            <p className="text-gray-500 text-sm">Tambah akun baru, atur role (Admin/Atasan/User), dan lihat daftar semua pengguna di sistem.</p>
          </div>
        </Link>

        <Link href="/admin/settings" className="block group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group-hover:border-blue-500 transition-colors">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">⚙️ Pengaturan Sistem</h2>
            <p className="text-gray-500 text-sm">Atur lokasi GPS kantor (Latitude/Longitude), radius absen valid, dan konfigurasi jam kerja.</p>
          </div>
        </Link>

        <Link href="/admin/payroll" className="block group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group-hover:border-blue-500 transition-colors">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">💰 Generate Payroll</h2>
            <p className="text-gray-500 text-sm">Hitung otomatis gaji bulanan karyawan berdasarkan jam lembur dan keterlambatan absensi.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}