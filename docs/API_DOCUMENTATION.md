# English Reading API Documentation

## Base URL
- Development: `http://127.0.0.1:8787`
- Production: TBD

## API Endpoints

### 🏥 Health Check

#### GET `/api/health`
**Description**: Check if the API is running
**Response**:
```json
{
  "success": true,
  "data": {
    "message": "English Reading API is running",
    "version": "1.0.0"
  },
  "message": "Operation successful",
  "timestamp": "2025-08-05T07:49:10.356Z"
}
```

#### GET `/api/health/db`
**Description**: Check database connection and tables
**Response**:
```json
{
  "success": true,
  "message": "Database connection successful",
  "database": {
    "connected": true,
    "tablesExist": true,
    "testQuery": { "test": 1 }
  }
}
```

### 📝 Recordings Management

#### GET `/api/recordings`
**Description**: Get list of all recordings
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "title": "Recording Title",
      "createdAt": "2025-08-05T07:49:10.356Z"
    }
  ]
}
```

#### GET `/api/recordings/:id`
**Description**: Get recording details by ID
**Parameters**:
- `id` (path): Recording UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "Recording Title",
    "originalText": "Full text content...",
    "createdAt": "2025-08-05T07:49:10.356Z"
  }
}
```

#### POST `/api/recordings`
**Description**: Create a new recording
**Request Body**:
```json
{
  "title": "My Recording",
  "text": "Full text content for shadowing practice...",
  "audioKey": "uploads/1234567890-audio.mp3"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "My Recording",
    "createdAt": "2025-08-05T07:49:10.356Z"
  }
}
```

#### DELETE `/api/recordings/:id`
**Description**: Delete a recording by ID
**Parameters**:
- `id` (path): Recording UUID

**Response**:
```json
{
  "success": true,
  "message": "Deleted recording uuid-string"
}
```

### 🎵 Audio Management

#### GET `/api/recordings/:id/audio`
**Description**: Stream audio file for a recording
**Parameters**:
- `id` (path): Recording UUID

**Response**: Binary audio stream with appropriate headers

### 📁 File Upload

#### GET `/api/presigned-url`
**Description**: Get presigned URL for file upload to R2 storage
**Query Parameters**:
- `filename` (required): Name of the file to upload

**Response**:
```json
{
  "success": true,
  "data": {
    "signedUrl": "https://...",
    "key": "uploads/1234567890-filename.mp3"
  }
}
```

## Error Responses

All endpoints return consistent error format:
```json
{
  "success": false,
  "error": "Error message description",
  "timestamp": "2025-08-05T07:49:10.356Z",
  "code": 500
}
```

## HTTP Status Codes

- `200`: Success
- `201`: Created (for POST requests)
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Usage Example with JavaScript

```javascript
// Get all recordings
const recordings = await fetch('/api/recordings')
  .then(res => res.json());

// Create new recording
const newRecording = await fetch('/api/recordings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Practice',
    text: 'Hello world...',
    audioKey: 'uploads/123-audio.mp3'
  })
}).then(res => res.json());

// Get presigned URL for upload
const uploadUrl = await fetch('/api/presigned-url?filename=audio.mp3')
  .then(res => res.json());

// Upload file using presigned URL
await fetch(uploadUrl.data.signedUrl, {
  method: 'PUT',
  body: audioFile
});
```

## Database Schema

### `recordings` table
```sql
CREATE TABLE recordings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  original_text TEXT NOT NULL,
  r2_object_key TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
```
