#!/bin/bash
# Setup script for Reel Analyzer
# Run this once before starting the app for the first time

set -e

echo "🎬 Reel Analyzer Setup"
echo "====================="

# 1. Check Node.js
echo ""
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install it from https://nodejs.org or via nvm."
  exit 1
fi
echo "✅ Node.js: $(node --version)"

# 2. Check Python
if ! command -v python3 &> /dev/null; then
  echo "❌ Python 3 not found. Install it from https://python.org"
  exit 1
fi
echo "✅ Python: $(python3 --version)"

# 3. Install yt-dlp
echo ""
echo "Installing yt-dlp..."
if command -v yt-dlp &> /dev/null; then
  echo "✅ yt-dlp already installed: $(yt-dlp --version)"
else
  pip3 install --user yt-dlp
  echo "✅ yt-dlp installed"
fi

# 4. Update yt-dlp (it updates frequently to keep up with platform changes)
echo "Updating yt-dlp to latest..."
pip3 install --user --upgrade yt-dlp 2>/dev/null || true
echo "✅ yt-dlp up to date"

# 5. Check ffmpeg (bundled via npm — no brew needed)
echo ""
echo "Checking bundled ffmpeg..."
node -e "const f = require('@ffmpeg-installer/ffmpeg'); console.log('✅ ffmpeg:', f.path);" 2>/dev/null || echo "⚠️  ffmpeg package not found — run npm install"

# 6. Create uploads directory
echo ""
echo "Creating uploads directory..."
mkdir -p public/uploads
echo "✅ public/uploads/ ready"

# 7. Run Prisma migrations
echo ""
echo "Setting up database..."
npx prisma migrate deploy 2>/dev/null || npx prisma db push
echo "✅ Database ready"

# 8. Check GEMINI_API_KEY
echo ""
if grep -q "your_gemini_api_key_here" .env.local 2>/dev/null; then
  echo "⚠️  GEMINI_API_KEY not set!"
  echo "   Edit .env.local and replace 'your_gemini_api_key_here' with your actual key."
  echo "   Get one at: https://aistudio.google.com/app/apikey"
else
  echo "✅ GEMINI_API_KEY is set"
fi

echo ""
echo "====================="
echo "✅ Setup complete!"
echo ""
echo "Start the app with:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000"
