-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('rider', 'driver', 'admin')) DEFAULT 'rider',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_model TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL UNIQUE,
  vehicle_color TEXT,
  license_number TEXT NOT NULL UNIQUE,
  license_expiry DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'busy')) DEFAULT 'offline',
  current_location GEOGRAPHY(POINT, 4326),
  total_rides INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  earnings DECIMAL(10,2) DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  documents JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_coords GEOGRAPHY(POINT, 4326),
  dropoff_coords GEOGRAPHY(POINT, 4326),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  fare DECIMAL(10,2) NOT NULL,
  distance DECIMAL(10,2),
  duration INTEGER, -- in minutes
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
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
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
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rated_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ride_id, rater_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create location_updates table for real-time tracking
CREATE TABLE IF NOT EXISTS location_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  heading DECIMAL(5,2),
  speed DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_location ON drivers USING GIST(current_location);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_rider_id ON rides(rider_id);
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_created_at ON rides(created_at DESC);
CREATE INDEX idx_payments_ride_id ON payments(ride_id);
CREATE INDEX idx_ratings_ride_id ON ratings(ride_id);
CREATE INDEX idx_messages_ride_id ON messages(ride_id);
CREATE INDEX idx_location_updates_driver_id ON location_updates(driver_id);
CREATE INDEX idx_location_updates_ride_id ON location_updates(ride_id);

-- Create functions
CREATE OR REPLACE FUNCTION calculate_fare(distance_km DECIMAL, base_fare DECIMAL DEFAULT 5.0, per_km_rate DECIMAL DEFAULT 2.0)
RETURNS DECIMAL AS $$
BEGIN
  RETURN base_fare + (distance_km * per_km_rate);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION find_nearest_drivers(pickup_point GEOGRAPHY, radius_meters INTEGER DEFAULT 5000, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(driver_id UUID, distance_meters DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    ST_Distance(d.current_location, pickup_point)::DECIMAL AS distance_meters
  FROM drivers d
  WHERE 
    d.status = 'online' AND
    d.verified = TRUE AND
    ST_DWithin(d.current_location, pickup_point, radius_meters)
  ORDER BY ST_Distance(d.current_location, pickup_point)
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Drivers policies
CREATE POLICY "Drivers can view their own driver profile" ON drivers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Drivers can update their own driver profile" ON drivers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Riders can view verified drivers" ON drivers
  FOR SELECT USING (verified = TRUE);

-- Rides policies
CREATE POLICY "Users can view their own rides" ON rides
  FOR SELECT USING (auth.uid() = rider_id OR auth.uid() = driver_id);

CREATE POLICY "Riders can create rides" ON rides
  FOR INSERT WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Users can update their own rides" ON rides
  FOR UPDATE USING (auth.uid() = rider_id OR auth.uid() = driver_id);

-- Payments policies
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = rider_id OR auth.uid() = driver_id);

CREATE POLICY "System can create payments" ON payments
  FOR INSERT WITH CHECK (TRUE);

-- Ratings policies
CREATE POLICY "Users can view ratings" ON ratings
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create ratings for their rides" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Messages policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Location updates policies
CREATE POLICY "Drivers can insert their own location updates" ON location_updates
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Users can view location updates for their rides" ON location_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rides 
      WHERE rides.id = location_updates.ride_id 
      AND (rides.rider_id = auth.uid() OR rides.driver_id = auth.uid())
    )
  );

-- Create sample admin user (you should change the password)
-- This is commented out for security - run manually after setup
/*
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@rideshare.com',
  crypt('AdminPassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@rideshare.com',
  'Admin User',
  'admin'
);
*/