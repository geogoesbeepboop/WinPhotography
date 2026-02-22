import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendInquiryConfirmation(to: string, data: any): Promise<void> {
    throw new Error('Not implemented');
  }

  async sendBookingConfirmed(to: string, data: any): Promise<void> {
    throw new Error('Not implemented');
  }

  async sendGalleryReady(to: string, data: any): Promise<void> {
    throw new Error('Not implemented');
  }

  async sendPaymentReceipt(to: string, data: any): Promise<void> {
    throw new Error('Not implemented');
  }

  async sendClientInvite(to: string, data: any): Promise<void> {
    throw new Error('Not implemented');
  }
}
