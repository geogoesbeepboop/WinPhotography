import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SubmitTestimonialDto {
  @IsUUID()
  bookingId: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
