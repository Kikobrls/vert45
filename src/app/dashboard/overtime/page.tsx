'use client';

import { useState } from 'react';

export default function OvertimeRequestPage() {
  const [formData, setFormData] = useState({ date: '', hours: '', reason: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/overtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hours: parseFloat(formData.hours)
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Pengajuan lembur berhasil dikirim.');
        setFormData({ date: '', hours: '', reason: '' });
      } else {
        setMessage(data.error || 'Gagal mengajukan lembur.');
      }
    } catch (err) {
      setMessage('Terjadi kesalahan pada server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pengajuan Lembur</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Lembur</label>
            <input 
              type="date" required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Durasi (Jam)</label>
            <input 
              type="number" step="0.5" min="0.5" required
              value={formData.hours}
              onChange={e => setFormData({...formData, hours: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500" 
              placeholder="Contoh: 2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi Pekerjaan</label>
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
            {loading ? 'Memproses...' : 'Ajukan Lembur'}
          </button>
        </form>
      </div>
    </div>
  );
}