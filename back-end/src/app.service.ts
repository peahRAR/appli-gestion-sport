import { Injectable } from '@nestjs/common';
import { UsersService } from './users/services/users.service';
import { User } from './users/entities/users.entity';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AppService {
  constructor(
    private usersService: UsersService,
    private readonly configService: ConfigService,

  ) { }

  async initApp(): Promise<User> {
    const users = await this.usersService.findAll();

    if (users.length < 1) {

      const superAdmin = {
        email: this.configService.get<string>('EMAILSUPERADMIN'),
        password: this.configService.get<string>('PASSWORDSUPERADMIN'),
        birthday: new Date(this.configService.get<string>('BIRTHDAYSUPERADMIN')),
        name: this.configService.get<string>('NAMESUPERADMIN'),
        firstname: this.configService.get<string>('FIRSTNAMESUPERADMIN'),
        date_subscribe: new Date(),
        gender: this.configService.get<string>('GENDERSUPERADMIN') === 'true',
        role: parseInt(this.configService.get<string>('ROLESUPERADMIN')),
        isActive: true,
        license: null,
        tel_num: null,
        tel_medic: null,
        tel_emergency: null,
        weight: null,
        date_payment: null,
        date_end_pay: null,
        avatar: null,
      };

      // Attendre la création du superAdmin
      await this.usersService.create(superAdmin);
    }

    return;
  }
}
