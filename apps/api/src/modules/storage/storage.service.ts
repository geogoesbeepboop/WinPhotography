import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}

  async generatePresignedUploadUrl(key: string, contentType: string): Promise<string> {
    throw new Error('Not implemented');
  }

  async generateSignedReadUrl(key: string): Promise<string> {
    throw new Error('Not implemented');
  }

  async deleteObject(key: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
