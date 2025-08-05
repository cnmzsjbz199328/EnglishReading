import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Recording } from './types'

// Define bindings from wrangler.toml (使用 any 类型暂时避免类型错误)
export type Bindings = {
  DB: any; // D1Database
  R2_BUCKET: any; // R2Bucket
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Add CORS for local development
app.use('/api/*', cors())

// --- API ROUTES ---

// GET /api/recordings -> Get all recordings
app.get('/api/recordings', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, title, created_at as createdAt FROM recordings ORDER BY created_at DESC"
    ).all();
    return c.json({ success: true, data: results as Recording[] });
  } catch (e) {
    console.error(e);
    return c.json({ success: false, error: "Failed to fetch recordings" }, 500);
  }
});

// GET /api/presigned-url -> Get a URL to upload a file to R2
app.get(
  '/api/presigned-url',
  zValidator('query', z.object({ filename: z.string() })),
  async (c) => {
    const { filename } = c.req.valid('query')
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${c.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: c.env.R2_ACCESS_KEY_ID,
        secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
      },
    });
    
    const key = `uploads/${Date.now()}-${filename}`;
    const signedUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: 'english-reading-bucket', Key: key }),
      { expiresIn: 360 } // 6 minutes
    );

    return c.json({ success: true, data: { signedUrl, key } });
  }
);

// POST /api/recordings -> Create a new recording
app.post(
  '/api/recordings',
  zValidator('json', z.object({
    title: z.string().min(1),
    text: z.string().min(1),
    audioKey: z.string().min(1)
  })),
  async (c) => {
    const { title, text, audioKey } = c.req.valid('json');
    const id = crypto.randomUUID();
    
    try {
      const { success } = await c.env.DB.prepare(
        "INSERT INTO recordings (id, title, original_text, r2_object_key) VALUES (?, ?, ?, ?)"
      ).bind(id, title, text, audioKey).run();

      if (!success) {
        throw new Error("Failed to insert into database");
      }
      
      const newRecording: Recording = { id, title, createdAt: new Date().toISOString() };
      return c.json({ success: true, data: newRecording }, 201);

    } catch (e) {
      console.error(e);
      return c.json({ success: false, error: "Failed to create recording" }, 500);
    }
  }
);

// GET /api/recordings/:id/audio -> Get audio stream
app.get('/api/recordings/:id/audio', async (c) => {
   const id = c.req.param('id');
   const record = await c.env.DB.prepare("SELECT r2_object_key FROM recordings WHERE id = ?").bind(id).first();

   if (!record) {
       return c.json({ success: false, error: "Recording not found" }, 404);
   }

   const r2Object = await c.env.R2_BUCKET.get(record.r2_object_key);

   if (r2Object === null) {
       return c.json({ success: false, error: "Audio file not found in storage" }, 404);
   }
   
   const headers = new Headers();
   r2Object.writeHttpMetadata(headers);
   headers.set('etag', r2Object.httpEtag);

   return new Response(r2Object.body, {
       headers,
   });
});

// DELETE /api/recordings/:id -> Delete a recording
app.delete('/api/recordings/:id', async (c) => {
   const id = c.req.param('id');
   const record = await c.env.DB.prepare("SELECT r2_object_key FROM recordings WHERE id = ?").bind(id).first();

   if (!record) {
       return c.json({ success: false, error: "Recording not found" }, 404);
   }

   // Delete from R2 first
   await c.env.R2_BUCKET.delete(record.r2_object_key);

   // Then delete from D1
   await c.env.DB.prepare("DELETE FROM recordings WHERE id = ?").bind(id).run();

   return c.json({ success: true, message: `Deleted recording ${id}` });
});

export default app
