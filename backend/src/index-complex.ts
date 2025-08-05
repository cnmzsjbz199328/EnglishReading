import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { 
  getAllRecordings, 
  createRecording, 
  createRecordingValidator,
  getRecordingAudio, 
  deleteRecording 
} from './handlers/recordings'
import { 
  getPresignedUrl, 
  presignedUrlValidator 
} from './handlers/upload'

// Define bindings from wrangler.toml
export type Bindings = {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Add CORS for local development
app.use('/api/*', cors())

// Recording routes
app.get('/api/recordings', getAllRecordings)
app.post('/api/recordings', createRecordingValidator, createRecording)
app.get('/api/recordings/:id/audio', getRecordingAudio)
app.delete('/api/recordings/:id', deleteRecording)

// Upload routes
app.get('/api/presigned-url', presignedUrlValidator, getPresignedUrl)

export default app
