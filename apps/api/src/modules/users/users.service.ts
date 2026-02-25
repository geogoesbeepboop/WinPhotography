import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '@winphotography/shared';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureSchema();
    } catch (error) {
      this.logger.error(
        'Failed to ensure users notification preference columns exist.',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async findBySupabaseId(supabaseId: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { supabaseId } });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findClients(): Promise<UserEntity[]> {
    return this.usersRepository.find({
      where: { role: UserRole.CLIENT },
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    Object.assign(user, data);
    return this.usersRepository.save(user);
  }

  async getNotificationPreferences(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return {
      notifyGalleryReady: user.notifyGalleryReady,
      notifyPaymentReminders: user.notifyPaymentReminders,
      notifySessionReminders: user.notifySessionReminders,
      notifyPromotions: user.notifyPromotions,
    };
  }

  async updateNotificationPreferences(
    id: string,
    data: Partial<{
      notifyGalleryReady: boolean;
      notifyPaymentReminders: boolean;
      notifySessionReminders: boolean;
      notifyPromotions: boolean;
    }>,
  ) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    if (data.notifyGalleryReady !== undefined) {
      user.notifyGalleryReady = data.notifyGalleryReady;
    }
    if (data.notifyPaymentReminders !== undefined) {
      user.notifyPaymentReminders = data.notifyPaymentReminders;
    }
    if (data.notifySessionReminders !== undefined) {
      user.notifySessionReminders = data.notifySessionReminders;
    }
    if (data.notifyPromotions !== undefined) {
      user.notifyPromotions = data.notifyPromotions;
    }

    const saved = await this.usersRepository.save(user);
    return {
      notifyGalleryReady: saved.notifyGalleryReady,
      notifyPaymentReminders: saved.notifyPaymentReminders,
      notifySessionReminders: saved.notifySessionReminders,
      notifyPromotions: saved.notifyPromotions,
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User ${id} not found`);
    }
  }

  private async ensureSchema(): Promise<void> {
    await this.usersRepository.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS notify_gallery_ready BOOLEAN NOT NULL DEFAULT true;
    `);
    await this.usersRepository.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS notify_payment_reminders BOOLEAN NOT NULL DEFAULT true;
    `);
    await this.usersRepository.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS notify_session_reminders BOOLEAN NOT NULL DEFAULT true;
    `);
    await this.usersRepository.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS notify_promotions BOOLEAN NOT NULL DEFAULT false;
    `);
  }
}
