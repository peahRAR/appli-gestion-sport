import { Controller, Put, Param, Post, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SetMetadata } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { SuperAdminGuard } from '../auth/super-admin.guard';

export const Role = (...role: number[]) => SetMetadata('role', role);


@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch(':id')
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  async activateUser(@Param('id') id: number): Promise<void> {
    await this.adminService.activateUser(id);
  }

  @Put(':id/:newRole')
  @UseGuards(SuperAdminGuard)
  @UseGuards(JwtAuthGuard)
  async changeUserRole(
    @Param('id') id: number,
    @Param('newRole') newRole: number,
  ): Promise<void> {
    await this.adminService.changeUserRole(id, newRole);
  }
}
