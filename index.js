const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv       = require('dotenv');

dotenv.config();

require('./src/config/db');
 
const app = express();

// --- 1. GLOBAL MIDDLEWARE ---
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000', 
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --- 2. IMPORT ROUTES ---

// SuperAdmin & Admin
const superAdminRoutes = require('./src/superadmin/routes/superAdminRoutes');
const authRoutes = require('./src/superadmin/routes/authRoutes');
const superAdminInstituteRoutes = require('./src/superadmin/routes/instituteRoutes');
const adminAuthRoutes = require('./src/instituteadmin/routes/authRoutes');
const attendanceRoutes = require('./src/instituteadmin/routes/attendanceRoutes'); 
const adminFacultyRoutes = require('./src/instituteadmin/routes/facultyRoutes');
const studentRoutes = require('./src/instituteadmin/routes/studentRoutes');
const academicRoutes = require('./src/instituteadmin/routes/academicRoutes');
const adminExamRoutes = require('./src/instituteadmin/routes/examRoutes'); // 🎯 Renamed to adminExamRoutes
const batchRoutes = require('./src/instituteadmin/routes/batchRoutes');
const expenseRoutes = require('./src/instituteadmin/routes/expenseRoutes');
const salaryRoutes = require('./src/instituteadmin/routes/salaryRoutes');
const feeRoutes = require('./src/instituteadmin/routes/feeRoutes');
const notificationRoutes = require('./src/instituteadmin/routes/notificationRoutes');
const reportRoutes = require('./src/instituteadmin/routes/reportRoutes');
const settingRoutes = require('./src/instituteadmin/routes/settingRoutes');

// Faculty Portal
const facultyAuthRoutes = require('./src/faculty/routes/authRoutes');
const profileRoutes = require('./src/faculty/routes/profileRoutes');
const facultyClassRoutes = require('./src/faculty/routes/classRoutes');
const attendanceRoute = require('./src/faculty/routes/attendanceRoute');
const facultyRoutes = require('./src/faculty/routes/facultyRoutes'); 
const facultyExamRoutes = require('./src/faculty/routes/examRoutes'); // 🎯 Uncommented and renamed!

// --- 3. MOUNT ROUTES ---

// Admin/SuperAdmin Mounting
app.use('/api/superadmin/auth', authRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/superadmin/institutes', superAdminInstituteRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/attendance', attendanceRoutes);
app.use('/api/admin/faculty', adminFacultyRoutes);
app.use('/api/admin/students', studentRoutes);
app.use('/api/admin', academicRoutes);
app.use('/api/admin/batches', batchRoutes);
app.use('/api/admin/expenses', expenseRoutes);
app.use('/api/admin/salary', salaryRoutes);
app.use('/api/admin/fees', feeRoutes);
app.use('/api/admin/notification', notificationRoutes);
app.use('/api/admin/report', reportRoutes);
app.use('/api/admin/settings', settingRoutes);
app.use('/api/admin/exams', adminExamRoutes); // 🎯 Updated to use admin variable

// Faculty Mounting
app.use('/api/faculty/auth', facultyAuthRoutes);
app.use('/api/faculty/profile', profileRoutes);
app.use('/api/faculty/classes', facultyClassRoutes); 
app.use('/api/faculty/attendance', attendanceRoute);
app.use('/api/faculty', facultyRoutes);
app.use('/api/faculty/exams', facultyExamRoutes); // 🎯 Uncommented, fixed variable, and made it PLURAL (/exams)


// --- 4. UTILITY ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success:     true,
    message:     'LMS API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp:   new Date().toISOString(),
  });
});

// 404 Route Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// --- 5. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nServer successfully launched on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database connected to: institute_db\n`);
})