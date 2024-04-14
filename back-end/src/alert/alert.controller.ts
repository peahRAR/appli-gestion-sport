// alert.controller.ts

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AlertService } from './alert.service';
import { Alert } from './alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AdminRoleGuard } from 'src/auth/admin.guard';

@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  async findAll(): Promise<Alert[]> {
    return this.alertService.findAll();
  }

  @UseGuards(AdminRoleGuard)
  @Get(':id')
  async findById(@Param('id') id: number): Promise<Alert> {
    return this.alertService.findById(id);
  }

  @UseGuards(AdminRoleGuard)
  @Post()
  async create(@Body() createAlertDto: CreateAlertDto): Promise<Alert> {
    return this.alertService.create(createAlertDto);
  }

  @UseGuards(AdminRoleGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateAlertDto: UpdateAlertDto,
  ): Promise<Alert> {
    return this.alertService.update(id, updateAlertDto);
  }

  @UseGuards(AdminRoleGuard)
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.alertService.delete(id);
  }
}
