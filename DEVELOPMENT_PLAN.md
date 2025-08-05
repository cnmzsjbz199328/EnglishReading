# Technical Development Plan & MVP Definition

This document outlines the technical plan for building the English Reading Practice application. It is based on the "Full-Stack TypeScript Powerhouse" technology stack to ensure the development of a modern, maintainable, and high-performance application.

- **Language:** TypeScript (End-to-End)
- **Frontend:** React with Vite and Material-UI (MUI)
- **Backend:** Hono on Cloudflare Workers
- **Database:** Cloudflare D1
- **Storage:** Cloudflare R2

---

## 1. Minimum Viable Product (MVP) Definition

The goal of the MVP is to deliver the core value proposition with the minimum required features. It will allow a user to perform the complete "shadowing" loop.

**Core User Stories for MVP:**

1.  **As a user, I want to** see a form where I can input a title, a text passage, and select an MP3 file from my computer.
2.  **As a user, I want to** submit this form, which uploads my audio and saves my exercise.
3.  **As a user, I want to** see a list of all the exercises I have created, identified by their titles.
4.  **As a user, I want to** click on an exercise in the list to open a practice view.
5.  **As a user, in the practice view, I want to** see the full text and be able to play/pause the corresponding audio.
6.  **As a user, I want to** be able to delete an exercise from the list.

---

## 2. Action Plan & Implementation Guide

This section provides a step-by-step guide to build the application from scratch. Execute the commands and create the files as described.

### **Phase 1: Project Setup & Configuration**

**Objective:** Prepare the local development environment, configure Cloudflare resources, and create the database schema.

**1. Create Project Structure & Install Root Dependencies:**
   - In your project root, open a terminal and run:
     ```bash
     # Create directories for frontend and backend code
     mkdir backend frontend

     # Initialize the root package.json
     npm init -y

     # Install core dev dependencies
     npm install -D wrangler typescript
     ```

**2. Create Cloudflare Resources:**
   - Ensure you are logged in with `npx wrangler login`.
     ```bash
     # Create the D1 Database
     npx wrangler d1 create english-reading-db
     # --> IMPORTANT: Copy the returned 'database_id' for the next step.

     # Create the R2 Bucket
     npx wrangler r2 bucket create english-reading-bucket
     ```

**3. Create `wrangler.toml` Configuration:**
   - In the project root, create a file named `wrangler.toml`.
   - Paste the following content into it, replacing `<your-d1-database-id>` with the ID from the previous step.
     ```toml
     name = "english-reading-app"
     main = "backend/src/index.ts"
     compatibility_date = "2024-01-01"

     [dev]
     ip = "127.0.0.1"
     port = 8787

     [[d1_databases]]
     binding = "DB"
     database_name = "english-reading-db"
     database_id = "<your-d1-database-id>" # <-- PASTE YOUR ID HERE

     [[r2_buckets]]
     binding = "R2_BUCKET"
     bucket_name = "english-reading-bucket"

     [site]
     bucket = "./frontend/dist"
     ```

**4. Create Database Table:**
   - Run this command to create the `recordings` table in your D1 database.
     ```bash
     npx wrangler d1 execute english-reading-db --command="CREATE TABLE recordings (id TEXT PRIMARY KEY, title TEXT NOT NULL, original_text TEXT NOT NULL, r2_object_key TEXT NOT NULL UNIQUE, created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')));"
     ```

---

### **Phase 2: Backend API Development**

**Objective:** Build all necessary API endpoints using Hono.

**1. Initialize Backend Project:**
   ```bash
   # Navigate to the backend directory
   cd backend

   # Create a package.json for the backend
   npm init -y

   # Install Hono and the Zod validator for data validation
   npm install hono @hono/zod-validator zod
   以下是允许兼容的依赖版本
   npm install hono @hono/zod-validator zod --legacy-peer-deps
   
   # Install S3 client for generating presigned URLs
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```

**2. Create Shared Types (`backend/src/types.ts`):**
   - Create the file `backend/src/types.ts` and add the following:
     ```typescript
     // For list view
     export type Recording = {
       id: string;
       title: string;
       createdAt: string;
     }

     // For detail view
     export type RecordingDetail = Recording & {
       originalText: string;
     }

     // For creating a new recording
     export type CreateRecordingSchema = {
       title: string;
       text: string;
       audioKey: string;
     }
     ```

**3. Create API Server (`backend/src/index.ts`):**
   - Create the file `backend/src/index.ts`. This is the core of our backend.
   - **Note**: For TypeScript compatibility with Cloudflare Workers, use the following approach:
     ```typescript
     import { Hono } from 'hono'
     import { cors } from 'hono/cors'
     import { zValidator } from '@hono/zod-validator'
     import { z } from 'zod'
     import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
     import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

     // 类型定义
     interface Recording {
       id: string;
       title: string;
       createdAt: string;
     }

     // Cloudflare Workers 环境变量类型
     interface Env {
       DB: D1Database;
       R2_BUCKET: R2Bucket;
       R2_ACCOUNT_ID: string;
       R2_ACCESS_KEY_ID: string;
       R2_SECRET_ACCESS_KEY: string;
     }

     const app = new Hono<{ Bindings: Env }>()
     // ... rest of the API code
     ```
   - **Important TypeScript fixes**:
     - Use `interface` instead of `type` for better compatibility
     - Use proper type assertions: `as unknown as Recording[]`
     - Explicitly type database query results: `as { r2_object_key: string } | null`

**4. Configure TypeScript (`backend/tsconfig.json`):**
   - Create or update `tsconfig.json` with Cloudflare Workers compatible settings:
     ```json
     {
       "compilerOptions": {
         "target": "ES2022",
         "lib": ["ES2022"],
         "module": "ES2022",
         "moduleResolution": "node",
         "allowSyntheticDefaultImports": true,
         "esModuleInterop": true,
         "allowJs": true,
         "strict": false,
         "skipLibCheck": true,
         "isolatedModules": true,
         "noEmit": true,
         "types": ["@cloudflare/workers-types"]
       }
     }
     ```

**5. Test Backend Server:**
   - Go back to the project root directory (`cd ..`).
   - Start the local server:
     ```bash
     npx wrangler dev
     ```
   - In your browser, open `http://127.0.0.1:8787/api/recordings`. You should see `{"success":true,"data":[]}`.

---

### **Phase 3: Frontend Development**

*(This section will be filled in after the backend is complete and tested.)*

---

### **Phase 4: Integration & Deployment**

*(This section will be filled in after the frontend is complete.)*
