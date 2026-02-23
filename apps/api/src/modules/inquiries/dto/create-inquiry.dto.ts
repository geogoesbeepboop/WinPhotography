import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  contactName: string;

  @IsEmail()
  contactEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPhone?: string;

  @IsString()
  @MaxLength(100)
  eventType: string;

  @IsOptional()
  @IsString()
  eventDate?: string;

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
