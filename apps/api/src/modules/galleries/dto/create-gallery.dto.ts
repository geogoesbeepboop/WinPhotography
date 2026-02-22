import { IsString, IsUUID, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateGalleryDto {
  @IsUUID()
  bookingId: string;

  @IsUUID()
  clientId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;
}
