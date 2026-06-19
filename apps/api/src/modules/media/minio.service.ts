import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client | null = null;
  private bucket: string;
  private publicUrl: string;
  private readonly logger = new Logger(MinioService.name);
  private enabled = false;

  constructor(private config: ConfigService) {
    const endpoint = config.get<string>('MINIO_ENDPOINT');
    this.bucket = config.get<string>('MINIO_BUCKET', 'techstore');
    this.publicUrl = config.get<string>('MINIO_PUBLIC_URL', '');

    if (endpoint) {
      this.client = new Minio.Client({
        endPoint: endpoint,
        port: config.get<number>('MINIO_PORT', 9000),
        useSSL: config.get<string>('MINIO_USE_SSL', 'false') === 'true',
        accessKey: config.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
        secretKey: config.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
      });
      this.enabled = true;
    }
  }

  async onModuleInit() {
    if (!this.client) return;
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, 'us-east-1');
        await this.client.setBucketPolicy(this.bucket, JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Principal: { AWS: ['*'] }, Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${this.bucket}/*`] }],
        }));
      }
      this.logger.log(`MinIO ready — bucket: ${this.bucket}`);
    } catch (err) {
      this.logger.warn(`MinIO init failed — falling back to disk: ${(err as Error).message}`);
      this.enabled = false;
    }
  }

  isEnabled() { return this.enabled; }

  async upload(filename: string, buffer: Buffer, mimetype: string): Promise<string> {
    if (!this.client) throw new Error('MinIO not configured');
    await this.client.putObject(this.bucket, filename, buffer, buffer.length, { 'Content-Type': mimetype });
    const base = this.publicUrl || `http://${this.client['host']}:${this.client['port']}`;
    return `${base}/${this.bucket}/${filename}`;
  }

  async delete(filename: string): Promise<void> {
    if (!this.client) return;
    await this.client.removeObject(this.bucket, filename).catch(() => undefined);
  }
}
