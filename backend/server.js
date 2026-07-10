const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http'); // ← TAMBAHKAN INI
const { Server } = require('socket.io'); // ← TAMBAHKAN INI
require('dotenv').config();
const pool = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const mahasiswaRoutes = require('./routes/mahasiswa');
const dosenRoutes = require('./routes/dosen');
const skripsiRoutes = require('./routes/skripsi');
const evaluasiRoutes = require('./routes/evaluasi');
const kurikulumRoutes = require('./routes/kurikulum');
const uploadRoutes = require('./routes/upload');
const capstoneRoutes = require('./routes/capstone');
const userRoutes = require('./routes/user');
const exportRoutes = require('./routes/export');
const notificationRoutes = require('./routes/notification');
const nilaiRoutes = require('./routes/nilai');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true
    }
});

// ============ SOCKET.IO ============
// Map untuk menyimpan koneksi user
const userSockets = new Map();

io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Register user
    socket.on('register', (userId) => {
        if (userId) {
            userSockets.set(userId, socket.id);
            console.log(`👤 User ${userId} registered with socket ${socket.id}`);
        }
    });

    // Join room untuk user
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`📢 User ${userId} joined room user_${userId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                break;
            }
        }
    });
});

// ============ FUNGSI SEND NOTIFICATION ============
const sendNotification = async(userId, title, message, type = 'info', link = null) => {
    try {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, link)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`, [userId, type, title, message, link]
        );

        const notification = result.rows[0];

        const socketId = userSockets.get(userId);
        if (socketId) {
            io.to(socketId).emit('notification', notification);
            io.to(`user_${userId}`).emit('notification', notification);
        }

        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};

// Export io dan sendNotification untuk digunakan di controller lain
module.exports = { app, server, io, sendNotification };

// ============ MIDDLEWARE ============
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ TEST DATABASE ============
app.get('/api/health', async(req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'OK', database: 'Connected', timestamp: result.rows[0] });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

// ============ WELCOME ROUTE ============
app.get('/', (req, res) => {
    res.json({
        name: 'Dashboard Analitik Mahasiswa API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            dashboard: '/api/dashboard',
            mahasiswa: '/api/mahasiswa',
            dosen: '/api/dosen',
            skripsi: '/api/skripsi',
            evaluasi: '/api/evaluasi',
            kurikulum: '/api/kurikulum',
            upload: '/api/upload',
            capstone: '/api/capstone',
            user: '/api/user',
            export: '/api/export',
            notifications: '/api/notifications' // ← TAMBAHKAN INI
        }
    });
});

// ============ ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/dosen', dosenRoutes);
app.use('/api/skripsi', skripsiRoutes);
app.use('/api/evaluasi', evaluasiRoutes);
app.use('/api/kurikulum', kurikulumRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/capstone', capstoneRoutes);
app.use('/api/user', userRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/nilai', nilaiRoutes);

// ============ 404 HANDLER ============
app.use((req, res) => {
    res.status(404).json({
        status: 'Error',
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// ============ ERROR HANDLER ============
app.use(errorHandler);

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
    console.log(`🔌 Socket.IO running on port ${PORT}`);
});