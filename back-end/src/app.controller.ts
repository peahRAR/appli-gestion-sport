import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './users/entities/users.entity';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Public()
  @Get()
  initApp(): Promise<User> {
    return this.appService.initApp();
  }

  @Public()
  @Get('/wake-up')
  wakeUp() {
    return 'Application réveillée!';
  }
}