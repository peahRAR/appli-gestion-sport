import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ListsMembersService } from './lists-members.service';
import { CreateListsMemberDto } from './dto/create-lists-member.dto';
import { UpdateListsMemberDto } from './dto/update-lists-member.dto';

@Controller('lists-members')
export class ListsMembersController {
  constructor(private readonly listsMembersService: ListsMembersService) {}

  @Post()
  create(@Body() createListsMemberDto: CreateListsMemberDto) {
    return this.listsMembersService.create(createListsMemberDto);
  }

  @Get()
  findAll() {
    return this.listsMembersService.findAll();
  }

  @Get(':eventId/:userId')
  findOne(@Param('eventId') eventId: string, @Param('userId') userId: string) {
    return this.listsMembersService.findOne(+eventId, +userId);
  }

  @Patch(':eventId/:userId')
  update(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
    @Body() updateListsMemberDto: UpdateListsMemberDto,
  ) {
    return this.listsMembersService.update(+eventId, +userId, updateListsMemberDto);
  }

  @Delete(':eventId/:userId')
  remove(@Param('eventId') eventId: string, @Param('userId') userId: string) {
    return this.listsMembersService.remove(+eventId, +userId);
  }
}
