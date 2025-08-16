# English Reading Practice Tool

This project is a simple and efficient English shadowing practice tool. Users can upload their own MP3 audio and corresponding text materials to practice anytime, anywhere, improving their pronunciation and fluency.

## Features (V1)

- **Create Practice Sessions**: Upload an MP3 audio file and its corresponding text transcript, and add a title to create a new, complete shadowing exercise.
- **TTS Audio Generation**: Generate audio from text using Text-to-Speech technology as an alternative to file upload.
  - Multiple language support (US, UK, AU English)
  - Voice selection with automatic language-specific voice loading
  - Adjustable speech rate (0.5x - 2.0x speed)
  - Pitch control (-20 to +20 semitones)
  - Real-time audio preview before using
- **Browse Exercises**: View all created exercises in a clear list to quickly find and select one for practice.
- **Smart Text Synchronization**: Real-time text highlighting synchronized with audio playback for better follow-along experience.
- **Interactive Practice Mode**: 
  - View the full text with adjustable font size
  - Play/pause audio with floating player controls
  - Click on text segments to jump to specific audio positions
  - Variable playback speed control
- **Manage Exercises**: Delete exercises that are no longer needed to keep the practice list tidy.

## Tech Stack

- **Frontend**: Vue 3 with Composition API, Vite for building
- **Backend**: Cloudflare Workers with Hono framework
- **Storage**: Cloudflare R2 for storing MP3 files
- **Database**: Cloudflare D1 (SQLite) for storing exercise metadata
- **TTS Service**: Google Cloud Text-to-Speech API
- **Language**: TypeScript for type safety

## System Architecture

The application uses a serverless architecture on Cloudflare. The Vue.js frontend communicates with a Cloudflare Worker built with Hono framework, which handles business logic, TTS generation, and interacts with R2 for file storage and D1 for data persistence.

For a detailed architecture diagram and API design, please see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20.19.0 or v22.12.0+ (as specified in package.json)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/)
- An active Cloudflare account with D1 and R2 enabled
- Google Cloud account for Text-to-Speech API (optional, for TTS features)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/cnmzsjbz199328/EnglishReading.git
    cd EnglishReading
    ```

2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Install frontend dependencies:**
    ```bash
    cd ../frontend-vue
    npm install
    ```

4.  **Configure Cloudflare Resources:**

    Create your D1 database and R2 bucket:
    ```bash
    cd ../backend
    wrangler d1 create english-reading-db
    wrangler r2 bucket create english-reading-bucket
    ```

5.  **Configure environment variables:**

    Update `backend/wrangler.toml` with your actual database and bucket IDs.

    For TTS functionality, set up the following environment variables in Cloudflare Workers dashboard:
    - `GOOGLE_PRIVATE_KEY` (encrypted environment variable)
    - `GOOGLE_CLIENT_EMAIL` (encrypted environment variable)

### Running in Development

1.  **Start the backend (Cloudflare Worker):**
    ```bash
    cd backend
    npm run dev
    # or
    wrangler dev
    ```

2.  **Start the frontend (Vue.js app):**
    ```bash
    cd frontend-vue
    npm run dev
    ```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:8787`.

## Project Structure

```
EnglishReading/
├── backend/                 # Cloudflare Worker (Hono + TypeScript)
│   ├── src/
│   │   ├── index.ts        # Main worker entry point
│   │   ├── handlers/       # API route handlers
│   │   └── lib/           # Utility functions
│   ├── package.json
│   └── wrangler.toml      # Cloudflare Worker configuration
├── frontend-vue/           # Vue.js frontend
│   ├── src/
│   │   ├── components/    # Reusable Vue components
│   │   ├── composables/   # Vue composition functions
│   │   ├── views/         # Page components
│   │   └── assets/        # Static assets and styles
│   ├── package.json
│   └── vite.config.js     # Vite configuration
└── docs/                  # Documentation
```

## Deployment

1.  **Deploy the backend:**
    ```bash
    cd backend
    wrangler deploy
    ```

2.  **Build and deploy the frontend:**
    ```bash
    cd frontend-vue
    npm run build
    # Deploy the dist/ folder to your preferred hosting service
    ```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/recordings` - List all exercises
- `POST /api/recordings` - Create new exercise
- `GET /api/recordings/:id` - Get exercise details
- `DELETE /api/recordings/:id` - Delete exercise
- `POST /api/tts/preview` - Generate TTS audio

For detailed API documentation, see [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md).

