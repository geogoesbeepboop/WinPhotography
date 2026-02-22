import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UsersService } from '../users/users.service';
import { UserRole } from '@winphotography/shared';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private supabaseAdmin: SupabaseClient;

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
