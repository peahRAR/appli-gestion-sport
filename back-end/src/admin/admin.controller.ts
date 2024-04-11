import { Controller, Put, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SetMetadata } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { SuperAdminGuard } from '../auth/super-admin.guard';

export const Role = (...role: number[]) => SetMetadata('role', role);


@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch(':id')
  @UseGuards(AdminGuard)
  async activateUser(@Param('id') id: number): Promise<void> {
    await this.adminService.activateUser(id);
  }

  @Put(':id/:newRole')
  @UseGuards(SuperAdminGuard)
  async changeUserRole(
    @Param('id') id: number,
    @Param('newRole') newRole: number,
  ): Promise<void> {
    await this.adminService.changeUserRole(id, newRole);
  }
}
