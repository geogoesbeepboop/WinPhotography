import {
  IsUUID,
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
  Matches,
  IsDateString,
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

  @IsDateString()
  eventDate: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'eventTime must be in HH:mm or HH:mm:ss format',
  })
  eventTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  eventTimezone?: string;

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
