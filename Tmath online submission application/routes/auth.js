const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Database = require('../database/db');

const db = new Database();

// Teacher login endpoint
router.post('/teacher/login', async (req, res) => {
    const { teacher_code, password } = req.body;

    if (!teacher_code || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const teacher = await db.verifyTeacherLogin(teacher_code, password);
        if (teacher) {
            // Check if admin account
            const redirectUrl = teacher_code === 'admin' 
                ? '/admin/dashboard'
                : '/teacher/dashboard';
            
            res.json({
                success: true,
                teacher,
                redirect: redirectUrl
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Student login endpoint
router.post('/student/login', async (req, res) => {
    const { student_code, password } = req.body;

    if (!student_code || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const student = await db.verifyStudentLogin(student_code, password);
        if (student) {
            res.json({
                success: true,
                student,
                redirect: '/student/dashboard'
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Password change endpoints
router.put('/teacher/password', async (req, res) => {
    const { teacher_code, current_password, new_password } = req.body;

    if (!teacher_code || !current_password || !new_password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const teacher = await db.verifyTeacherLogin(teacher_code, current_password);
        if (!teacher) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(new_password, salt);
        
        await db.updateTeacherPassword(teacher_code, hash);
        res.json({ success: true });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/student/password', async (req, res) => {
    const { student_code, current_password, new_password } = req.body;

    if (!student_code || !current_password || !new_password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const student = await db.verifyStudentLogin(student_code, current_password);
        if (!student) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(new_password, salt);
        
        await db.updateStudentPassword(student_code, hash);
        res.json({ success: true });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 