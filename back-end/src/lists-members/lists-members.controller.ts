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
import { AdminRoleGuard } from 'src/auth/admin.guard';

@Controller('lists-members')
export class ListsMembersController {
  constructor(private readonly listsMembersService: ListsMembersService) {}

  @Get()
  findAll() {
    return this.listsMembersService.findAll();
  }

  @Get('by-event/:eventId') // Ajoutez un chemin d'accès distinct pour findAllByIdEvent
  findAllByIdEvent(@Param('eventId') eventId: string) {
    return this.listsMembersService.findAllByIdEvent(+eventId);
  }

  @Get(':eventId/:userId')
  findOne(@Param('eventId') eventId: string, @Param('userId') userId: string) {
    return this.listsMembersService.findOne(+eventId, +userId);
  }

  @UseGuards(AdminRoleGuard)
  @Patch(':eventId/:userId')
  update(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
    @Body() updateListsMemberDto: UpdateListsMemberDto,
  ) {
    return this.listsMembersService.update(
      +eventId,
      +userId,
      updateListsMemberDto,
    );
  }

  @UseGuards(AdminRoleGuard)
  @Delete(':eventId/:userId')
  remove(@Param('eventId') eventId: string, @Param('userId') userId: string) {
    return this.listsMembersService.remove(+eventId, +userId);
  }
}
