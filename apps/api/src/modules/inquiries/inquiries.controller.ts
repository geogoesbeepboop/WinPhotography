import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole, InquiryStatus } from '@winphotography/shared';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { EmailService } from '../email/email.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Inquiries')
@Controller('inquiries')
export class InquiriesController {
  private readonly logger = new Logger(InquiriesController.name);

  constructor(
    private readonly inquiriesService: InquiriesService,
    private readonly emailService: EmailService,
  ) {}

  // Public endpoint — no auth required
  @Post()
  async create(@Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(dto);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.inquiriesService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    const inquiry = await this.inquiriesService.findById(id);
    if (!inquiry) {
      throw new NotFoundException(`Inquiry ${id} not found`);
    }
    return inquiry;
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.inquiriesService.update(id, body);
  }

  @Post(':id/reply')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async sendReply(
    @Param('id') id: string,
    @Body() body: { message: string },
  ) {
    const inquiry = await this.inquiriesService.findById(id);
    if (!inquiry) {
      throw new NotFoundException(`Inquiry ${id} not found`);
    }

    try {
      await this.emailService.sendInquiryReply(inquiry.contactEmail, {
        clientName: inquiry.contactName,
        replyMessage: body.message,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send inquiry reply to ${inquiry.contactEmail}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException(
        'Failed to send email reply. Check RESEND_API_KEY, RESEND_FROM, and your verified sender domain.',
      );
    }

    // Update status to responded if currently new
    if (inquiry.status === InquiryStatus.NEW) {
      await this.inquiriesService.update(id, { status: InquiryStatus.CONTACTED });
    }

    return { message: 'Reply sent successfully' };
  }

  @Post(':id/convert')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async convertToBooking(@Param('id') id: string, @Body() body: any) {
    return this.inquiriesService.convertToBooking(id, body);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.inquiriesService.remove(id);
  }
}
