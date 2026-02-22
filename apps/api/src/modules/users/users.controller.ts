import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '@winphotography/shared';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    throw new Error('Not implemented');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    throw new Error('Not implemented');
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    throw new Error('Not implemented');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    throw new Error('Not implemented');
  }
}
