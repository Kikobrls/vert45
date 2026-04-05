'use client';

import { useState, useEffect } from 'react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    office_lat: '',
    office_lng: '',
    valid_radius: '',
    work_start: '',
    work_end: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSettings({
            office_lat: data.settings.office_lat,
            office_lng: data.settings.office_lng,
            valid_radius: data.settings.valid_radius,
            work_start: data.settings.work_start,
            work_end: data.settings.work_end
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Menyimpan...');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          office_lat: parseFloat(settings.office_lat),
          office_lng: parseFloat(settings.office_lng),
          valid_radius: parseInt(settings.valid_radius, 10),
          work_start: settings.work_start,
          work_end: settings.work_end
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Pengaturan berhasil disimpan!');
      } else {
        setMessage(data.error || 'Gagal menyimpan pengaturan');
      }
    } catch (err) {
      setMessage('Terjadi kesalahan pada server');
    }
  };

  if (loading) return <div className="p-8">Memuat pengaturan...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Pengaturan Sistem (Admin)</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude Kantor</label>
              <input
                type="number" step="any"
                value={settings.office_lat}
                onChange={e => setSettings({...settings, office_lat: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude Kantor</label>
              <input
                type="number" step="any"
                value={settings.office_lng}
                onChange={e => setSettings({...settings, office_lng: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Radius Valid Absensi (Meter)</label>
            <input
              type="number"
              value={settings.valid_radius}
              onChange={e => setSettings({...settings, valid_radius: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk (HH:MM)</label>
              <input
                type="time"
                value={settings.work_start}
                onChange={e => setSettings({...settings, work_start: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Pulang (HH:MM)</label>
              <input
                type="time"
                value={settings.work_end}
                onChange={e => setSettings({...settings, work_end: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {message && <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">{message}</div>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Simpan Pengaturan
          </button>
        </form>
      </div>
    </div>
  );
}