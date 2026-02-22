import { IsEnum, IsString, IsOptional, MaxLength } from 'class-validator';
import { BookingStatus } from '@winphotography/shared';

export class UpdateBookingDto {
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
