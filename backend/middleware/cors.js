const corsOptions = require('../config/cors');

// ============ CORS MIDDLEWARE ============
// Untuk mengizinkan akses dari domain tertentu

const corsMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', corsOptions.origin || '*');
    res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
};

module.exports = corsMiddleware;