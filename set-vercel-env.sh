#!/bin/bash

# Script to set Vercel environment variables
# This will need to be run manually as Vercel CLI requires interactive input

echo "Setting up Vercel environment variables..."

echo "Run these commands manually in your terminal:"
echo ""
echo "1. Set Supabase URL:"
echo 'vercel env add VITE_SUPABASE_URL production'
echo "   Value: https://xfbgqsjngdicrceyvlfp.supabase.co"
echo ""
echo "2. Set Supabase Anon Key:"
echo 'vercel env add VITE_SUPABASE_ANON_KEY production'
echo "   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYmdxc2puZ2RpY3JjZXl2bGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODIyMDUsImV4cCI6MjA3NjQ1ODIwNX0.W97ll4F5cJSWYSWuxxJOanNfFGEyYNkQaCHzwcMd1Ko"
echo ""
echo "3. Set API URL (placeholder - update when backend is deployed):"
echo 'vercel env add VITE_API_URL production'
echo "   Value: https://your-backend-url.com/api"
echo ""
echo "4. Set Socket URL (placeholder - update when backend is deployed):"
echo 'vercel env add VITE_SOCKET_URL production'
echo "   Value: https://your-backend-url.com"
echo ""
echo "5. After setting all variables, redeploy:"
echo 'vercel --prod'
echo ""
echo "Or configure in Vercel dashboard at:"
echo "https://vercel.com/axaiinovation/rideshare-app/settings/environment-variables"