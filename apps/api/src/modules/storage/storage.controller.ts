import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  BadRequestException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { UserRole } from '@winphotography/shared';
import { StorageService } from './storage.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Public image proxy — redirects to a signed R2 read URL.
   * Usage: /api/v1/storage/image?key=portfolio/uuid/file.jpg
   */
  @Get('image')
  async getImage(@Query('key') key: string, @Res() res: Response) {
    if (!key) {
      throw new BadRequestException('Missing "key" query parameter');
    }

    const signedUrl = await this.storageService.generateSignedReadUrl(key);
    res.redirect(signedUrl);
  }

  /**
   * Server-side file upload — accepts file via multipart form and uploads to R2.
   * Avoids CORS issues with presigned URL approach.
   * Returns { key, publicUrl }.
   */
  @Post('upload')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { folder?: string; entityId?: string },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const folder = body.folder || 'uploads';
    const entityId = body.entityId || '';
    const ext = file.originalname.split('.').pop() || 'jpg';
    const key = entityId
      ? `${folder}/${entityId}/${randomUUID()}.${ext}`
      : `${folder}/${randomUUID()}.${ext}`;

    await this.storageService.uploadBuffer(
      key,
      file.buffer,
      file.mimetype,
    );

    const publicUrl = this.storageService.generatePublicUrl(key);
    return { key, publicUrl };
  }
}
