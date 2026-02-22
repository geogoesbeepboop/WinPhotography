import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { GalleryStatus } from '@winphotography/shared';

export class UpdateGalleryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(GalleryStatus)
  status?: GalleryStatus;
}
