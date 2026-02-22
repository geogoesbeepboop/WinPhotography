import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryEntity } from './entities/gallery.entity';
import { GalleryPhotoEntity } from './entities/gallery-photo.entity';
import { GalleriesService } from './galleries.service';
import { GalleriesController } from './galleries.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([GalleryEntity, GalleryPhotoEntity]), EmailModule],
  controllers: [GalleriesController],
  providers: [GalleriesService],
  exports: [GalleriesService],
})
export class GalleriesModule {}
