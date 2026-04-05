'use client';

import { useState, useEffect } from 'react';

export default function AtasanDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/atasan/requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdate = async (id: number, type: string, status: string) => {
    const managerNotes = prompt('Masukkan catatan (opsional):');
    if (managerNotes === null) return; // user cancelled prompt

    try {
      const res = await fetch('/api/atasan/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, status, managerNotes })
      });
      if (res.ok) {
        alert('Berhasil!');
        fetchRequests();
      } else {
        alert('Gagal memproses data');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    }
  };

  if (loading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Atasan</h1>
      <p className="mb-6 text-gray-600">Daftar pengajuan cuti dan lembur yang menunggu persetujuan.</p>

      {requests.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500">
          Tidak ada pengajuan baru.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((req, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${req.type === 'leave' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {req.type === 'leave' ? 'Cuti' : 'Lembur'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {req.user_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {req.type === 'leave' ? (
                      <>
                        <p><strong>Dari:</strong> {new Date(req.start_date).toLocaleDateString()} <strong>Sampai:</strong> {new Date(req.end_date).toLocaleDateString()}</p>
                        <p><strong>Alasan:</strong> {req.reason}</p>
                      </>
                    ) : (
                      <>
                        <p><strong>Tanggal:</strong> {new Date(req.date).toLocaleDateString()} <strong>Durasi:</strong> {req.hours} Jam</p>
                        <p><strong>Alasan:</strong> {req.reason}</p>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleUpdate(req.id, req.type, 'approved')}
                      className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded transition"
                    >
                      Terima
                    </button>
                    <button 
                      onClick={() => handleUpdate(req.id, req.type, 'rejected')}
                      className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition"
                    >
                      Tolak
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}