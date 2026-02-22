import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '@winphotography/shared';
import { BookingsService } from './bookings.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() body: any) {
    throw new Error('Not implemented');
  }

  @Get()
  async findAll() {
    throw new Error('Not implemented');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    throw new Error('Not implemented');
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    throw new Error('Not implemented');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    throw new Error('Not implemented');
  }
}
