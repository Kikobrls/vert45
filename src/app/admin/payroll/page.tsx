'use client';

import { useState } from 'react';

export default function AdminPayrollPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setMessage('Menghitung payroll...');

    try {
      const res = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error || 'Gagal generate payroll');
      }
    } catch (err) {
      setMessage('Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Generate Payroll</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Bulan</label>
          <input 
            type="number" min="1" max="12"
            value={month} onChange={e => setMonth(parseInt(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 outline-none" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tahun</label>
          <input 
            type="number" min="2000"
            value={year} onChange={e => setYear(parseInt(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 outline-none" 
          />
        </div>

        {message && <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">{message}</div>}

        <button 
          onClick={handleGenerate} disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
        >
          {loading ? 'Memproses...' : 'Mulai Generate Payroll'}
        </button>
      </div>
    </div>
  );
}