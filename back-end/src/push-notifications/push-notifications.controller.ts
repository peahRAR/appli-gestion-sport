import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserIdOradminRoleGuard } from '../common/guard/users.guard';
import { PushNotificationsService, PushSubscriptionDto } from './push-notifications.service';

@Controller('users')
export class PushNotificationsController {
  constructor(private readonly pushNotificationsService: PushNotificationsService) {}

  @UseGuards(UserIdOradminRoleGuard)
  @Post(':id/push-subscriptions')
  subscribe(@Param('id') id: string, @Body() dto: PushSubscriptionDto) {
    return this.pushNotificationsService.subscribe(id, dto);
  }

  @UseGuards(UserIdOradminRoleGuard)
  @Delete(':id/push-subscriptions')
  unsubscribe(@Param('id') id: string, @Body('endpoint') endpoint: string) {
    return this.pushNotificationsService.unsubscribe(id, endpoint);
  }

  @UseGuards(UserIdOradminRoleGuard)
  @Patch(':id/push-preference')
  setPreference(@Param('id') id: string, @Body('enabled') enabled: boolean) {
    return this.pushNotificationsService.setPreference(id, !!enabled);
  }
}
