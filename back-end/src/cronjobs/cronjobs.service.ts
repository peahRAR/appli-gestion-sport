import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventsService } from '../events/events.service';
import { AlertService } from 'src/alert/alert.service';
import { ClubCalendarService } from 'src/club-calendar/club-calendar.service';

@Injectable()
export class CronjobsService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly alertService: AlertService,
    private readonly clubCalendarService: ClubCalendarService,
  ) { }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    // Supprimer les événements dépassés d'un jour
    await this.eventsService.deleteExpiredEvents();
    await this.alertService.deleteExpiredAlerts();

    await this.clubCalendarService.deleteExpiredClubCalendarEvents(4)
  }
}
