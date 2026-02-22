import { IsEnum, IsString, IsOptional } from 'class-validator';
import { PaymentStatus } from '@winphotography/shared';

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}
