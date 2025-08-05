import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export class StorageService {
  private s3: S3Client;

  constructor(
    private r2Bucket: any, // 暂时使用 any 类型
    accountId: string,
    accessKeyId: string,
    secretAccessKey: string
  ) {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async generatePresignedUrl(filename: string): Promise<{signedUrl: string, key: string}> {
    const key = `uploads/${Date.now()}-${filename}`;
    const signedUrl = await getSignedUrl(
      this.s3,
      new PutObjectCommand({ Bucket: this.r2Bucket.name || 'english-reading-bucket', Key: key }),
      { expiresIn: 360 } // 6 minutes
    );
    return { signedUrl, key };
  }

  async getObject(key: string) {
    return await this.r2Bucket.get(key);
  }

  async deleteObject(key: string) {
    return await this.r2Bucket.delete(key);
  }
}
