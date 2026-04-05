import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'attendance_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

import bcrypt from 'bcryptjs';

export async function initDb() {
  try {
    const connection = await pool.getConnection();
    
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'atasan', 'user') DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings table (for dynamic office config)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        office_lat DECIMAL(10, 8),
        office_lng DECIMAL(11, 8),
        valid_radius INT DEFAULT 100,
        work_start TIME,
        work_end TIME
      )
    `);

    // Advanced Attendance table (links to user_id)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_name VARCHAR(255), 
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        device_info VARCHAR(255),
        status ENUM('on_time', 'late', 'invalid') DEFAULT 'on_time',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Leave requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        document_url VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        manager_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Overtime requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS overtime_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        hours DECIMAL(4,2) NOT NULL,
        reason TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        manager_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Payroll table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payroll (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        month VARCHAR(20) NOT NULL,
        year INT NOT NULL,
        base_salary DECIMAL(15, 2) NOT NULL,
        overtime_pay DECIMAL(15, 2) DEFAULT 0,
        deductions DECIMAL(15, 2) DEFAULT 0,
        net_salary DECIMAL(15, 2) NOT NULL,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Audit logs
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default admin
    const [rows]: any = await connection.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Super Admin', 'admin@hris.com', hashedPassword, 'admin']
      );
      console.log("Default admin seeded: admin@hris.com / admin123");
    }

    // Seed default settings
    const [settingsRows]: any = await connection.execute('SELECT id FROM settings LIMIT 1');
    if (settingsRows.length === 0) {
      await connection.execute(
        'INSERT INTO settings (office_lat, office_lng, valid_radius, work_start, work_end) VALUES (?, ?, ?, ?, ?)',
        [-6.2088, 106.8456, 100, '09:00:00', '17:00:00'] // Jakarta default
      );
    }

    connection.release();
    console.log("Database schema initialized for HRIS successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

export default pool;