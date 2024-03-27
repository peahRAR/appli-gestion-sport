import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { EventsService } from '../events/events.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../events/events.entity';
import { ListsMembersModule } from '../lists-members/lists-members.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), ListsMembersModule],
  providers: [CronjobsService, EventsService],
})
export class CronjobsModule {}
