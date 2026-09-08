import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PushSubscription } from './push-subscription.entity';
import { User } from '../users/entities/users.entity';

export type PushSubscriptionDto = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);
  private vapidConfigured = false;

  constructor(
    @InjectRepository(PushSubscription)
    private readonly subscriptionRepo: Repository<PushSubscription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.configService.get<string>('VAPID_SUBJECT') || 'mailto:contact@mmabaisieux.fr';

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.vapidConfigured = true;
    } else {
      this.logger.warn('VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY not configured — push notifications are disabled.');
    }
  }

  async subscribe(userId: string, dto: PushSubscriptionDto): Promise<void> {
    let record = await this.subscriptionRepo.findOne({ where: { endpoint: dto.endpoint } });
    if (!record) {
      record = this.subscriptionRepo.create({ endpoint: dto.endpoint });
    }
    record.userId = userId;
    record.p256dh = dto.keys.p256dh;
    record.auth = dto.keys.auth;
    await this.subscriptionRepo.save(record);
  }

  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await this.subscriptionRepo.delete({ userId, endpoint });
  }

  async setPreference(userId: string, enabled: boolean): Promise<void> {
    await this.userRepo.update({ id: userId }, { push_notifications_enabled: enabled });
    if (!enabled) {
      // Drop subscriptions too — respects the refusal even if a stale
      // subscription lingers in the browser.
      await this.subscriptionRepo.delete({ userId });
    }
  }

  async notifyNewVisibleCourse(course: { name_event?: string | null }): Promise<void> {
    if (!this.vapidConfigured) return;

    const users = await this.userRepo.find({
      where: { push_notifications_enabled: true },
      select: ['id'],
    });
    const userIds = users.map((u) => u.id);
    if (userIds.length === 0) return;

    const subscriptions = await this.subscriptionRepo.find({ where: { userId: In(userIds) } });
    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({
      title: 'Nouveau cours disponible',
      body: course.name_event
        ? `Le cours "${course.name_event}" vient d'être ajouté, pense à t'y inscrire !`
        : "Un cours vient d'être ajouté, pense à t'y inscrire !",
      url: '/',
    });

    // Fire-and-forget per subscription — one failing device must never block
    // the others, and must never surface as an error to the caller (course
    // creation already succeeded).
    await Promise.all(subscriptions.map((sub) => this.sendOrCleanup(sub, payload)));
  }

  private async sendOrCleanup(sub: PushSubscription, payload: string): Promise<void> {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      );
    } catch (error: any) {
      const statusCode = error?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await this.subscriptionRepo.delete({ id: sub.id });
      } else {
        this.logger.warn(`Push notification failed for subscription ${sub.id}: ${error?.message || error}`);
      }
    }
  }
}
