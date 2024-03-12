import { Module } from '@nestjs/common';
import { ListsMembersService } from './lists-members.service';
import { ListsMembersController } from './lists-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {ListsMember} from './lists-member.entity'


@Module({
  imports:[TypeOrmModule.forFeature([ListsMember])],
  controllers: [ListsMembersController],
  providers: [ListsMembersService],
  exports:[ListsMembersService]
})
export class ListsMembersModule {}
