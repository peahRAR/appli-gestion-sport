import { Injectable } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { User } from './users/users.entity';
import { ConfigService } from '@nestjs/config';
import { SecretsService } from './secrets/secrets.service';

@Injectable()
export class AppService {
  constructor(
    private usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly secretsService: SecretsService,
  ) {}

  async initApp(): Promise<User> {
    const users = await this.usersService.findAll();

    if (users.length < 1) {

      const superAdmin = {
        email: await this.secretsService.getSecret('EMAILSUPERADMIN'),
        password: await this.secretsService.getSecret('PASSWORDSUPERADMIN'),
        birthday: new Date(await this.secretsService.getSecret('BIRTHDAYSUPERADMIN')),
        name: await this.secretsService.getSecret('NAMESUPERADMIN'),
        firstname: await this.secretsService.getSecret('FIRSTNAMESUPERADMIN'),
        date_subscribe: new Date(),
        gender: (await this.secretsService.getSecret('GENDERSUPERADMIN')) === 'true', 
        role: parseInt(await this.secretsService.getSecret('ROLESUPERADMIN')),
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
