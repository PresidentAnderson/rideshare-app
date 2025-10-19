# 📚 RideShare Setup Guide

## Step 1: Database Setup in Supabase

### 1.1 Run the Schema
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `/database/schema-simple.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl/Cmd + Enter)

✅ This creates all tables, indexes, and security policies

### 1.2 Verify Tables
1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - profiles
   - drivers
   - rides
   - payments
   - ratings
   - messages

## Step 2: Test the Application

### 2.1 Access the Application
- Frontend: http://localhost:3001
- Backend API: http://localhost:5001/health

### 2.2 Create Test Users

#### Create a Rider Account:
1. Click "Get Started" on the home page
2. Register with:
   - Name: Test Rider
   - Email: rider@test.com
   - Password: TestPass123!
   - Role: Select "Rider"

#### Create a Driver Account:
1. Open an incognito/private browser window
2. Go to http://localhost:3001
3. Register with:
   - Name: Test Driver
   - Email: driver@test.com
   - Password: TestPass123!
   - Role: Select "Driver"

#### Create an Admin Account:
1. Register normally as a rider
2. Then update the role in Supabase:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'admin@test.com';
   ```

## Step 3: Test Core Features

### As a Rider:
1. **Login** with rider@test.com
2. **Request a Ride**:
   - Click "Request Ride" from dashboard
   - Enter pickup location: "123 Main St"
   - Enter dropoff location: "456 Oak Ave"
   - Click "Request Ride"
3. **View Ride Status** in dashboard
4. **Check Ride History** in "My Rides"

### As a Driver:
1. **Login** with driver@test.com
2. **Register Vehicle** (first time):
   - Go to driver registration
   - Enter vehicle details:
     - Model: Toyota Camry
     - Plate: ABC-1234
     - Color: Silver
     - License: DL-123456
3. **Go Online**:
   - Toggle status to "Online"
4. **Accept Rides**:
   - View available rides
   - Click "Accept" on a ride
5. **Complete Ride**:
   - Click "Start Ride"
   - Click "Complete Ride"

### As an Admin:
1. **Login** with admin@test.com
2. **Access Admin Dashboard**
3. **Verify Drivers**:
   - View pending driver applications
   - Approve/Reject drivers
4. **View Platform Stats**

## Step 4: Optional Enhancements

### 4.1 Enable Real-time Updates
In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Enable replication for:
   - rides
   - messages
   - drivers

### 4.2 Configure Email (Optional)
In Supabase Dashboard:
1. Go to **Authentication** → **Email Templates**
2. Customize confirmation emails
3. Configure SMTP settings if needed

### 4.3 Add Google Maps
1. Get an API key from [Google Cloud Console](https://console.cloud.google.com)
2. Add to frontend `.env`:
   ```
   VITE_GOOGLE_MAPS_KEY=your-api-key
   ```

### 4.4 Add Stripe Payments
1. Get keys from [Stripe Dashboard](https://dashboard.stripe.com)
2. Add to backend `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Troubleshooting

### Issue: "supabaseKey is required" error
**Solution**: Ensure `.env` files have correct Supabase credentials

### Issue: Cannot create rides
**Solution**: Check if profiles table has your user and correct role

### Issue: Frontend not connecting to backend
**Solution**: Verify both servers are running:
- Frontend: http://localhost:3001
- Backend: http://localhost:5001

### Issue: Tables not created
**Solution**: 
1. Check SQL Editor for errors
2. Ensure uuid-ossp extension is enabled
3. Try running schema in smaller chunks

## Quick Commands

```bash
# Start Backend
cd backend && npm run dev

# Start Frontend  
cd frontend && npm run dev

# Check logs
curl http://localhost:5001/health

# Kill processes on ports
lsof -ti:3001 | xargs kill -9
lsof -ti:5001 | xargs kill -9
```

## Support

- Check `/README.md` for architecture details
- Review `/docs/API.md` for API documentation
- Database schema: `/database/schema-simple.sql`

---

🎉 **Your ridesharing app is ready to use!**