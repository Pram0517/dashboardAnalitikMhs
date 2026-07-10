// backend/test-connection.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres:Pramudin.0517@dthsrsikbqlxblajbbgh.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
});

async function testConnection() {
    console.log('🔄 Testing Supabase connection...');
    console.log('📊 Host: dthsrsikbqlxblajbbgh.supabase.co');
    console.log('📊 Port: 5432');
    console.log('📊 Database: postgres');
    console.log('📊 User: postgres');
    console.log('='.repeat(50));

    try {
        const client = await pool.connect();
        console.log('✅ Connected successfully!');
        
        const result = await client.query('SELECT NOW() as time, version() as version');
        console.log('📊 Server time:', result.rows[0].time);
        console.log('📊 PostgreSQL version:', result.rows[0].version);
        
        client.release();
        await pool.end();
        console.log('✅ Test completed!');
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        console.error('📋 Error code:', err.code);
        console.error('📋 Error detail:', err.detail || 'No detail');
        
        if (err.code === 'ETIMEDOUT') {
            console.log('\n⚠️ TROUBLESHOOTING:');
            console.log('1. Periksa koneksi internet Anda');
            console.log('2. Tambahkan IP Anda di Supabase Network Restrictions');
            console.log('3. Coba gunakan port 6543 (Transaction Pooler)');
            console.log('4. Periksa firewall/proxy settings');
        }
        
        if (err.code === '28P01') {
            console.log('\n⚠️ Password salah. Periksa kembali password Supabase Anda.');
        }
    }
}

testConnection();