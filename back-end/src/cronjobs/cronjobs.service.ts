import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventsService } from '../events/events.service';

@Injectable()
export class CronjobsService {

    constructor(private readonly eventsService: EventsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    
    // Supprimer les événements dépassés d'un jour
    await this.eventsService.deleteExpiredEvents();
  }
}
