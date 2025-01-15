const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Database = require('../database/db');

// Initialize database connection
const db = new Database();

// Middleware to check if user is student
const isStudent = (req, res, next) => {
    if (req.session && req.session.userRole === 'student') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied' });
    }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/submissions'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
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
router.get('/dashboard', isStudent, (req, res) => {
    res.render('student/dashboard');
});

// API Routes

// Get dashboard statistics
router.get('/api/stats', isStudent, async (req, res) => {
    try {
        const studentId = req.session.userId;
        const stats = await db.getStudentStats(studentId);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching student stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Class Management
router.get('/classes', isStudent, (req, res) => {
    res.render('student/classes/index');
});

router.get('/api/classes/enrolled', isStudent, async (req, res) => {
    try {
        const studentId = req.session.userId;
        const classes = await db.getStudentEnrolledClasses(studentId);
        res.json({ classes });
    } catch (error) {
        console.error('Error fetching enrolled classes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/classes/available', isStudent, async (req, res) => {
    try {
        const studentId = req.session.userId;
        const classes = await db.getAvailableClasses(studentId);
        res.json({ classes });
    } catch (error) {
        console.error('Error fetching available classes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/classes/enroll', isStudent, async (req, res) => {
    try {
        const studentId = req.session.userId;
        const { classId } = req.body;
        const result = await db.enrollInClass(studentId, classId);
        res.json(result);
    } catch (error) {
        console.error('Error enrolling in class:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Assignment Management
router.get('/assignments', isStudent, (req, res) => {
    res.render('student/assignments/index');
});

router.get('/api/assignments/upcoming', isStudent, async (req, res) => {
    try {
        const studentId = req.session.userId;
        const assignments = await db.getUpcomingAssignments(studentId);
        res.json({ assignments });
    } catch (error) {
        console.error('Error fetching upcoming assignments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/assignments/:id/submit', isStudent, async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const assignment = await db.getAssignmentDetails(assignmentId);
        res.render('student/assignments/submit', { assignment });
    } catch (error) {
        console.error('Error fetching assignment details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/assignments/:id/submit', isStudent, upload.single('file'), async (req, res) => {
    try {
        const studentId = req.session.userId;
        const assignmentId = req.params.id;
        const submissionData = {
            student_id: studentId,
            assignment_id: assignmentId,
            file_path: req.file.path,
            file_name: req.file.originalname,
            file_type: path.extname(req.file.originalname).toLowerCase(),
            file_size: req.file.size,
            submitted_at: new Date().toISOString()
        };
        const result = await db.createSubmission(submissionData);
        res.json(result);
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Submission Management
router.get('/submissions', isStudent, (req, res) => {
    res.render('student/submissions/index');
});

router.get('/api/submissions', isStudent, async (req, res) => {
    try {
        const studentId = req.session.userId;
        const submissions = await db.getStudentSubmissions(studentId);
        res.json({ submissions });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Grade Management
router.get('/grades', isStudent, (req, res) => {
    res.render('student/grades/index');
});

router.get('/api/grades/recent', isStudent, async (req, res) => {
    try {
        const studentId = req.session.userId;
        const grades = await db.getRecentGrades(studentId);
        res.json({ grades });
    } catch (error) {
        console.error('Error fetching recent grades:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/grades/report', isStudent, async (req, res) => {
    try {
        const studentId = req.session.userId;
        const report = await db.getGradeReport(studentId);
        res.json(report);
    } catch (error) {
        console.error('Error fetching grade report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Profile Management
router.get('/profile', isStudent, (req, res) => {
    res.render('student/profile');
});

router.get('/api/profile', isStudent, async (req, res) => {
    try {
        const studentId = req.session.userId;
        const profile = await db.getStudentProfile(studentId);
        res.json(profile);
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/api/profile', isStudent, async (req, res) => {
    try {
        const studentId = req.session.userId;
        const profileData = req.body;
        const result = await db.updateStudentProfile(studentId, profileData);
        res.json(result);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Schedule Management
router.get('/api/classes/schedule', isStudent, async (req, res) => {
    try {
        const studentId = req.session.userId;
        const schedule = await db.getStudentSchedule(studentId);
        res.json({ schedule });
    } catch (error) {
        console.error('Error fetching class schedule:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 