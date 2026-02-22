import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { UserRole } from '@winphotography/shared';
import { IsEmail, IsString, IsOptional } from 'class-validator';

class RegisterClientDto {
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-client')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async registerClient(@Body() body: RegisterClientDto) {
    return this.authService.registerClient(body);
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  async getMe(@CurrentUser() user: UserEntity) {
    return user;
  }

  @Post('sync')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  async syncUser(@CurrentUser() user: UserEntity, @Req() req: any) {
    // The SupabaseAuthGuard already syncs/finds the user,
    // but this endpoint allows explicit re-sync if needed
    return user;
  }
}
