import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  const role = request.headers.get('x-user-role');
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { month, year } = body;

    if (!month || !year) {
      return NextResponse.json({ error: 'Bulan dan tahun diperlukan' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      // Get all active users
      const [users]: any = await connection.execute('SELECT id FROM users WHERE role = "user"');

      let generatedCount = 0;

      // Simplifikasi perhitungan:
      // Base salary = 5.000.000
      // Overtime Pay = 50.000 per hour (hanya yang approved)
      // Deductions = 100.000 per keterlambatan/invalid (dari attendance table)

      const baseSalary = 5000000;
      const overtimeRate = 50000;
      const deductionRate = 100000;

      for (const user of users) {
        const userId = user.id;

        // Hitung total jam lembur yang disetujui di bulan/tahun tersebut
        const [overtimeRows]: any = await connection.execute(`
          SELECT SUM(hours) as total_hours 
          FROM overtime_requests 
          WHERE user_id = ? AND status = 'approved' 
            AND MONTH(date) = ? AND YEAR(date) = ?
        `, [userId, month, year]);
        
        const totalOvertimeHours = overtimeRows[0]?.total_hours || 0;
        const overtimePay = totalOvertimeHours * overtimeRate;

        // Hitung total keterlambatan / absen invalid di bulan/tahun tersebut
        const [attendanceRows]: any = await connection.execute(`
          SELECT COUNT(*) as late_count 
          FROM attendance 
          WHERE user_id = ? AND status != 'on_time' 
            AND MONTH(timestamp) = ? AND YEAR(timestamp) = ?
        `, [userId, month, year]);

        const lateCount = attendanceRows[0]?.late_count || 0;
        const deductions = lateCount * deductionRate;

        const netSalary = baseSalary + overtimePay - deductions;

        // Cek apakah slip bulan ini sudah di-generate
        const [existingPayroll]: any = await connection.execute(
          'SELECT id FROM payroll WHERE user_id = ? AND month = ? AND year = ?',
          [userId, String(month), year]
        );

        if (existingPayroll.length > 0) {
          // Update
          await connection.execute(`
            UPDATE payroll 
            SET base_salary = ?, overtime_pay = ?, deductions = ?, net_salary = ?, generated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [baseSalary, overtimePay, deductions, netSalary, existingPayroll[0].id]);
        } else {
          // Insert
          await connection.execute(`
            INSERT INTO payroll (user_id, month, year, base_salary, overtime_pay, deductions, net_salary)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [userId, String(month), year, baseSalary, overtimePay, deductions, netSalary]);
        }
        
        generatedCount++;
      }

      return NextResponse.json({ success: true, message: `Berhasil generate ${generatedCount} slip gaji` }, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error generating payroll:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}