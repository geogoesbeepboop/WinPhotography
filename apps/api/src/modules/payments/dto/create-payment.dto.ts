import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { PaymentType } from '@winphotography/shared';

export class CreatePaymentDto {
  @IsUUID()
  bookingId: string;

  @IsUUID()
  clientId: string;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string = 'usd';

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
