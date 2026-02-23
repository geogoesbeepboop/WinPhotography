import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  BadRequestException,
  NotFoundException,
  Logger,
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
  private readonly logger = new Logger(StorageController.name);

  constructor(private readonly storageService: StorageService) {}

  /**
   * Public image proxy served by API.
   * Usage: /api/v1/storage/image?key=portfolio/uuid/file.jpg
   */
  @Get('image')
  async getImage(@Query('key') keyInput: string, @Res() res: Response) {
    const key = this.normalizeStorageKey(keyInput);
    if (!key) {
      throw new BadRequestException('Missing "key" query parameter');
    }

    try {
      const object = await this.storageService.downloadObject(key);
      const contentType = object.contentType || this.guessContentTypeFromKey(key);

      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Cache-Control',
        object.cacheControl || 'public, max-age=31536000, immutable',
      );
      if (object.contentLength !== undefined) {
        res.setHeader('Content-Length', String(object.contentLength));
      }
      if (object.etag) {
        res.setHeader('ETag', object.etag);
      }
      if (object.lastModified) {
        res.setHeader('Last-Modified', object.lastModified.toUTCString());
      }

      res.status(200).send(object.buffer);
    } catch (error) {
      this.logger.warn(
        `Failed to read storage key "${key}" via image proxy: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new NotFoundException('Image not found');
    }
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

    const folder = this.normalizePathSegment(body.folder || 'uploads', 'uploads');
    const entityId = this.normalizePathSegment(body.entityId || '', '');
    const ext = this.resolveFileExtension(file.originalname, file.mimetype);
    const key = entityId
      ? `${folder}/${entityId}/${randomUUID()}.${ext}`
      : `${folder}/${randomUUID()}.${ext}`;
    const contentType = file.mimetype || this.guessContentTypeFromKey(key);

    await this.storageService.uploadBuffer(
      key,
      file.buffer,
      contentType,
    );

    const publicUrl = this.storageService.generatePublicUrl(key);
    return { key, publicUrl };
  }

  private normalizeStorageKey(input?: string): string {
    if (!input) return '';
    let value = input.trim();
    if (!value) return '';

    // Accept full proxy URLs and extract the key query value.
    if (/^https?:\/\//i.test(value)) {
      try {
        const url = new URL(value);
        value = url.searchParams.get('key') || '';
      } catch {
        return '';
      }
    }

    try {
      value = decodeURIComponent(value);
    } catch {
      // Keep raw value when decode fails.
    }

    value = value.replace(/^\/+/, '');

    if (!value || value.includes('..')) {
      return '';
    }

    return value;
  }

  private normalizePathSegment(value: string, fallback: string): string {
    const normalized = value
      .toLowerCase()
      .replace(/[^a-z0-9/_-]/g, '')
      .replace(/\/{2,}/g, '/')
      .replace(/^\/+|\/+$/g, '');

    return normalized || fallback;
  }

  private resolveFileExtension(originalName: string, mimeType: string): string {
    const extFromName = originalName
      .split('.')
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    if (extFromName && extFromName.length <= 12) {
      return extFromName;
    }

    const byMime: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/avif': 'avif',
      'image/heic': 'heic',
      'image/heif': 'heif',
    };

    return byMime[mimeType] || 'jpg';
  }

  private guessContentTypeFromKey(key: string): string {
    const ext = key.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      avif: 'image/avif',
      svg: 'image/svg+xml',
      heic: 'image/heic',
      heif: 'image/heif',
    };
    return (ext && map[ext]) || 'application/octet-stream';
  }
}
