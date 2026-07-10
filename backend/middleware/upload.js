const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Buat folder uploads jika belum ada
const uploadDirs = ['documents', 'profiles', 'reports'];
uploadDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '../uploads', dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// Konfigurasi storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'documents';
        if (file.fieldname === 'profile') folder = 'profiles';
        if (file.fieldname === 'report') folder = 'reports';
        cb(null, path.join(__dirname, '../uploads', folder));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `khs-${req.user?.nim || 'unknown'}-${uniqueSuffix}${ext}`);
    }
});

// Filter file
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.pdf')) {
        cb(null, true);
    } else {
        cb(new Error('Tipe file tidak diizinkan. Hanya PDF, JPG, PNG, dan Excel.'), false);
    }
};

// Konfigurasi upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Middleware untuk single file
const uploadSingle = (fieldName) => upload.single(fieldName);

// Middleware untuk multiple files
const uploadMultiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple
};