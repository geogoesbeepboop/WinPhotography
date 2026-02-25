import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  clientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  eventType?: string | null;

  @IsOptional()
  @IsUUID()
  bookingId?: string | null;

  @IsOptional()
  @IsString()
  eventDate?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
