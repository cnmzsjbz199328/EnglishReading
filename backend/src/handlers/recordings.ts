import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Hono } from 'hono'
import type { Recording } from '../types'
import { DatabaseService } from '../lib/database'
import { StorageService } from '../lib/storage'

// Define the environment bindings type
type Bindings = {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
}

// Create a typed Hono app for this module
const recordingsApp = new Hono<{ Bindings: Bindings }>();

export async function getAllRecordings(c: any) {
  try {
    const dbService = new DatabaseService(c.env.DB);
    const results = await dbService.getAllRecordings();
    return c.json({ success: true, data: results });
  } catch (e) {
    console.error(e);
    return c.json({ success: false, error: "Failed to fetch recordings" }, 500);
  }
}

export const createRecordingValidator = zValidator('json', z.object({
  title: z.string().min(1),
  text: z.string().min(1),
  audioKey: z.string().min(1)
}));

export async function createRecording(c: any) {
  const { title, text, audioKey } = c.req.valid('json');
  const id = crypto.randomUUID();
  
  try {
    const dbService = new DatabaseService(c.env.DB);
    const success = await dbService.createRecording(id, title, text, audioKey);

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

export async function getRecordingAudio(c: any) {
  const id = c.req.param('id');
  const dbService = new DatabaseService(c.env.DB);
  const storageService = new StorageService(
    c.env.R2_BUCKET,
    c.env.R2_ACCOUNT_ID,
    c.env.R2_ACCESS_KEY_ID,
    c.env.R2_SECRET_ACCESS_KEY
  );
  
  const record = await dbService.getRecordingById(id);

  if (!record) {
    return c.json({ success: false, error: "Recording not found" }, 404);
  }

  const r2Object = await storageService.getObject(record.r2_object_key);

  if (r2Object === null) {
    return c.json({ success: false, error: "Audio file not found in storage" }, 404);
  }
  
  const headers = new Headers();
  r2Object.writeHttpMetadata(headers);
  headers.set('etag', r2Object.httpEtag);

  return new Response(r2Object.body, { headers });
}

export async function deleteRecording(c: any) {
  const id = c.req.param('id');
  const dbService = new DatabaseService(c.env.DB);
  const storageService = new StorageService(
    c.env.R2_BUCKET,
    c.env.R2_ACCOUNT_ID,
    c.env.R2_ACCESS_KEY_ID,
    c.env.R2_SECRET_ACCESS_KEY
  );

  const record = await dbService.getRecordingById(id);

  if (!record) {
    return c.json({ success: false, error: "Recording not found" }, 404);
  }

  // Delete from R2 first
  await storageService.deleteObject(record.r2_object_key);

  // Then delete from D1
  await dbService.deleteRecording(id);

  return c.json({ success: true, message: `Deleted recording ${id}` });
}
