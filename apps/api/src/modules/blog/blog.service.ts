import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPostEntity } from './entities/blog-post.entity';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function calculateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPostEntity)
    private readonly blogRepository: Repository<BlogPostEntity>,
  ) {}

  async create(data: CreateBlogPostDto): Promise<BlogPostEntity> {
    const slug = generateSlug(data.title);
    const readTime = calculateReadTime(data.content);

    const post = this.blogRepository.create({
      ...data,
      slug,
      readTime,
      publishedAt: data.isPublished ? new Date() : null,
    });

    return this.blogRepository.save(post);
  }

  async findPublished(): Promise<BlogPostEntity[]> {
    return this.blogRepository.find({
      where: { isPublished: true },
      order: { publishedAt: 'DESC' },
    });
  }

  async findAll(): Promise<BlogPostEntity[]> {
    return this.blogRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findBySlug(slug: string): Promise<BlogPostEntity | null> {
    return this.blogRepository.findOne({ where: { slug } });
  }

  async findById(id: string): Promise<BlogPostEntity | null> {
    return this.blogRepository.findOne({ where: { id } });
  }

  async update(id: string, data: UpdateBlogPostDto): Promise<BlogPostEntity> {
    const post = await this.blogRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Blog post with ID "${id}" not found`);
    }

    const updateData: Partial<BlogPostEntity> = { ...data };

    if (data.title) {
      updateData.slug = generateSlug(data.title);
    }

    if (data.content) {
      updateData.readTime = calculateReadTime(data.content);
    }

    // Handle publishing
    if (data.isPublished && !post.isPublished) {
      updateData.publishedAt = new Date();
    } else if (data.isPublished === false) {
      updateData.publishedAt = null;
    }

    Object.assign(post, updateData);
    return this.blogRepository.save(post);
  }

  async remove(id: string): Promise<void> {
    const post = await this.blogRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Blog post with ID "${id}" not found`);
    }
    await this.blogRepository.remove(post);
  }
}
