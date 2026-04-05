export default function NotMobilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
        <p className="text-gray-700">
          Sistem absensi ini hanya dapat diakses melalui perangkat mobile (Smartphone atau Tablet).
          Silakan buka halaman ini melalui perangkat mobile Anda.
        </p>
      </div>
    </div>
  );
}