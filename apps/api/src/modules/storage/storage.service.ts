import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface DownloadedObject {
  buffer: Buffer;
  contentType?: string;
  cacheControl?: string;
  contentLength?: number;
  etag?: string;
  lastModified?: Date;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string | undefined;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const r2 = this.configService.get('r2');

    if (!r2?.accessKeyId || !r2?.secretAccessKey || !r2?.accountId) {
      this.logger.warn(
        'R2 credentials not configured — storage operations will fail',
      );
      return;
    }

    this.bucketName = r2.bucketName;
    this.publicUrl = r2.publicUrl;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${r2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2.accessKeyId,
        secretAccessKey: r2.secretAccessKey,
      },
    });

    this.logger.log(`R2 storage configured for bucket "${this.bucketName}"`);
  }

  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
  ): Promise<string> {
    this.ensureConfigured();
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async generateSignedReadUrl(key: string): Promise<string> {
    this.ensureConfigured();
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async deleteObject(key: string): Promise<void> {
    this.ensureConfigured();
    await this.s3Client.send(
      new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }),
    );
  }

  generatePublicUrl(key: string): string {
    if (!key) return '';

    // Prefer an explicit API base URL (supports local + deployed environments).
    const configuredApiUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      this.configService.get<string>('apiUrl');

    if (configuredApiUrl) {
      const normalized = configuredApiUrl.replace(/\/+$/, '');
      const baseWithPrefix = normalized.endsWith('/api/v1')
        ? normalized
        : `${normalized}/api/v1`;
      return `${baseWithPrefix}/storage/image?key=${encodeURIComponent(key)}`;
    }

    // Local fallback.
    const port = this.configService.get<number>('port', 3001);
    return `http://localhost:${port}/api/v1/storage/image?key=${encodeURIComponent(
      key,
    )}`;
  }

  async downloadObject(key: string): Promise<DownloadedObject> {
    this.ensureConfigured();
    const response = await this.s3Client.send(
      new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
    );
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return {
      buffer: Buffer.concat(chunks),
      contentType: response.ContentType,
      cacheControl: response.CacheControl,
      contentLength:
        response.ContentLength !== undefined
          ? Number(response.ContentLength)
          : undefined,
      etag: response.ETag ?? undefined,
      lastModified: response.LastModified ?? undefined,
    };
  }

  async downloadToBuffer(key: string): Promise<Buffer> {
    const { buffer } = await this.downloadObject(key);
    return buffer;
  }

  async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    this.ensureConfigured();
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
  }

  private ensureConfigured(): void {
    if (!this.s3Client || !this.bucketName) {
      throw new Error(
        'R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.',
      );
    }
  }
}
