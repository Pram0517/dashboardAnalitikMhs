// BACKEND/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

console.log('🔧 Database Configuration:');
console.log('  DB_HOST:', process.env.DB_HOST || '❌ Not set');
console.log('  DB_NAME:', process.env.DB_NAME || '❌ Not set');
console.log('  DB_USER:', process.env.DB_USER || '❌ Not set');
console.log('  DB_PORT:', process.env.DB_PORT || '❌ Not set');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');

// Gunakan DATABASE_URL jika ada (dari Railway PostgreSQL)
if (process.env.DATABASE_URL) {
  console.log('📌 Using DATABASE_URL');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
    } else {
      console.log('✅ Database connected at:', res.rows[0].now);
    }
  });

  module.exports = pool;
} else {
  // Gunakan individual variables
  console.log('📌 Using individual DB_ variables');
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
    } else {
      console.log('✅ Database connected at:', res.rows[0].now);
    }
  });

  module.exports = pool;
}