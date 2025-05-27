const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(app.getPath('userData'), 'domekin.db');
  }

  // Initialize database connection and create tables
  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  // Create necessary tables
  async createTables() {
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kegiatan_harian TEXT NOT NULL,
        klasifikasi_tugas TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createSchedulesTable = `
      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER,
        scheduled_date DATE NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
      )
    `;

    const createHolidaysTable = `
      CREATE TABLE IF NOT EXISTS holidays (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL UNIQUE,
        name TEXT NOT NULL,
        year INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(createTasksTable);
        this.db.run(createSchedulesTable);
        this.db.run(createHolidaysTable, (err) => {
          if (err) {
            reject(err);
          } else {
            // Insert default Indonesian holidays for current year
            this.insertDefaultHolidays()
              .then(() => resolve())
              .catch(reject);
          }
        });
      });
    });
  }

  // Insert default Indonesian holidays
  async insertDefaultHolidays() {
    const currentYear = new Date().getFullYear();
    const holidays = [
      { date: `${currentYear}-01-01`, name: 'Tahun Baru Masehi' },
      { date: `${currentYear}-02-10`, name: 'Tahun Baru Imlek' },
      { date: `${currentYear}-03-11`, name: 'Hari Raya Nyepi' },
      { date: `${currentYear}-03-29`, name: 'Wafat Isa Almasih' },
      { date: `${currentYear}-04-10`, name: 'Hari Raya Idul Fitri' },
      { date: `${currentYear}-04-11`, name: 'Hari Raya Idul Fitri' },
      { date: `${currentYear}-05-01`, name: 'Hari Buruh Internasional' },
      { date: `${currentYear}-05-09`, name: 'Kenaikan Isa Almasih' },
      { date: `${currentYear}-05-29`, name: 'Hari Raya Waisak' },
      { date: `${currentYear}-06-01`, name: 'Hari Lahir Pancasila' },
      { date: `${currentYear}-06-17`, name: 'Hari Raya Idul Adha' },
      { date: `${currentYear}-07-07`, name: 'Tahun Baru Islam' },
      { date: `${currentYear}-08-17`, name: 'Hari Kemerdekaan Indonesia' },
      { date: `${currentYear}-09-16`, name: 'Maulid Nabi Muhammad SAW' },
      { date: `${currentYear}-12-25`, name: 'Hari Raya Natal' }
    ];

    const insertHoliday = `
      INSERT OR IGNORE INTO holidays (date, name, year) 
      VALUES (?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(insertHoliday);
      
      holidays.forEach(holiday => {
        stmt.run(holiday.date, holiday.name, currentYear);
      });
      
      stmt.finalize((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Task operations
  async getAllTasks() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM tasks ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async addTask(kegiatanHarian, klasifikasiTugas) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO tasks (kegiatan_harian, klasifikasi_tugas) 
        VALUES (?, ?)
      `);
      
      stmt.run(kegiatanHarian, klasifikasiTugas, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
      
      stmt.finalize();
    });
  }

  async updateTask(id, kegiatanHarian, klasifikasiTugas) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        UPDATE tasks 
        SET kegiatan_harian = ?, klasifikasi_tugas = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      
      stmt.run(kegiatanHarian, klasifikasiTugas, id, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
      
      stmt.finalize();
    });
  }

  async deleteTask(id) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
      
      stmt.run(id, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
      
      stmt.finalize();
    });
  }

  // Schedule operations
  async getSchedule(month, year) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT s.*, t.kegiatan_harian, t.klasifikasi_tugas 
        FROM schedules s 
        JOIN tasks t ON s.task_id = t.id 
        WHERE s.month = ? AND s.year = ?
        ORDER BY s.scheduled_date
      `;
      
      this.db.all(query, [month, year], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async saveSchedule(scheduleItems) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        const deleteStmt = this.db.prepare(`
          DELETE FROM schedules 
          WHERE month = ? AND year = ?
        `);
        
        const insertStmt = this.db.prepare(`
          INSERT INTO schedules (task_id, scheduled_date, month, year) 
          VALUES (?, ?, ?, ?)
        `);
        
        try {
          // Clear existing schedule for the month/year
          if (scheduleItems.length > 0) {
            const firstItem = scheduleItems[0];
            const date = new Date(firstItem.scheduled_date);
            deleteStmt.run(date.getMonth() + 1, date.getFullYear());
          }
          
          // Insert new schedule items
          scheduleItems.forEach(item => {
            const date = new Date(item.scheduled_date);
            insertStmt.run(
              item.task_id,
              item.scheduled_date,
              date.getMonth() + 1,
              date.getFullYear()
            );
          });
          
          this.db.run('COMMIT', (err) => {
            if (err) {
              reject(err);
            } else {
              resolve({ success: true });
            }
          });
        } catch (error) {
          this.db.run('ROLLBACK');
          reject(error);
        } finally {
          deleteStmt.finalize();
          insertStmt.finalize();
        }
      });
    });
  }

  async clearSchedule(month, year) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        DELETE FROM schedules 
        WHERE month = ? AND year = ?
      `);
      
      stmt.run(month, year, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
      
      stmt.finalize();
    });
  }

  // Holiday operations
  async getHolidays(year) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM holidays WHERE year = ? ORDER BY date',
        [year],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = Database;
