import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UsersService } from '../../modules/users/users.service';
import { UserRole } from '@winphotography/shared';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url')!,
      this.configService.get<string>('supabase.serviceRoleKey')!,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    try {
      const {
        data: { user: supabaseUser },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !supabaseUser) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Look up local user by supabase ID, auto-create if missing
      let localUser = await this.usersService.findBySupabaseId(supabaseUser.id);

      if (!localUser) {
        // Auto-sync: create local user from Supabase auth data
        const metadata = supabaseUser.user_metadata || {};
        localUser = await this.usersService.create({
          supabaseId: supabaseUser.id,
          email: supabaseUser.email!,
          fullName: (metadata.full_name as string) || supabaseUser.email!.split('@')[0],
          role: (metadata.role as UserRole) || UserRole.CLIENT,
        });
      }

      if (!localUser.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      request.user = localUser;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
