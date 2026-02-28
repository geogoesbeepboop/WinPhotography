import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioItemEntity } from './entities/portfolio-item.entity';
import { PortfolioPhotoEntity } from './entities/portfolio-photo.entity';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { StorageModule } from '../storage/storage.module';
import { Booking } from '../bookings/entities/booking.entity';
import { GalleryEntity } from '../galleries/entities/gallery.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PortfolioItemEntity, PortfolioPhotoEntity, Booking, GalleryEntity]),
    StorageModule,
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
