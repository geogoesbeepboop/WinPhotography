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
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '@winphotography/shared';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StorageService } from '../storage/storage.service';
import { randomUUID } from 'crypto';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly storageService: StorageService,
  ) {}

  // Public: return published posts
  @Get()
  async findPublished() {
    return this.blogService.findPublished();
  }

  // Admin: return ALL posts including drafts
  @Get('admin/all')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.blogService.findAll();
  }

  // Public: single post by slug
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  // Admin: get presigned upload URL for blog cover image
  @Post('upload-url')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUploadUrl(
    @Body() body: { filename: string; contentType: string },
  ) {
    const ext = body.filename.split('.').pop() || 'jpg';
    const key = `blog/${randomUUID()}.${ext}`;
    const uploadUrl = await this.storageService.generatePresignedUploadUrl(
      key,
      body.contentType,
    );
    const publicUrl = this.storageService.generatePublicUrl(key);
    return { uploadUrl, key, publicUrl };
  }

  // Admin: create post
  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateBlogPostDto) {
    return this.blogService.create(dto);
  }

  // Admin: update post
  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBlogPostDto,
  ) {
    return this.blogService.update(id, dto);
  }

  // Admin: delete post
  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.blogService.remove(id);
    return { message: 'Blog post deleted successfully' };
  }
}
