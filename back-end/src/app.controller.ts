import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './users/users.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  initApp(): Promise<User> {
    return this.appService.initApp();
  }
}
