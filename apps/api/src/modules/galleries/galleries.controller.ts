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
import { GalleriesService } from './galleries.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Galleries')
@Controller('galleries')
@UseGuards(SupabaseAuthGuard)
export class GalleriesController {
  constructor(private readonly galleriesService: GalleriesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
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
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: any) {
    throw new Error('Not implemented');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    throw new Error('Not implemented');
  }

  @Post(':id/photos')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async addPhotos(@Param('id') id: string, @Body() body: any) {
    throw new Error('Not implemented');
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async publish(@Param('id') id: string) {
    throw new Error('Not implemented');
  }

  @Get(':id/photos/:photoId/download')
  async downloadPhoto(
    @Param('id') id: string,
    @Param('photoId') photoId: string,
  ) {
    throw new Error('Not implemented');
  }

  @Post(':id/download-all')
  async downloadAll(@Param('id') id: string) {
    throw new Error('Not implemented');
  }
}
