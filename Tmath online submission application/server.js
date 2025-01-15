const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/auth/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'auth', 'login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'dashboard.html'));
});

app.get('/teacher/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'teacher', 'dashboard.html'));
});

app.get('/student/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'student', 'dashboard.html'));
});

// API routes
app.use('/api', authRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 