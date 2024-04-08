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
import { AdminGuard } from 'src/auth/admin.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Alert[]> {
    return this.alertService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: number): Promise<Alert> {
    return this.alertService.findById(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  async create(@Body() createAlertDto: CreateAlertDto): Promise<Alert> {
    return this.alertService.create(createAlertDto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateAlertDto: UpdateAlertDto,
  ): Promise<Alert> {
    return this.alertService.update(id, updateAlertDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: number): Promise<void> {
    return this.alertService.delete(id);
  }
}
