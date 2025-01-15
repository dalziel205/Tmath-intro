const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Database = require('../database/db');

// Initialize database connection
const db = new Database();

// Middleware to check if user is teacher
const isTeacher = (req, res, next) => {
    if (req.session && req.session.userRole === 'teacher') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied' });
    }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/assignments'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.mp4'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Dashboard routes
router.get('/dashboard', isTeacher, (req, res) => {
    res.render('teacher/dashboard');
});

// API Routes

// Get dashboard statistics
router.get('/api/stats', isTeacher, async (req, res) => {
    try {
        const teacherId = req.session.userId;
        const stats = await db.getTeacherStats(teacherId);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching teacher stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Class Management
router.get('/classes', isTeacher, (req, res) => {
    res.render('teacher/classes/index');
});

router.get('/api/classes/active', isTeacher, async (req, res) => {
    try {
        const teacherId = req.session.userId;
        const classes = await db.getTeacherActiveClasses(teacherId);
        res.json({ classes });
    } catch (error) {
        console.error('Error fetching active classes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/classes', isTeacher, async (req, res) => {
    try {
        const teacherId = req.session.userId;
        const classData = { ...req.body, teacher_id: teacherId };
        const result = await db.createClass(classData);
        res.json(result);
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Assignment Management
router.get('/assignments', isTeacher, (req, res) => {
    res.render('teacher/assignments/index');
});

router.get('/api/assignments/upcoming', isTeacher, async (req, res) => {
    try {
        const teacherId = req.session.userId;
        const deadlines = await db.getUpcomingDeadlines(teacherId);
        res.json({ deadlines });
    } catch (error) {
        console.error('Error fetching upcoming deadlines:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/assignments', isTeacher, async (req, res) => {
    try {
        const teacherId = req.session.userId;
        const assignmentData = { ...req.body, teacher_id: teacherId };
        const result = await db.createAssignment(assignmentData);
        res.json(result);
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Submission Management
router.get('/submissions', isTeacher, (req, res) => {
    res.render('teacher/submissions/index');
});

router.get('/api/submissions/recent', isTeacher, async (req, res) => {
    try {
        const teacherId = req.session.userId;
        const submissions = await db.getRecentSubmissions(teacherId);
        res.json({ submissions });
    } catch (error) {
        console.error('Error fetching recent submissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/submissions/:id/grade', isTeacher, async (req, res) => {
    try {
        const submissionId = req.params.id;
        const submission = await db.getSubmissionDetails(submissionId);
        res.render('teacher/submissions/grade', { submission });
    } catch (error) {
        console.error('Error fetching submission details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/submissions/:id/grade', isTeacher, async (req, res) => {
    try {
        const submissionId = req.params.id;
        const teacherId = req.session.userId;
        const gradeData = {
            ...req.body,
            graded_by: teacherId,
            graded_at: new Date().toISOString()
        };
        const result = await db.gradeSubmission(submissionId, gradeData);
        res.json(result);
    } catch (error) {
        console.error('Error grading submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Student Management
router.get('/students', isTeacher, (req, res) => {
    res.render('teacher/students/index');
});

router.get('/api/students', isTeacher, async (req, res) => {
    try {
        const teacherId = req.session.userId;
        const students = await db.getTeacherStudents(teacherId);
        res.json({ students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Profile Management
router.get('/profile', isTeacher, (req, res) => {
    res.render('teacher/profile');
});

router.put('/api/profile', isTeacher, async (req, res) => {
    try {
        const teacherId = req.session.userId;
        const profileData = req.body;
        const result = await db.updateTeacherProfile(teacherId, profileData);
        res.json(result);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 