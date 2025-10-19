-- Test data for the ridesharing application
-- Run this AFTER running schema-simple.sql

-- Note: First create test users through the Supabase Auth UI or signup page
-- Then run these inserts with the actual user IDs

-- Example: Insert test profiles (replace the UUIDs with actual user IDs from auth.users)
-- You can get these IDs from Supabase Dashboard > Authentication > Users

/*
-- Sample data (uncomment and update IDs after creating users)

-- Update profile roles for test users
UPDATE profiles 
SET role = 'driver', full_name = 'John Driver', phone = '+1234567890'
WHERE email = 'driver@test.com';

UPDATE profiles 
SET role = 'admin', full_name = 'Admin User', phone = '+1234567891'
WHERE email = 'admin@test.com';

-- Insert driver details for driver users
INSERT INTO drivers (
  id, 
  vehicle_model, 
  vehicle_plate, 
  vehicle_color,
  license_number,
  license_expiry,
  status,
  verified
)
SELECT 
  id,
  'Toyota Camry 2022',
  'ABC-1234',
  'Silver',
  'DL-123456',
  '2025-12-31',
  'offline',
  true
FROM profiles 
WHERE email = 'driver@test.com';

-- Insert some sample rides (update rider_id and driver_id with actual IDs)
INSERT INTO rides (
  rider_id,
  driver_id,
  pickup_location,
  dropoff_location,
  pickup_lat,
  pickup_lng,
  dropoff_lat,
  dropoff_lng,
  status,
  fare,
  distance,
  duration
) VALUES 
(
  (SELECT id FROM profiles WHERE email = 'rider@test.com'),
  (SELECT id FROM profiles WHERE email = 'driver@test.com'),
  '123 Main St, City',
  '456 Oak Ave, City',
  37.7749,
  -122.4194,
  37.7849,
  -122.4094,
  'completed',
  25.50,
  5.2,
  15
);

*/