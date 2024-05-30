import { Controller, Put, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SetMetadata } from '@nestjs/common';
import { AdminRoleGuard} from '../auth/admin.guard';
import { SuperadminRoleGuard } from '../auth/super-admin.guard';

export const Role = (...role: number[]) => SetMetadata('role', role);

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AdminRoleGuard)
  @Patch(':id')
  async activateUser(@Param('id') id: string): Promise<void> {
    await this.adminService.activateUser(id);
  }

  @Put(':id/:newRole')
  @UseGuards(SuperadminRoleGuard)
  async changeUserRole(
    @Param('id') id: string,
    @Param('newRole') newRole: number,
  ): Promise<void> {
    await this.adminService.changeUserRole(id, newRole);
  }
}
