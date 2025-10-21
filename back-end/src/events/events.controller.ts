import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Logger, Query, ParseBoolPipe, ParseIntPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AdminRoleGuard } from 'src/common/guard/admin.guard';

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(AdminRoleGuard)
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    this.logger.debug(`Received UTC Date: ${createEventDto.date_event}`);
    return this.eventsService.create(createEventDto);
  }

  // Public, ne renvoie que les visibles par défaut
  @Get()
  findAllPublic() {
    return this.eventsService.findAllVisible();
  }

  // Admin — permet de tout lister (optionnellement filtrable)
  @UseGuards(AdminRoleGuard)
  @Get('all')
  findAllAdmin(
    @Query('visible', new ParseBoolPipe({ optional: true })) visible?: boolean,
  ) {
    return this.eventsService.findAll({ visible });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(AdminRoleGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  // Option pratique pour ne toggler que la visibilité
  @UseGuards(AdminRoleGuard)
  @Patch(':id/visibility')
  updateVisibility(
    @Param('id', ParseIntPipe) id: number,
    @Body('is_visible', new ParseBoolPipe()) isVisible: boolean,
  ) {
    return this.eventsService.update(id, { isVisible });
  }

  @UseGuards(AdminRoleGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}
