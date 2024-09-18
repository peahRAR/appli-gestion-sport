import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventsService } from '../events/events.service';
import { AlertService } from 'src/alert/alert.service';

@Injectable()
export class CronjobsService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly alertService: AlertService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    // Supprimer les événements dépassés d'un jour
    await this.eventsService.deleteExpiredEvents();
    await this.alertService.deleteExpiredAlerts();
  }
}
