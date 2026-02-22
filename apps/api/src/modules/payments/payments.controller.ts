import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  ForbiddenException,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
  ) {}

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    const { dueDate, ...rest } = createPaymentDto;
    return this.paymentsService.create({
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : null,
    });
  }

  @Get()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.paymentsService.findAll();
  }

  // Client: return payments belonging to the authenticated user
  // NOTE: This route must be defined before :id to avoid "my" being parsed as a UUID
  @Get('my')
  @UseGuards(SupabaseAuthGuard)
  async findMyPayments(@CurrentUser() user: UserEntity) {
    return this.paymentsService.findByClientId(user.id);
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ) {
    const payment = await this.paymentsService.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID "${id}" not found`);
    }
    if (user.role !== UserRole.ADMIN && payment.clientId !== user.id) {
      throw new ForbiddenException('You do not have access to this payment');
    }
    return payment;
  }

  @Get('booking/:bookingId')
  @UseGuards(SupabaseAuthGuard)
  async findByBooking(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: UserEntity,
  ) {
    const payments = await this.paymentsService.findByBookingId(bookingId);
    if (user.role !== UserRole.ADMIN) {
      const filtered = payments.filter((p) => p.clientId === user.id);
      if (filtered.length === 0 && payments.length > 0) {
        throw new ForbiddenException('You do not have access to these payments');
      }
      return filtered;
    }
    return payments;
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    const { dueDate, ...rest } = updatePaymentDto;
    const updateData: Record<string, any> = { ...rest };
    if (dueDate !== undefined) {
      updateData.dueDate = new Date(dueDate);
    }
    return this.paymentsService.update(id, updateData);
  }

  @Post(':id/mark-paid')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async markAsPaid(@Param('id') id: string) {
    return this.paymentsService.markAsPaid(id);
  }

  // TODO: Implement Stripe checkout session creation
  @Post('create-checkout')
  @UseGuards(SupabaseAuthGuard)
  async createCheckout(@Body() body: any) {
    // TODO: Validate body and delegate to paymentsService.createCheckoutSession
    throw new Error('Stripe checkout not yet implemented');
  }

  // TODO: Implement Stripe webhook handling
  @Post('webhook')
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    // TODO: Extract raw body and stripe-signature header,
    // then delegate to paymentsService.handleWebhook
    throw new Error('Stripe webhook handling not yet implemented');
  }
}
