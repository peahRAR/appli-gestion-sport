import { Injectable } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { User } from './users/users.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async initApp(): Promise<User> {
    const users = await this.usersService.findAll();

    if (users.length < 1) {
      const dateSubscribeString = new Date();

      // Convertir la chaîne de caractères de la date en un objet Date
      const birthday = new Date(this.configService.get('BIRTHDAYSUPERADMIN'));

      const superAdmin = {
        email: this.configService.get('EMAILSUPERADMIN'),
        password: this.configService.get('PASSWORDSUPERADMIN'),
        birthday: birthday,
        name: this.configService.get('NAMESUPERADMIN'),
        firstname: this.configService.get('FIRSTNAMESUPERADMIN'),
        date_subscribe: dateSubscribeString,
        gender: this.configService.get('GENDERSUPERADMIN'),
        role: this.configService.get('ROLESUPERADMIN'),
        isActive: true,
        license: null,
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
