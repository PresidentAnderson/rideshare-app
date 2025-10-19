const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase admin client for all backend operations (service role key)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Use the same client for both since we're using service key
const supabaseClient = supabaseAdmin;

module.exports = {
  supabaseClient,
  supabaseAdmin
};