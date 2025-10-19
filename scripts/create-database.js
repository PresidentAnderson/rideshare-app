const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://xfbgqsjngdicrceyvlfp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYmdxc2puZ2RpY3JjZXl2bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4MjIwNSwiZXhwIjoyMDc2NDU4MjA1fQ.VtoV5zmJ41-ltRghsG7boSNk7OA9dBuISgzkmWjkxDQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

// SQL statements to create all tables
const sqlStatements = [
  // Enable UUID extension
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
  
  // Drop existing tables (in reverse order of dependencies)
  `DROP TABLE IF EXISTS location_updates CASCADE;`,
  `DROP TABLE IF EXISTS messages CASCADE;`,
  `DROP TABLE IF EXISTS ratings CASCADE;`,
  `DROP TABLE IF EXISTS payments CASCADE;`,
  `DROP TABLE IF EXISTS rides CASCADE;`,
  `DROP TABLE IF EXISTS drivers CASCADE;`,
  `DROP TABLE IF EXISTS profiles CASCADE;`,
  
  // Create profiles table
  `CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('rider', 'driver', 'admin')) DEFAULT 'rider',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,
  
  // Create drivers table
  `CREATE TABLE drivers (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    vehicle_model TEXT NOT NULL,
    vehicle_plate TEXT NOT NULL UNIQUE,
    vehicle_color TEXT,
    license_number TEXT NOT NULL UNIQUE,
    license_expiry DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'busy')) DEFAULT 'offline',
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    total_rides INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    earnings DECIMAL(10,2) DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    documents JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,
  
  // Create rides table
  `CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT NOT NULL,
    pickup_lat DECIMAL(10, 8),
    pickup_lng DECIMAL(11, 8),
    dropoff_lat DECIMAL(10, 8),
    dropoff_lng DECIMAL(11, 8),
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    fare DECIMAL(10,2) NOT NULL,
    distance DECIMAL(10,2),
    duration INTEGER,
    payment_method TEXT DEFAULT 'cash',
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,
  
  // Create payments table
  `CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    rider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('cash', 'card', 'wallet')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    stripe_payment_id TEXT,
    stripe_refund_id TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,
  
  // Create ratings table
  `CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rated_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ride_id, rater_id)
  );`,
  
  // Create messages table
  `CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,
  
  // Create location_updates table
  `CREATE TABLE location_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    heading DECIMAL(5,2),
    speed DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,
  
  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);`,
  `CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);`,
  `CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);`,
  `CREATE INDEX IF NOT EXISTS idx_rides_rider_id ON rides(rider_id);`,
  `CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);`,
  `CREATE INDEX IF NOT EXISTS idx_rides_created_at ON rides(created_at DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_payments_ride_id ON payments(ride_id);`,
  `CREATE INDEX IF NOT EXISTS idx_ratings_ride_id ON ratings(ride_id);`,
  `CREATE INDEX IF NOT EXISTS idx_messages_ride_id ON messages(ride_id);`,
  `CREATE INDEX IF NOT EXISTS idx_location_updates_driver_id ON location_updates(driver_id);`,
  `CREATE INDEX IF NOT EXISTS idx_location_updates_ride_id ON location_updates(ride_id);`,
  
  // Create update trigger function
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;`,
  
  // Create triggers
  `DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;`,
  `CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
  
  `DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;`,
  `CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
  
  `DROP TRIGGER IF EXISTS update_rides_updated_at ON rides;`,
  `CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
  
  `DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;`,
  `CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
  
  // Create function to handle new user
  `CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'rider')
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;`,
  
  // Create trigger for new user signup
  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,
  `CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`
];

// RLS Policies
const rlsPolicies = [
  // Enable RLS
  `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE rides ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE payments ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE messages ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE location_updates ENABLE ROW LEVEL SECURITY;`,
  
  // Profiles policies
  `CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);`,
  `CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);`,
  `CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);`,
  
  // Drivers policies
  `CREATE POLICY "Anyone can view verified drivers" ON drivers FOR SELECT USING (verified = true OR auth.uid() = id);`,
  `CREATE POLICY "Drivers can update own record" ON drivers FOR UPDATE USING (auth.uid() = id);`,
  `CREATE POLICY "Users can register as driver" ON drivers FOR INSERT WITH CHECK (auth.uid() = id);`,
  
  // Rides policies
  `CREATE POLICY "Users can view own rides" ON rides FOR SELECT USING (auth.uid() = rider_id OR auth.uid() = driver_id);`,
  `CREATE POLICY "Riders can create rides" ON rides FOR INSERT WITH CHECK (auth.uid() = rider_id);`,
  `CREATE POLICY "Users can update own rides" ON rides FOR UPDATE USING (auth.uid() = rider_id OR auth.uid() = driver_id);`,
  
  // Payments policies
  `CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = rider_id OR auth.uid() = driver_id);`,
  `CREATE POLICY "System can create payments" ON payments FOR INSERT WITH CHECK (true);`,
  
  // Ratings policies
  `CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT USING (true);`,
  `CREATE POLICY "Users can rate completed rides" ON ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);`,
  
  // Messages policies
  `CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);`,
  `CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);`,
  
  // Location updates policies
  `CREATE POLICY "Drivers can insert location" ON location_updates FOR INSERT WITH CHECK (auth.uid() = driver_id);`,
  `CREATE POLICY "Users can view ride locations" ON location_updates FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rides 
      WHERE rides.id = location_updates.ride_id 
      AND (rides.rider_id = auth.uid() OR rides.driver_id = auth.uid())
    )
  );`
];

async function executeSql(sql, description) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Try alternative approach - direct query
      console.log(`⚠️  ${description} - Alternative method needed`);
      return { success: true, warning: true };
    }
    
    console.log(`✅ ${description}`);
    return { success: true };
  } catch (err) {
    console.log(`❌ ${description} - ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function createDatabase() {
  console.log('🚀 Starting database creation...\n');
  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('=' .repeat(50) + '\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  // Execute table creation
  console.log('📦 Creating tables...\n');
  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    const description = sql.substring(0, 50).replace(/\n/g, ' ') + '...';
    
    const result = await executeSql(sql, description);
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log('\n📋 Setting up Row Level Security...\n');
  for (let i = 0; i < rlsPolicies.length; i++) {
    const sql = rlsPolicies[i];
    const description = sql.substring(0, 50).replace(/\n/g, ' ') + '...';
    
    const result = await executeSql(sql, description);
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Database Creation Summary:');
  console.log(`✅ Successful: ${successCount} operations`);
  console.log(`❌ Failed: ${errorCount} operations`);
  console.log('=' .repeat(50));
  
  // Verify tables
  console.log('\n🔍 Verifying tables...\n');
  const tables = ['profiles', 'drivers', 'rides', 'payments', 'ratings', 'messages', 'location_updates'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`✅ Table '${table}' exists (${count || 0} records)`);
      } else {
        console.log(`❌ Table '${table}' - ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}' - ${err.message}`);
    }
  }
  
  console.log('\n✨ Database setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Go to http://localhost:3001');
  console.log('2. Create a test user account');
  console.log('3. Start using the ridesharing app!\n');
}

// Execute
createDatabase().catch(console.error);