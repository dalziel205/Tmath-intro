const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const Database = require('../database/db');

// Initialize database connection
const db = new Database();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied' });
    }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Dashboard routes
router.get('/dashboard', isAdmin, (req, res) => {
    res.render('admin/dashboard');
});

// API Routes

// Get dashboard statistics
router.get('/api/stats', isAdmin, async (req, res) => {
    try {
        const stats = await db.getAdminStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get recent activity
router.get('/api/activity', isAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const activities = await db.getRecentActivity(limit);
        res.json({ activities });
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Class Management
router.get('/classes', isAdmin, (req, res) => {
    res.render('admin/classes/index');
});

router.get('/api/classes', isAdmin, async (req, res) => {
    try {
        const classes = await db.getAllClasses();
        res.json({ classes });
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/classes', isAdmin, async (req, res) => {
    try {
        const classData = req.body;
        const result = await db.createClass(classData);
        res.json(result);
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Teacher Management
router.get('/teachers', isAdmin, (req, res) => {
    res.render('admin/teachers/index');
});

router.get('/api/teachers', isAdmin, async (req, res) => {
    try {
        const teachers = await db.getAllTeachers();
        res.json({ teachers });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/teachers', isAdmin, async (req, res) => {
    try {
        const teacherData = req.body;
        const salt = await bcrypt.genSalt(10);
        teacherData.password_hash = await bcrypt.hash(teacherData.password, salt);
        delete teacherData.password;
        
        const result = await db.createTeacher(teacherData);
        res.json(result);
    } catch (error) {
        console.error('Error creating teacher:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Student Management
router.get('/students', isAdmin, (req, res) => {
    res.render('admin/students/index');
});

router.get('/api/students', isAdmin, async (req, res) => {
    try {
        const students = await db.getAllStudents();
        res.json({ students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/students', isAdmin, async (req, res) => {
    try {
        const studentData = req.body;
        const salt = await bcrypt.genSalt(10);
        studentData.password_hash = await bcrypt.hash(studentData.password, salt);
        delete studentData.password;
        
        const result = await db.createStudent(studentData);
        res.json(result);
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Account Management
router.put('/api/accounts/:type/:id/status', isAdmin, async (req, res) => {
    try {
        const { type, id } = req.params;
        const { status } = req.body;
        
        const result = await db.updateAccountStatus(type, id, status);
        res.json(result);
    } catch (error) {
        console.error('Error updating account status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/api/accounts/:type/:id/reset-password', isAdmin, async (req, res) => {
    try {
        const { type, id } = req.params;
        const { newPassword } = req.body;
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);
        
        const result = await db.resetPassword(type, id, password_hash);
        res.json(result);
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Settings
router.get('/settings', isAdmin, (req, res) => {
    res.render('admin/settings');
});

router.put('/api/settings', isAdmin, async (req, res) => {
    try {
        const settings = req.body;
        const result = await db.updateSettings(settings);
        res.json(result);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 