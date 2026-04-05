'use client';

import { useState } from 'react';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleAttendance = async () => {
    // Note: userName input is no longer required as backend takes user_name from auth token,
    // but we can leave it for now or rely on the backend strictly.
    
    setStatus('loading');
    setMessage('Mengambil lokasi...');

    if (!navigator.geolocation) {
      setStatus('error');
      setMessage('Geolocation tidak didukung oleh browser ini.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMessage('Memvalidasi lokasi dan mengirim data...');

        try {
          const response = await fetch('/api/attendance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              latitude,
              longitude,
            }),
          });

          const result = await response.json();

          if (response.ok) {
            setStatus('success');
            setMessage('Absensi berhasil dicatat!');
            setUserName('');
          } else {
            setStatus('error');
            setMessage(result.error || 'Terjadi kesalahan saat mencatat absensi.');
          }
        } catch (error) {
          console.error('Error submitting attendance:', error);
          setStatus('error');
          setMessage('Gagal terhubung ke server.');
        }
      },
      (error) => {
        setStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setMessage('Izin akses lokasi ditolak. Aktifkan GPS dan berikan izin akses.');
            break;
          case error.POSITION_UNAVAILABLE:
            setMessage('Informasi lokasi tidak tersedia.');
            break;
          case error.TIMEOUT:
            setMessage('Waktu permintaan lokasi habis.');
            break;
          default:
            setMessage('Terjadi kesalahan saat mengambil lokasi.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Sistem Absensi</h1>
          <p className="text-gray-500 mt-2">Lakukan absensi dengan mengizinkan akses lokasi Anda</p>
        </div>

        <div className="space-y-6">
          {/* Form input nama disembunyikan/dihapus karena kita sudah menggunakan token login */}
          
          <button
            onClick={handleAttendance}
            disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            ) : (
              'Absen Sekarang'
            )}
          </button>

          {message && (
            <div className={`p-4 rounded-lg text-sm ${
              status === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
              status === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 
              'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}