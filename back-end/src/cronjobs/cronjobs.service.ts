import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { EventsService } from '../events/events.service';
import { AlertService } from 'src/alert/alert.service';
import { ClubCalendarService } from 'src/club-calendar/club-calendar.service';
import { UsersService } from '../users/services/users.service';

@Injectable()
export class CronjobsService {
  private readonly logger = new Logger(CronjobsService.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly alertService: AlertService,
    private readonly clubCalendarService: ClubCalendarService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) { }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    // Supprimer les événements dépassés d'un jour
    await this.eventsService.deleteExpiredEvents();
    await this.alertService.deleteExpiredAlerts();

    await this.clubCalendarService.deleteExpiredClubCalendarEvents(4)
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async deactivateInactiveUsers() {
    const raw = this.configService.get<string>('INACTIVITY_DEACTIVATION_MONTHS');
    const months = Number(raw) > 0 ? Number(raw) : 3;
    const count = await this.usersService.deactivateInactiveUsers(months);
    if (count > 0) {
      this.logger.log(`Désactivé ${count} compte(s) inactif(s) depuis plus de ${months} mois.`);
    }
  }
}
