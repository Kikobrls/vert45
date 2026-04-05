'use client';

import { useState } from 'react';

export default function LeaveRequestPage() {
  const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Pengajuan cuti berhasil dikirim.');
        setFormData({ startDate: '', endDate: '', reason: '' });
      } else {
        setMessage(data.error || 'Gagal mengajukan cuti.');
      }
    } catch (err) {
      setMessage('Terjadi kesalahan pada server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pengajuan Cuti</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
            <input 
              type="date" required
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
            <input 
              type="date" required
              value={formData.endDate}
              onChange={e => setFormData({...formData, endDate: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alasan Cuti</label>
            <textarea 
              required rows={4}
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500" 
            />
          </div>
          
          {message && <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">{message}</div>}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {loading ? 'Memproses...' : 'Ajukan Cuti'}
          </button>
        </form>
      </div>
    </div>
  );
}