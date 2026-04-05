'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  useEffect(() => {
    fetch('/api/payslips')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPayslips(data.payslips);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
  };

  const downloadPDF = async () => {
    const slipElement = document.getElementById('payslip-content');
    if (!slipElement) return;

    try {
      const canvas = await html2canvas(slipElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Payslip_${selectedPayslip.month}_${selectedPayslip.year}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Gagal membuat PDF');
    }
  };

  if (loading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Slip Gaji Saya</h1>

      {payslips.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm text-gray-500 border">
          Belum ada data slip gaji.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b font-medium">Riwayat Slip Gaji</div>
            <ul className="divide-y">
              {payslips.map(slip => (
                <li 
                  key={slip.id} 
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedPayslip?.id === slip.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                  onClick={() => setSelectedPayslip(slip)}
                >
                  Bulan: {slip.month} / {slip.year}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            {selectedPayslip ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border">
                {/* Content to be printed */}
                <div id="payslip-content" className="p-6 bg-white">
                  <div className="text-center mb-6 pb-6 border-b-2">
                    <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-800">SLIP GAJI</h2>
                    <p className="text-gray-500 mt-1">Periode: {selectedPayslip.month} - {selectedPayslip.year}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                    <div>
                      <p className="text-gray-500">Nama Karyawan</p>
                      <p className="font-semibold text-lg">{selectedPayslip.name}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-gray-600">Gaji Pokok</span>
                      <span className="font-medium">{formatRupiah(Number(selectedPayslip.base_salary))}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-gray-600">Uang Lembur</span>
                      <span className="font-medium text-green-600">+{formatRupiah(Number(selectedPayslip.overtime_pay))}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-gray-600">Potongan (Keterlambatan dll)</span>
                      <span className="font-medium text-red-600">-{formatRupiah(Number(selectedPayslip.deductions))}</span>
                    </div>
                    <div className="flex justify-between pt-4 pb-2 text-lg font-bold">
                      <span>Total Gaji Bersih</span>
                      <span>{formatRupiah(Number(selectedPayslip.net_salary))}</span>
                    </div>
                  </div>

                  <div className="mt-12 text-xs text-center text-gray-400">
                    Dokumen ini digenerate secara otomatis oleh sistem HRIS.
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={downloadPDF}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition"
                  >
                    Unduh PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-xl text-center text-gray-500 border h-full flex items-center justify-center">
                Pilih bulan untuk melihat detail slip gaji.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}