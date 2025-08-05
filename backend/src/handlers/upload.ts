import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { StorageService } from '../lib/storage'

export const presignedUrlValidator = zValidator('query', z.object({ 
  filename: z.string() 
}));

export async function getPresignedUrl(c: any) {
  const { filename } = c.req.valid('query');
  
  const storageService = new StorageService(
    c.env.R2_BUCKET,
    c.env.R2_ACCOUNT_ID,
    c.env.R2_ACCESS_KEY_ID,
    c.env.R2_SECRET_ACCESS_KEY
  );

  try {
    const result = await storageService.generatePresignedUrl(filename);
    return c.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    return c.json({ success: false, error: "Failed to generate presigned URL" }, 500);
  }
}
