import { Module, forwardRef } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { EventsService } from '../events/events.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../events/events.entity';
import { ListsMembersModule } from '../lists-members/lists-members.module';
import { AlertService } from 'src/alert/alert.service';
import { Alert } from 'src/alert/alert.entity';
import { ClubCalendarModule } from 'src/club-calendar/club-calendar.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Alert]),
    ListsMembersModule,
    ClubCalendarModule,
    forwardRef(() => UsersModule),
  ],
  providers: [CronjobsService, EventsService, AlertService],
})
export class CronjobsModule {}
