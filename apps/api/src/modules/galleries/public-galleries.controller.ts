import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GalleriesService } from './galleries.service';

@ApiTags('Public Galleries')
@Controller('galleries/public')
export class PublicGalleriesController {
  constructor(private readonly galleriesService: GalleriesService) {}

  @Get(':slug')
  async findHiddenPublicGallery(@Param('slug') slug: string) {
    const gallery = await this.galleriesService.findHiddenPublicBySlug(slug);

    if (!gallery) {
      throw new NotFoundException('Gallery not found');
    }

    return {
      id: gallery.id,
      title: gallery.title,
      description: gallery.description,
      status: gallery.status,
      photoCount: gallery.photoCount,
      createdAt: gallery.createdAt,
      publishedAt: gallery.publishedAt,
      isHiddenPublic: gallery.isHiddenPublic,
      publicAccessSlug: gallery.publicAccessSlug,
      accessEmailHint: this.maskEmail(gallery.client?.email || ''),
      photos: (gallery.photos || []).map((photo) => ({
        id: photo.id,
        filename: photo.filename,
        isFavorite: photo.isFavorite,
        url: (photo as any).url || null,
        thumbnailUrl: (photo as any).thumbnailUrl || null,
      })),
    };
  }

  private maskEmail(email: string): string | null {
    if (!email || !email.includes('@')) return null;
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return null;
    if (localPart.length <= 2) {
      return `${localPart[0] || '*'}*@${domain}`;
    }
    return `${localPart[0]}${'*'.repeat(Math.max(1, localPart.length - 2))}${localPart[localPart.length - 1]}@${domain}`;
  }
}
