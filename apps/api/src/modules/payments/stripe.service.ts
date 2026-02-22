import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  constructor(private readonly configService: ConfigService) {}

  async createCheckoutSession(data: any): Promise<any> {
    throw new Error('Not implemented');
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<any> {
    throw new Error('Not implemented');
  }

  async refund(paymentIntentId: string, amount?: number): Promise<any> {
    throw new Error('Not implemented');
  }
}
