# Reel Analyzer

A personal web app that analyzes short-form social media videos using Gemini AI — giving you an honest, detailed review explaining what makes a video work (or not work) on social media.

## Features

- **Two input modes**: Paste an Instagram URL or upload a video file (MP4/MOV/WebM/MKV)
- **Real-time progress**: Step-by-step progress tracker (Downloading → Processing → Transcribing → Analyzing)
- **10-category scoring rubric**: Hook, Pacing, Audio, Visual Quality, Caption/Text, Storytelling, Shareability, Trend Alignment, Watch-Through, CTA
- **Honest Gemini-powered critique**: Narrative paragraphs, what worked, why it would/wouldn't perform, and concrete improvement suggestions
- **Persistent history**: All analyses saved to SQLite — browse, sort, and revisit past reviews

## Prerequisites

- **Node.js** 18+ ([nvm](https://github.com/nvm-sh/nvm) recommended)
- **Python 3** (for yt-dlp)
- **Gemini API key** ([Get one free at aistudio.google.com](https://aistudio.google.com/app/apikey))
- No `ffmpeg` system install needed — bundled via npm

## Quick Start

### 1. Set your Gemini API key

Edit `.env.local` and replace the placeholder:

```
GEMINI_API_KEY=your_actual_key_here
```

### 2. Run setup

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This will:
- Install `yt-dlp` via pip3 (for Instagram downloads)
- Verify the bundled ffmpeg is working
- Create the `public/uploads/` directory
- Run Prisma database migrations

### 3. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Manual Setup (if the script doesn't work)

```bash
# Install yt-dlp
pip3 install --user yt-dlp

# Install npm dependencies
npm install

# Set up the database
npx prisma migrate dev --name init

# Create uploads directory
mkdir -p public/uploads

# Start the app
npm run dev
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | SQLite + Prisma |
| Video Download | yt-dlp (Python) |
| Video Processing | fluent-ffmpeg + bundled ffmpeg |
| AI Analysis | Gemini 2.5 Pro (video-native) |
| Audio Transcription | Gemini 2.0 Flash |
| Styling | Tailwind CSS |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Your Google AI Studio API key |
| `DATABASE_URL` | Auto | Set to `file:./dev.db` in `.env` |
| `NEXT_PUBLIC_BASE_URL` | Optional | Set to your deployment URL if deploying |

## Project Structure

```
reel-analyzer/
├── app/
│   ├── page.tsx              # New Analysis page (home)
│   ├── analysis/[id]/        # Results page
│   ├── history/              # History/Library page
│   └── api/
│       ├── analyze/          # Main analysis pipeline (SSE)
│       ├── analyses/         # List + single analysis endpoints
│       └── videos/[id]/      # Video streaming endpoint
├── components/
│   ├── ScoreGauge.tsx        # Circular score display
│   ├── CategoryScores.tsx    # 10-category accordion
│   ├── VideoPlayer.tsx       # HTML5 player with controls
│   ├── ProgressTracker.tsx   # Pipeline step tracker
│   └── AnalysisCard.tsx      # History card
├── lib/
│   ├── analyzer.ts           # Gemini analysis engine
│   ├── downloader.ts         # yt-dlp Instagram download module
│   ├── videoProcessor.ts     # ffmpeg metadata/thumbnail/audio
│   ├── db.ts                 # Prisma client singleton
│   └── types.ts              # Shared TypeScript types
├── prisma/
│   └── schema.prisma         # SQLite schema (Video + Analysis)
└── public/uploads/           # Stored video files + thumbnails
```

## Notes

### Instagram Downloads
Instagram occasionally updates their site which can break `yt-dlp`. To update:
```bash
pip3 install --user --upgrade yt-dlp
```

All Instagram-specific download logic is isolated in `lib/downloader.ts` — easy to patch without touching the rest of the app.

### Deploying
The app uses SQLite and local file storage by default. For deployment:
1. Swap `DATABASE_URL` to a PostgreSQL connection string and update the Prisma provider
2. Replace `public/uploads/` file storage with S3 (update `lib/downloader.ts` and `lib/videoProcessor.ts` paths)
3. Set `NEXT_PUBLIC_BASE_URL` to your production URL
