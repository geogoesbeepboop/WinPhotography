import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@winphotography/shared';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { SubmitTestimonialDto } from './dto/submit-testimonial.dto';
import { UpdateMyTestimonialDto } from './dto/update-my-testimonial.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  // Public: return published testimonials
  @Get()
  async findPublished() {
    return this.testimonialsService.findPublished();
  }

  // Public: return featured testimonials (for home page)
  // NOTE: This route must be defined before :id to avoid "featured" being parsed as a UUID
  @Get('featured')
  async findFeatured() {
    return this.testimonialsService.findFeatured();
  }

  // Admin: return ALL testimonials including unpublished
  @Get('admin/all')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.testimonialsService.findAll();
  }

  // Client: return testimonials tied to the authenticated user's bookings
  @Get('my')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findMine(@CurrentUser() user: UserEntity) {
    return this.testimonialsService.findMine(user.id);
  }

  // Client: submit or update testimonial for one of the user's bookings
  @Post('my')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async submitMine(
    @CurrentUser() user: UserEntity,
    @Body() dto: SubmitTestimonialDto,
  ) {
    return this.testimonialsService.submitByClient(user.id, dto);
  }

  // Client: edit own testimonial
  @Patch('my/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateMine(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMyTestimonialDto,
  ) {
    return this.testimonialsService.updateMine(user.id, id, dto);
  }

  // Admin: create testimonial
  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateTestimonialDto) {
    return this.testimonialsService.create(dto);
  }

  // Admin: update testimonial
  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTestimonialDto,
  ) {
    return this.testimonialsService.update(id, dto);
  }

  // Admin: delete testimonial
  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.testimonialsService.remove(id);
    return { message: 'Testimonial deleted successfully' };
  }
}
