import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageProcessorService {
  async generateThumbnail(inputKey: string, outputKey: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async addWatermark(inputKey: string, outputKey: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
