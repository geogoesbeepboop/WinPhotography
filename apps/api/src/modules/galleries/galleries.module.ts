import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryEntity } from './entities/gallery.entity';
import { GalleryPhotoEntity } from './entities/gallery-photo.entity';
import { GalleriesService } from './galleries.service';
import { GalleriesController } from './galleries.controller';
import { PublicGalleriesController } from './public-galleries.controller';
import { EmailModule } from '../email/email.module';
import { StorageModule } from '../storage/storage.module';
import { Booking } from '../bookings/entities/booking.entity';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GalleryEntity, GalleryPhotoEntity, Booking, UserEntity]),
    EmailModule,
    StorageModule,
  ],
  controllers: [GalleriesController, PublicGalleriesController],
  providers: [GalleriesService],
  exports: [GalleriesService],
})
export class GalleriesModule {}
