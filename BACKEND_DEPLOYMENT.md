# 🚀 Backend Deployment Instructions

## Current Status
✅ **Backend is ready for deployment**
✅ **Environment variables configured**
✅ **Railway configuration file created**

## Option 1: Deploy to Railway (Recommended)

### Step 1: Login to Railway
```bash
railway login
```

### Step 2: Navigate to Backend Directory
```bash
cd "/Volumes/DevOps/08-incoming/Ridesharing Application/backend"
```

### Step 3: Initialize Railway Project
```bash
railway init
# Select: Create new project
# Name: rideshare-backend
```

### Step 4: Deploy
```bash
railway up
```

### Step 5: Get Production URL
```bash
railway status
```
Your backend URL will be something like: `https://rideshare-backend.railway.app`

## Option 2: Deploy to Render.com

### Step 1: Create Account
Go to https://render.com and sign up

### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Select branch: main
4. Root directory: backend
5. Build command: `npm install`
6. Start command: `npm start`

### Step 3: Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://xfbgqsjngdicrceyvlfp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYmdxc2puZ2RpY3JjZXl2bGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODIyMDUsImV4cCI6MjA3NjQ1ODIwNX0.W97ll4F5cJSWYSWuxxJOanNfFGEyYNkQaCHzwcMd1Ko
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYmdxc2puZ2RpY3JjZXl2bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4MjIwNSwiZXhwIjoyMDc2NDU4MjA1fQ.VtoV5zmJ41-ltRghsG7boSNk7OA9dBuISgzkmWjkxDQ
JWT_SECRET=rideshare-jwt-secret-production-2025-xfbgqs-secure
FRONTEND_URL=https://rideshare-app-nine.vercel.app
```

## Option 3: Deploy to Heroku

### Prerequisites
```bash
# Install Heroku CLI if not installed
brew install heroku/brew/heroku
```

### Deployment Steps
```bash
# Login to Heroku
heroku login

# Navigate to backend
cd "/Volumes/DevOps/08-incoming/Ridesharing Application/backend"

# Create Heroku app
heroku create rideshare-backend-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=5000
heroku config:set SUPABASE_URL=https://xfbgqsjngdicrceyvlfp.supabase.co
heroku config:set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYmdxc2puZ2RpY3JjZXl2bGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODIyMDUsImV4cCI6MjA3NjQ1ODIwNX0.W97ll4F5cJSWYSWuxxJOanNfFGEyYNkQaCHzwcMd1Ko
heroku config:set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYmdxc2puZ2RpY3JjZXl2bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4MjIwNSwiZXhwIjoyMDc2NDU4MjA1fQ.VtoV5zmJ41-ltRghsG7boSNk7OA9dBuISgzkmWjkxDQ
heroku config:set JWT_SECRET=rideshare-jwt-secret-production-2025-xfbgqs-secure
heroku config:set FRONTEND_URL=https://rideshare-app-nine.vercel.app

# Deploy
git push heroku main
```

## After Backend Deployment

### Update Frontend Environment Variables

Once backend is deployed, update these in Vercel:

```bash
# Update API URL (replace with your backend URL)
echo "https://your-backend-url.railway.app/api" | vercel env rm VITE_API_URL production -y
echo "https://your-backend-url.railway.app/api" | vercel env add VITE_API_URL production

# Update Socket URL  
echo "https://your-backend-url.railway.app" | vercel env rm VITE_SOCKET_URL production -y
echo "https://your-backend-url.railway.app" | vercel env add VITE_SOCKET_URL production

# Redeploy frontend
vercel --prod
```

## Testing the Backend

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-backend-url.railway.app/health

# API status
curl https://your-backend-url.railway.app/api/status

# Supabase connection
curl https://your-backend-url.railway.app/api/test-db
```

## Environment Variables Summary

### Backend (.env file already configured)
✅ NODE_ENV=production
✅ PORT=5000
✅ SUPABASE_URL=configured
✅ SUPABASE_ANON_KEY=configured
✅ SUPABASE_SERVICE_ROLE_KEY=configured
✅ JWT_SECRET=configured
✅ FRONTEND_URL=configured

### Frontend (Vercel - already configured)
✅ VITE_SUPABASE_URL=configured
✅ VITE_SUPABASE_ANON_KEY=configured
⏳ VITE_API_URL=pending (update after backend deployment)
⏳ VITE_SOCKET_URL=pending (update after backend deployment)

## 📝 Notes

- Backend is fully configured and ready for deployment
- All environment variables are set in the .env file
- Railway.json configuration is created
- Choose any deployment platform above based on your preference
- Railway and Render are the easiest options
- Remember to update frontend URLs after backend deployment

---

**Backend deployment is prepared and ready to go!** 🚀