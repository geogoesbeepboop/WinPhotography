import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '@winphotography/shared';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { randomUUID } from 'crypto';

@ApiTags('Users')
@Controller('users')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async createClient(
    @Body() body: { fullName: string; email: string; phone?: string },
  ) {
    // Check for existing user with same email
    const existing = await this.usersService.findByEmail(body.email);
    if (existing) {
      throw new ConflictException(`A user with email "${body.email}" already exists`);
    }

    return this.usersService.create({
      fullName: body.fullName,
      email: body.email,
      phone: body.phone || null,
      role: UserRole.CLIENT,
      supabaseId: randomUUID(), // Valid UUID — placeholder until client signs in via Supabase
    });
  }

  @Get('clients')
  async findClients() {
    return this.usersService.findClients();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<{ fullName: string; phone: string; isActive: boolean }>) {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
