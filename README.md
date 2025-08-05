# English Reading Practice Tool

This project is a simple and efficient English shadowing practice tool. Users can upload their own MP3 audio and corresponding text materials to practice anytime, anywhere, improving their pronunciation and fluency.

## Features (V1)

- **Create Practice Sessions**: Upload an MP3 audio file and its corresponding text transcript, and add a title to create a new, complete shadowing exercise.
- **Browse Exercises**: View all created exercises in a clear list to quickly find and select one for practice.
- **Practice Mode**: On the practice page, view the full text and play/pause the corresponding audio to listen and follow along.
- **Manage Exercises**: Delete exercises that are no longer needed to keep the practice list tidy.

## Tech Stack

- **Frontend**: A modern frontend framework (e.g., React, Vue, Svelte).
- **Backend**: Cloudflare Workers acting as the API gateway.
- **Storage**: Cloudflare R2 for storing MP3 files.
- **Database**: Cloudflare D1 for storing exercise metadata.

## System Architecture

The application uses a serverless architecture on Cloudflare. The frontend communicates with a Cloudflare Worker, which handles business logic, authentication, and interacts with R2 for file storage and D1 for data persistence.

For a detailed architecture diagram and API design, please see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/)
- An active Cloudflare account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**

    Create a `.env` file by copying the example file and fill in your Cloudflare credentials.
    ```bash
    cp .env.example .env
    ```

### Running in Development

To start the development server for both the frontend and the backend worker:

```bash
npm run dev
```

## Deployment

To deploy the application to your Cloudflare account, run:

```bash
npm run deploy
```

