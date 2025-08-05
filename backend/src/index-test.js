import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Add CORS for local development
app.use('/api/*', cors())

// --- API ROUTES ---

// GET /api/recordings -> Get all recordings
app.get('/api/recordings', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, title, created_at as createdAt FROM recordings ORDER BY created_at DESC"
    ).all();
    return c.json({ success: true, data: results || [] });
  } catch (e) {
    console.error(e);
    return c.json({ success: false, error: "Failed to fetch recordings" }, 500);
  }
});

// Simple test endpoint
app.get('/api/test', async (c) => {
  return c.json({ success: true, message: "Backend is working!" });
});

export default app
