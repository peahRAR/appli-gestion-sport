import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ListsMembersService } from './lists-members.service';
import { UpdateListsMemberDto } from './dto/update-lists-member.dto';
import { AdminRoleGuard } from 'src/common/guard/admin.guard';

@Controller('lists-members')
export class ListsMembersController {
  constructor(private readonly listsMembersService: ListsMembersService) {}

  @Get()
  findAll() {
    return this.listsMembersService.findAll();
  }

  @Get('by-event/:eventId')
  findAllByIdEvent(@Param('eventId') eventId: number) {
    return this.listsMembersService.findAllByIdEvent(eventId);
  }

  @Get('participants/:eventId') 
  findParticipant(@Param('eventId') eventId: number) {
    return this.listsMembersService.findParticipants(eventId)
  }

  @Get(':eventId/:userId')
  findOne(@Param('eventId') eventId: string, @Param('userId') userId: string) {
    return this.listsMembersService.findOne(+eventId, userId);
  }

  @Patch(':eventId/:userId')
  update(
    @Param('eventId') eventId: number,
    @Param('userId') userId: string,
    @Body() updateListsMemberDto: UpdateListsMemberDto,
  ) {
    return this.listsMembersService.update(
      eventId,
      userId,
      updateListsMemberDto,
    );
  }

  @UseGuards(AdminRoleGuard)
  @Delete(':eventId/:userId')
  remove(@Param('eventId') eventId: string, @Param('userId') userId: string) {
    return this.listsMembersService.remove(+eventId, userId);
  }
}
