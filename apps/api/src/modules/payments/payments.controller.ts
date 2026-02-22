import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UserRole } from '@winphotography/shared';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('create-checkout')
  @UseGuards(SupabaseAuthGuard)
  async createCheckout(@Body() body: any) {
    throw new Error('Not implemented');
  }

  @Get()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    throw new Error('Not implemented');
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  async findOne(@Param('id') id: string) {
    throw new Error('Not implemented');
  }

  @Post('webhook')
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    throw new Error('Not implemented');
  }

  @Post(':id/refund')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async refund(@Param('id') id: string) {
    throw new Error('Not implemented');
  }
}
