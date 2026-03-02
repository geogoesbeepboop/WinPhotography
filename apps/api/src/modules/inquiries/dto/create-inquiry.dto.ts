import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Matches,
} from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  contactName: string;

  @IsEmail()
  contactEmail: string;

  @IsString()
  @MinLength(10)
  @MaxLength(50)
  @Matches(/^\d{10,15}$/, {
    message: 'contactPhone must contain 10 to 15 digits',
  })
  contactPhone: string;

  @IsString()
  @MaxLength(100)
  eventType: string;

  @IsOptional()
  @IsString()
  eventDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'eventTime must be in HH:mm or HH:mm:ss format',
  })
  eventTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  eventLocation?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  guestCount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  packageInterest?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  howFoundUs?: string;
}
