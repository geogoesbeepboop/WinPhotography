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
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@winphotography/shared';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create({
      ...dto,
      eventDate: new Date(dto.eventDate),
    });
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async findAll() {
    return this.bookingsService.findAll();
  }

  // Client: return bookings belonging to the authenticated user
  // NOTE: This route must be defined before :id to avoid "my" being parsed as a UUID
  @Get('my')
  @ApiBearerAuth()
  async findMyBookings(@CurrentUser() user: UserEntity) {
    return this.bookingsService.findByClientId(user.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity,
  ) {
    const booking = await this.bookingsService.findById(id);
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }
    if (user.role !== UserRole.ADMIN && booking.clientId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to view this booking',
      );
    }
    return booking;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.bookingsService.remove(id);
    return { message: 'Booking deleted successfully' };
  }
}
