import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Logger} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AdminRoleGuard } from 'src/common/guard/admin.guard';



@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);
  
  constructor(private readonly eventsService: EventsService) { }
  

  @UseGuards(AdminRoleGuard)
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    this.logger.debug(`Received UTC Date: ${createEventDto.date_event}`);
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @UseGuards(AdminRoleGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @UseGuards(AdminRoleGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }
}
