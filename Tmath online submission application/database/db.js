const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, 'data', 'tmath.db'), (err) => {
            if (err) {
                console.error('Database connection error:', err);
            } else {
                console.log('Connected to database');
                this.init();
            }
        });
    }

    init() {
        // Create tables if they don't exist
        this.db.serialize(() => {
            // Teachers table
            this.db.run(`CREATE TABLE IF NOT EXISTS teachers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                teacher_code VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE,
                phone VARCHAR(20),
                department VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'))
            )`);

            // Students table
            this.db.run(`CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_code VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE,
                class_name VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'))
            )`);

            // Create admin account if it doesn't exist
            const salt = bcrypt.genSaltSync(10);
            const adminPassword = bcrypt.hashSync('admin', salt);
            this.db.run(`INSERT OR IGNORE INTO teachers (teacher_code, password_hash, full_name, email, department, status) 
                        VALUES ('admin', ?, 'Administrator', 'admin@tmath.com', 'Admin', 'active')`, 
                        [adminPassword]);
        });
    }

    verifyTeacherLogin(teacher_code, password) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM teachers WHERE teacher_code = ? AND status = "active"', [teacher_code], (err, teacher) => {
                if (err) return reject(err);
                if (!teacher) return resolve(null);
                
                const valid = bcrypt.compareSync(password, teacher.password_hash);
                if (valid) {
                    // Update last login time
                    this.db.run('UPDATE teachers SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [teacher.id]);
                    // Don't send password hash to client
                    delete teacher.password_hash;
                }
                resolve(valid ? teacher : null);
            });
        });
    }

    verifyStudentLogin(student_code, password) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM students WHERE student_code = ? AND status = "active"', [student_code], (err, student) => {
                if (err) return reject(err);
                if (!student) return resolve(null);
                
                const valid = bcrypt.compareSync(password, student.password_hash);
                if (valid) {
                    // Update last login time
                    this.db.run('UPDATE students SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [student.id]);
                    // Don't send password hash to client
                    delete student.password_hash;
                }
                resolve(valid ? student : null);
            });
        });
    }

    updateTeacherPassword(teacher_code, hashedPassword) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE teachers SET password_hash = ? WHERE teacher_code = ?', 
                [hashedPassword, teacher_code], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    updateStudentPassword(student_code, hashedPassword) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE students SET password_hash = ? WHERE student_code = ?', 
                [hashedPassword, student_code], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}

module.exports = Database; 