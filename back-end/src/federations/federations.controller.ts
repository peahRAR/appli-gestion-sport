import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminFederationsService } from './federations.service';
import { AdminRoleGuard } from '../common/guard/admin.guard';


@UseGuards(AdminRoleGuard)
@Controller('admin/federations')
export class AdminFederationsController {
  constructor(private readonly service: AdminFederationsService) {}

  @Post()
  create(@Body() dto: { code: string; name: string }) {
    return this.service.create(dto.code, dto.name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: { name: string }) {
    return this.service.updateName(id, dto.name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
