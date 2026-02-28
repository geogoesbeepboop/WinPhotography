import {
  IsEnum,
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  IsDateString,
} from 'class-validator';
import { BookingStatus } from '@winphotography/shared';

export class UpdateBookingDto {
  @IsOptional()
  @IsDateString()
  eventDate?: string;

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
  @MaxLength(500)
  eventLocation?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  contractUrl?: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsString()
  clientNotes?: string;
}
