import {
  IsUUID,
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { BookingStatus } from '@winphotography/shared';

export class CreateBookingDto {
  @IsUUID()
  clientId: string;

  @IsOptional()
  @IsUUID()
  inquiryId?: string;

  @IsString()
  @MaxLength(100)
  eventType: string;

  @IsString()
  eventDate: string;

  @IsOptional()
  @IsString()
  eventLocation?: string;

  @IsString()
  @MaxLength(100)
  packageName: string;

  @IsNumber()
  @Min(0)
  packagePrice: number;

  @IsNumber()
  @Min(0)
  depositAmount: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
