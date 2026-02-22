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
import { PortfolioService } from './portfolio.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  async findAll() {
    throw new Error('Not implemented');
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    throw new Error('Not implemented');
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() body: any) {
    throw new Error('Not implemented');
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: any) {
    throw new Error('Not implemented');
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    throw new Error('Not implemented');
  }

  @Post(':id/photos')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async addPhotos(@Param('id') id: string, @Body() body: any) {
    throw new Error('Not implemented');
  }

  @Delete(':id/photos/:photoId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removePhoto(
    @Param('id') id: string,
    @Param('photoId') photoId: string,
  ) {
    throw new Error('Not implemented');
  }
}
