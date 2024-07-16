// import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from '../users/services/users.service';
import { EncryptionService } from '../users/services/encryption.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }


  async activateUser(id: string): Promise<void> {
    // Récupérer l'utilisateur à partir de l'ID
    const user = await this.userRepository.findOne({ where: { id: id } });


    // Vérifier si l'utilisateur existe
    if (!user) {
      throw new Error('Utilisateur introuvable.');
    }


    // Mettre à jour le champ isActive
    user.isActive = true;

    // Enregistrer les modifications dans la base de données
    await this.userRepository.save(user);

    // Décrypter l'adresse email
    const decryptedEmail = await this.encryptionService.decryptField(user.email, true);


    await this.mailerService.sendMail({
      to: decryptedEmail,
      subject: 'Confirmation de compte',
      template: 'activation',
      context: {
        email: decryptedEmail,

      },
    });
  }

  async changeUserRole(id: string, newRole: number): Promise<void> {
    // Récupérer l'utilisateur à partir de l'ID
    const user = await this.userRepository.findOne({ where: { id: id } });

    // Vérifier si l'utilisateur existe
    if (!user) {
      throw new Error('Utilisateur introuvable.');
    }

    // Mettre à jour le champ role
    user.role = newRole;

    // Enregistrer les modifications dans la base de données
    await this.userRepository.save(user);
  }
}
