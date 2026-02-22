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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '@winphotography/shared';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  // Public: return published portfolio items
  @Get()
  async findPublished() {
    return this.portfolioService.findPublished();
  }

  // Admin: return ALL items including unpublished
  // NOTE: This route must be defined before :slug to avoid "admin" being parsed as a slug
  @Get('admin/all')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.portfolioService.findAll();
  }

  // Public: return single item by slug
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const item = await this.portfolioService.findBySlug(slug);

    if (!item) {
      throw new NotFoundException(`Portfolio item with slug "${slug}" not found`);
    }

    return item;
  }

  // Admin: create item
  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreatePortfolioItemDto) {
    return this.portfolioService.create(dto);
  }

  // Admin: update item
  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePortfolioItemDto,
  ) {
    return this.portfolioService.update(id, dto);
  }

  // Admin: delete item
  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.portfolioService.remove(id);
  }

  // Admin: add photos (stub - needs R2 storage)
  @Post(':id/photos')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async addPhotos(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    return this.portfolioService.addPhotos(id, body.photos);
  }

  // Admin: remove photo (stub - needs R2 storage)
  @Delete(':id/photos/:photoId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ) {
    return this.portfolioService.removePhoto(id, photoId);
  }
}
