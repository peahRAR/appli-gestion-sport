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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listsMembersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateListsMemberDto: UpdateListsMemberDto) {
    return this.listsMembersService.update(+id, updateListsMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listsMembersService.remove(+id);
  }
}
