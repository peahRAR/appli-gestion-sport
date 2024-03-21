import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { EventsService } from '../events/events.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../events/events.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [CronjobsService,  EventsService]

})
export class CronjobsModule {}
