// backend/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseKhsUrl = process.env.SUPABASE_KHS_URL;
const supabaseKhsServiceKey = process.env.SUPABASE_KHS_SERVICE_KEY;

if (!supabaseKhsUrl || !supabaseKhsServiceKey) {
  console.error('❌ Missing Supabase KHS environment variables');
  console.error('SUPABASE_KHS_URL:', supabaseKhsUrl ? '✓ Set' : '✗ Missing');
  console.error('SUPABASE_KHS_SERVICE_KEY:', supabaseKhsServiceKey ? '✓ Set' : '✗ Missing');
}

const supabaseKhs = createClient(supabaseKhsUrl, supabaseKhsServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test connection
(async () => {
  try {
    const { data, error } = await supabaseKhs
      .from('mhs_khs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
    } else {
      console.log('✅ Supabase KHS client initialized and connected');
      if (data && data.length > 0) {
        console.log('📋 Sample column names:', Object.keys(data[0]).join(', '));
      }
    }
  } catch (error) {
    console.error('❌ Supabase connection test error:', error.message);
  }
})();

module.exports = { supabaseKhs };