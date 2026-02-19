import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminRoleGuard } from 'src/common/guard/admin.guard';
import { ClubCalendarService } from './club-calendar.service';
import { CreateClubCalendarEventDto } from './dto/create-club-calendar-event.dto';
import { UpdateClubCalendarEventDto } from './dto/update-club-calendar-event.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('club-calendar')
export class ClubCalendarController {
  private readonly logger = new Logger(ClubCalendarController.name);

  constructor(private readonly service: ClubCalendarService) {}

  // Public
  @Public()
  @Get()
  findAllPublic() {
    return this.service.findAll();
  }

  // Admin list (si tu veux garder le pattern /all)
  @UseGuards(AdminRoleGuard)
  @Get('all')
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  @UseGuards(AdminRoleGuard)
  @Post()
  create(@Body() dto: CreateClubCalendarEventDto) {
    this.logger.debug(`Create club calendar event: ${dto.startDate} ${dto.startTime ?? ''}`);
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(AdminRoleGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClubCalendarEventDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(AdminRoleGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}