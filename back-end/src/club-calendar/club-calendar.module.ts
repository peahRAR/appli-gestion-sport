import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubCalendarEvent } from './club-calendar.entity';
import { ClubCalendarController } from './club-calendar.controller';
import { ClubCalendarService } from './club-calendar.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClubCalendarEvent])],
  controllers: [ClubCalendarController],
  providers: [ClubCalendarService],
  exports: [ClubCalendarService],
})
export class ClubCalendarModule {}
