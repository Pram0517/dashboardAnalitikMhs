const fs = require('fs');
const path = require('path');

// Buat folder logs jika belum ada
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Fungsi log dengan level
const logger = {
    // Log akses
    access: (req, res, next) => {
        const start = Date.now();
        const timestamp = new Date().toISOString();
        const { method, originalUrl, ip } = req;

        res.on('finish', () => {
            const duration = Date.now() - start;
            const log = `[${timestamp}] ${method} ${originalUrl} ${res.statusCode} ${duration}ms - IP: ${ip}\n`;
            
            // Tulis ke file
            const logFile = path.join(logsDir, `access-${new Date().toISOString().split('T')[0]}.log`);
            fs.appendFileSync(logFile, log);
            
            // Tampilkan di console (development)
            console.log(log.trim());
        });

        next();
    },

    // Log error
    error: (error, req, res, next) => {
        const timestamp = new Date().toISOString();
        const log = `[${timestamp}] ERROR: ${error.message}\n${error.stack}\n\n`;
        
        const logFile = path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, log);
        
        // Juga tampilkan di console
        console.error(log);
        
        next(error);
    },

    // Log auth events
    auth: (message, user = 'anonymous') => {
        const timestamp = new Date().toISOString();
        const log = `[${timestamp}] AUTH: ${message} - User: ${user}\n`;
        
        const logFile = path.join(logsDir, `auth-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, log);
    },
};

module.exports = logger;