import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  notifyGalleryReady?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyPaymentReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  notifySessionReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyPromotions?: boolean;
}
