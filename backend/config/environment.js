// ============ ENVIRONMENT CONFIGURATION ============
// Centralized environment variables validation and configuration

require('dotenv').config();

const environment = {
    // Server
    port: parseInt(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Database
    db: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT) || 5432,
    },
    
    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'default_secret_key_change_this',
        expiresIn: process.env.JWT_EXPIRE || '7d',
    },
    
    // File Upload
    upload: {
        maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        path: process.env.UPLOAD_PATH || './uploads',
    },
    
    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },
    
    // Email
    email: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM,
    },
    
    // Frontend URL
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

// Validate required environment variables
const requiredEnv = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missingEnv.join(', ')}`);
}

module.exports = environment;