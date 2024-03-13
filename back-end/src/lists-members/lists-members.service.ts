import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListsMember } from './lists-member.entity';
import { CreateListsMemberDto } from './dto/create-lists-member.dto';
import { UpdateListsMemberDto } from './dto/update-lists-member.dto';

@Injectable()
export class ListsMembersService {
  constructor(
    @InjectRepository(ListsMember)
    private readonly listsMemberRepository: Repository<ListsMember>,
  ) {}

  async create(createListsMemberDto: CreateListsMemberDto): Promise<ListsMember> {
    const newListsMember = this.listsMemberRepository.create(createListsMemberDto);
    return this.listsMemberRepository.save(newListsMember);
  }

  async findAll(): Promise<ListsMember[]> {
    return this.listsMemberRepository.find();
  }

  async findOne(eventId: number, userId: number): Promise<ListsMember | undefined> {
    return this.listsMemberRepository.findOne({ where: { eventId, userId } });
  }

  async update(
    eventId: number,
    userId: number,
    updateListsMemberDto: UpdateListsMemberDto,
  ): Promise<ListsMember | undefined> {
    await this.listsMemberRepository.update({ eventId, userId }, updateListsMemberDto);
    return this.listsMemberRepository.findOne({ where: { eventId, userId } });
  }

  async remove(eventId: number, userId: number): Promise<void> {
    await this.listsMemberRepository.delete({ eventId, userId });
  }
}
