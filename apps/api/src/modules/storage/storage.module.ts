import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { ImageProcessorService } from './image-processor.service';

@Module({
  controllers: [StorageController],
  providers: [StorageService, ImageProcessorService],
  exports: [StorageService, ImageProcessorService],
})
export class StorageModule {}
