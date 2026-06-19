import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ImageService {
  private readonly uploadDir: string;
  private readonly apiUrl: string;

  constructor(private config: ConfigService) {
    this.uploadDir = config.get<string>('UPLOAD_DIR', './uploads');
    this.apiUrl = config.get<string>('API_URL', 'http://localhost:4000');
    fs.mkdirSync(this.uploadDir, { recursive: true });
  }

  urlFromFilename(filename: string): string {
    return `${this.apiUrl}/uploads/${filename}`;
  }

  async saveFromBuffer(filename: string, buffer: Buffer): Promise<string> {
    const fullPath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(fullPath, buffer);
    return this.urlFromFilename(filename);
  }

  async deleteByUrl(url: string): Promise<void> {
    const filename = path.basename(url);
    const fullPath = path.join(this.uploadDir, filename);
    await fs.promises.unlink(fullPath).catch(() => undefined);
  }
}
