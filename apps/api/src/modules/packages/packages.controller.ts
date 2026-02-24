import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '@winphotography/shared';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { CreatePricingAddonDto } from './dto/create-pricing-addon.dto';
import { UpdatePricingAddonDto } from './dto/update-pricing-addon.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Packages')
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  // Public: return active packages
  @Get()
  async findActive() {
    return this.packagesService.findActive();
  }

  // Admin: return ALL packages including inactive
  // NOTE: This route must be defined before :id to avoid "admin" being parsed as a UUID
  @Get('admin/all')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.packagesService.findAll();
  }

  // Public: return active pricing add-ons
  @Get('add-ons')
  async findActiveAddOns(@Query('eventType') eventType?: string) {
    return this.packagesService.findActiveAddOns(eventType);
  }

  // Admin: return all pricing add-ons including inactive
  @Get('admin/add-ons')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllAddOns() {
    return this.packagesService.findAllAddOns();
  }

  // Admin: create package
  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreatePackageDto) {
    return this.packagesService.create(dto);
  }

  // Admin: create add-on
  @Post('add-ons')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createAddOn(@Body() dto: CreatePricingAddonDto) {
    return this.packagesService.createAddOn(dto);
  }

  // Admin: update package
  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePackageDto,
  ) {
    return this.packagesService.update(id, dto);
  }

  // Admin: update add-on
  @Patch('add-ons/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateAddOn(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePricingAddonDto,
  ) {
    return this.packagesService.updateAddOn(id, dto);
  }

  // Admin: delete package
  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.packagesService.remove(id);
    return { message: 'Package deleted successfully' };
  }

  // Admin: delete add-on
  @Delete('add-ons/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeAddOn(@Param('id', ParseUUIDPipe) id: string) {
    await this.packagesService.removeAddOn(id);
    return { message: 'Pricing add-on deleted successfully' };
  }
}
