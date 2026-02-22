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
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '@winphotography/shared';
import { GalleriesService } from './galleries.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('Galleries')
@Controller('galleries')
@UseGuards(SupabaseAuthGuard)
export class GalleriesController {
  constructor(private readonly galleriesService: GalleriesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateGalleryDto) {
    return this.galleriesService.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.galleriesService.findAll();
  }

  // Client: return galleries belonging to the authenticated user
  // NOTE: This route must be defined before :id to avoid "my" being parsed as a UUID
  @Get('my')
  async findMyGalleries(@CurrentUser() user: UserEntity) {
    return this.galleriesService.findByClientId(user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity,
  ) {
    const gallery = await this.galleriesService.findById(id);
    if (!gallery) {
      throw new NotFoundException(`Gallery with ID "${id}" not found`);
    }

    // Clients can only see their own galleries
    if (user.role !== UserRole.ADMIN && gallery.clientId !== user.id) {
      throw new ForbiddenException('You do not have access to this gallery');
    }

    return gallery;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGalleryDto,
  ) {
    return this.galleriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.galleriesService.remove(id);
    return { message: 'Gallery deleted successfully' };
  }

  @Post(':id/photos')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async addPhotos(@Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    // TODO: Implement when R2/storage integration is set up
    throw new Error('Not implemented - requires R2/storage integration');
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleriesService.publish(id);
  }

  @Get(':id/photos/:photoId/download')
  async downloadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ) {
    // TODO: Implement when R2/storage integration is set up
    throw new Error('Not implemented - requires R2/storage integration');
  }

  @Post(':id/download-all')
  async downloadAll(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: Implement when R2/storage integration is set up
    throw new Error('Not implemented - requires R2/storage integration');
  }
}
