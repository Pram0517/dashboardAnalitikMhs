// BACKEND/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

console.log('🔧 Database Configuration:');
console.log('  DB_HOST:', process.env.DB_HOST || '❌ Not set');
console.log('  DB_PORT:', process.env.DB_PORT || '❌ Not set');
console.log('  DB_NAME:', process.env.DB_NAME || '❌ Not set');
console.log('  DB_USER:', process.env.DB_USER || '❌ Not set');
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ Not set');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');

// Gunakan DATABASE_URL jika ada, atau fallback ke variabel terpisah
let poolConfig;

if (process.env.DATABASE_URL) {
  console.log('📌 Using DATABASE_URL');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
} else {
  console.log('📌 Using individual DB_ variables');
  poolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
}

const pool = new Pool(poolConfig);

// Test connection immediately
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:');
    console.error('  Error message:', err.message);
    console.error('  Error code:', err.code);
    console.error('  Error detail:', err.detail);
    console.error('  Config used:', {
      host: poolConfig.host || poolConfig.connectionString,
      database: poolConfig.database || 'from connection string',
      user: poolConfig.user || 'from connection string',
    });
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  }
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

module.exports = pool;