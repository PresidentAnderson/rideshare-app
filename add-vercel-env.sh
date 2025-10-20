#!/bin/bash

# Script to add Vercel environment variables using CLI
echo "Adding Vercel environment variables..."

# Supabase URL
echo "https://xfbgqsjngdicrceyvlfp.supabase.co" | vercel env add VITE_SUPABASE_URL production

# Supabase Anon Key
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYmdxc2puZ2RpY3JjZXl2bGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODIyMDUsImV4cCI6MjA3NjQ1ODIwNX0.W97ll4F5cJSWYSWuxxJOanNfFGEyYNkQaCHzwcMd1Ko" | vercel env add VITE_SUPABASE_ANON_KEY production

# Placeholder for API URL (will be updated after backend deployment)
echo "https://rideshare-backend.railway.app/api" | vercel env add VITE_API_URL production

# Placeholder for Socket URL (will be updated after backend deployment)  
echo "https://rideshare-backend.railway.app" | vercel env add VITE_SOCKET_URL production

echo "Environment variables added successfully!"
echo "Note: Update VITE_API_URL and VITE_SOCKET_URL after backend deployment"