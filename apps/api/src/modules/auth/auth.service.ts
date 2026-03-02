import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UsersService } from '../users/users.service';
import { UserRole } from '@winphotography/shared';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private supabaseAdmin: SupabaseClient;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.supabaseAdmin = createClient(
      this.configService.get<string>('supabase.url')!,
      this.configService.get<string>('supabase.serviceRoleKey')!,
    );
  }

  /**
   * Admin-invoked: create a client account in Supabase + local DB.
   * Sends an invite email so the client can set their password.
   */
  async registerClient(data: {
    email: string;
    fullName: string;
    phone?: string;
  }): Promise<UserEntity> {
    // Create user in Supabase Auth
    const { data: authData, error } =
      await this.supabaseAdmin.auth.admin.createUser({
        email: data.email,
        email_confirm: false,
        user_metadata: { full_name: data.fullName, role: 'client' },
      });

    if (error) {
      throw new BadRequestException(`Failed to create user: ${error.message}`);
    }

    // Create local user record
    const localUser = await this.usersService.create({
      supabaseId: authData.user.id,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone || null,
      role: UserRole.CLIENT,
    });

    // Send invite email so client can set their password
    await this.supabaseAdmin.auth.admin.inviteUserByEmail(data.email);

    return localUser;
  }

  /**
   * Public self-signup flow for clients.
   * Creates both Supabase auth user and local users table record.
   */
  async registerSelf(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ id: string; email: string; fullName: string; phone: string | null }> {
    const email = data.email.trim().toLowerCase();
    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    const phone = data.phone.replace(/\D/g, '');
    const fullName = `${firstName} ${lastName}`.trim();

    if (!firstName || !lastName) {
      throw new BadRequestException('First and last name are required');
    }

    if (phone.length < 10) {
      throw new BadRequestException('Phone number must be at least 10 digits');
    }

    const existingLocal = await this.usersService.findByEmail(email);
    if (existingLocal?.role === UserRole.ADMIN) {
      throw new ConflictException('An account with this email already exists. Please sign in.');
    }

    if (existingLocal) {
      const { data: existingSupabaseData, error: existingSupabaseError } =
        await this.supabaseAdmin.auth.admin.getUserById(existingLocal.supabaseId);

      if (!existingSupabaseError && existingSupabaseData?.user) {
        throw new ConflictException('An account with this email already exists. Please sign in.');
      }
    }

    const { data: authData, error } = await this.supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: UserRole.CLIENT,
        phone,
      },
      app_metadata: {
        role: UserRole.CLIENT,
      },
    });

    if (error || !authData?.user) {
      const message = error?.message || 'Unknown error';
      if (message.toLowerCase().includes('already')) {
        throw new ConflictException('An account with this email already exists. Please sign in.');
      }
      throw new BadRequestException(`Failed to create account: ${message}`);
    }

    try {
      const localUser = existingLocal
        ? await this.usersService.update(existingLocal.id, {
            supabaseId: authData.user.id,
            email,
            fullName,
            phone,
            role: UserRole.CLIENT,
          })
        : await this.usersService.create({
            supabaseId: authData.user.id,
            email,
            fullName,
            phone,
            role: UserRole.CLIENT,
          });

      return {
        id: localUser.id,
        email: localUser.email,
        fullName: localUser.fullName,
        phone: localUser.phone,
      };
    } catch (dbError) {
      try {
        await this.supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (rollbackError) {
        this.logger.error(
          `Failed to rollback Supabase user ${authData.user.id} after local DB write failure`,
          rollbackError instanceof Error ? rollbackError.stack : String(rollbackError),
        );
      }

      this.logger.error(
        `Failed to persist local user for ${email}`,
        dbError instanceof Error ? dbError.stack : String(dbError),
      );
      throw new InternalServerErrorException(
        'Failed to complete account setup. Please try again.',
      );
    }
  }

  /**
   * Sync Supabase auth user to local users table.
   * Called after login to ensure local record exists.
   */
  async syncUser(
    supabaseId: string,
    email: string,
    metadata: Record<string, unknown>,
  ): Promise<UserEntity> {
    let localUser = await this.usersService.findBySupabaseId(supabaseId);

    if (!localUser) {
      localUser = await this.usersService.create({
        supabaseId,
        email,
        fullName: (metadata?.full_name as string) || email.split('@')[0],
        role: (metadata?.role as UserRole) || UserRole.CLIENT,
      });
    }

    return localUser;
  }

  /**
   * Get current user profile from local DB.
   */
  async getMe(supabaseId: string): Promise<UserEntity> {
    const user = await this.usersService.findBySupabaseId(supabaseId);
    if (!user) {
      throw new BadRequestException('User not found in local database');
    }
    return user;
  }
}
