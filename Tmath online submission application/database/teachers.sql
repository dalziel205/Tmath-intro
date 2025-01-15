-- Create teachers table if not exists
CREATE TABLE IF NOT EXISTS teachers (
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
);

-- Add sample teacher data
INSERT INTO teachers (teacher_code, password_hash, full_name, email, department, status)
VALUES 
('teacher1', '$2a$10$rWz6GBN.YB6QiGKmh8g8guYgqDZ7LHp4rZuVFN2Ou3vz0O2jxGEYi', 'Giáo viên 1', 'teacher1@tmath.com', 'Mathematics', 'active'),
('teacher2', '$2a$10$rWz6GBN.YB6QiGKmh8g8guYgqDZ7LHp4rZuVFN2Ou3vz0O2jxGEYi', 'Giáo viên 2', 'teacher2@tmath.com', 'Mathematics', 'active');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teachers_code ON teachers(teacher_code); 