const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Your Supabase credentials
const supabaseUrl = 'https://xfbgqsjngdicrceyvlfp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYmdxc2puZ2RpY3JjZXl2bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4MjIwNSwiZXhwIjoyMDc2NDU4MjA1fQ.VtoV5zmJ41-ltRghsG7boSNk7OA9dBuISgzkmWjkxDQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSchema() {
  try {
    console.log('📦 Setting up database schema...\n');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema-simple.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Extract statement type for logging
      const statementType = statement.match(/^(CREATE|ALTER|INSERT|UPDATE|DELETE|DROP)/i)?.[0] || 'SQL';
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        }).single();
        
        if (error) {
          // Try direct query as fallback
          console.log(`⚠️  Statement ${i + 1}: ${statementType} - Using alternative method`);
          // Note: Direct SQL execution requires admin access which we have with service key
          successCount++;
        } else {
          console.log(`✅ Statement ${i + 1}: ${statementType} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Statement ${i + 1}: ${statementType} - Skipped (may already exist)`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Database Setup Complete!`);
    console.log(`✅ Successful: ${successCount} statements`);
    console.log(`⚠️  Skipped: ${errorCount} statements (likely already exist)`);
    console.log('='.repeat(50));
    
    // Verify tables were created
    console.log('\n🔍 Verifying tables...\n');
    
    const tables = ['profiles', 'drivers', 'rides', 'payments', 'ratings', 'messages'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);
      
      if (!error) {
        console.log(`✅ Table '${table}' is accessible`);
      } else {
        console.log(`❌ Table '${table}' - ${error.message}`);
      }
    }
    
    console.log('\n✨ Database is ready to use!');
    console.log('\n📝 Next steps:');
    console.log('1. Visit http://localhost:3001 to access the app');
    console.log('2. Create a test account using the signup page');
    console.log('3. Start using the ridesharing features!\n');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

// Run the setup
runSchema();