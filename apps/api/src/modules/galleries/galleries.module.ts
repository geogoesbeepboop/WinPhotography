import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryEntity } from './entities/gallery.entity';
import { GalleryPhotoEntity } from './entities/gallery-photo.entity';
import { GalleriesService } from './galleries.service';
import { GalleriesController } from './galleries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GalleryEntity, GalleryPhotoEntity])],
  controllers: [GalleriesController],
  providers: [GalleriesService],
  exports: [GalleriesService],
})
export class GalleriesModule {}
