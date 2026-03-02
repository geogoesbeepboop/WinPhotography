import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateHiddenGalleryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  clientName: string;

  @IsEmail()
  clientEmail: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10,15}$/, {
    message: 'clientPhone must contain 10 to 15 digits',
  })
  clientPhone?: string;
}
