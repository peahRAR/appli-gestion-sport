import { Injectable } from '@nestjs/common';
import { CreateListsMemberDto } from './dto/create-lists-member.dto';
import { UpdateListsMemberDto } from './dto/update-lists-member.dto';

@Injectable()
export class ListsMembersService {
  create(createListsMemberDto: CreateListsMemberDto) {
    return 'This action adds a new listsMember';
  }

  findAll() {
    return `This action returns all listsMembers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} listsMember`;
  }

  update(id: number, updateListsMemberDto: UpdateListsMemberDto) {
    return `This action updates a #${id} listsMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} listsMember`;
  }
}
