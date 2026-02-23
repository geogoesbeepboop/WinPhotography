import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from './storage.service';
import * as sharp from 'sharp';

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);

  constructor(private readonly storageService: StorageService) {}

  async generateThumbnail(
    inputKey: string,
    outputKey: string,
  ): Promise<void> {
    const sourceBuffer = await this.storageService.downloadToBuffer(inputKey);
    const thumbnailBuffer = await sharp(sourceBuffer)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    await this.storageService.uploadBuffer(
      outputKey,
      thumbnailBuffer,
      'image/jpeg',
    );
    this.logger.log(`Thumbnail generated: ${outputKey}`);
  }

  async addWatermark(
    inputKey: string,
    outputKey: string,
  ): Promise<void> {
    throw new Error('Not implemented');
  }
}
