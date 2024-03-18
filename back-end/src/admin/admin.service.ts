import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private decryptEmail(encryptedEmail: string): string {
    const secret = this.configService.get<string>('ENCRYPTION_KEY');
    // Extraire l'IV de la chaîne encryptée
    const [ivString, encryptedString] = encryptedEmail.split(':');
    const iv = Buffer.from(ivString, 'hex');
    const key = crypto.scryptSync(secret, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decryptedEmail = decipher.update(encryptedString, 'hex', 'utf-8');
    decryptedEmail += decipher.final('utf-8');

    return decryptedEmail;
  }

  async activateUser(id: number): Promise<void> {
    // Récupérer l'utilisateur à partir de l'ID
    const user = await this.userRepository.findOne({ where: { id: id} });

    
    // Vérifier si l'utilisateur existe
    if (!user) {
      throw new Error('Utilisateur introuvable.');
    }
    console.log(user)
    // Mettre à jour le champ isActive
    user.isActive = true;
    
    // Enregistrer les modifications dans la base de données
    await this.userRepository.save(user);

    // Décrypter l'adresse email
    const decryptedEmail = this.decryptEmail(user.email.data);

    // Envoyer l'email de confirmation
    // await this.mailerService.sendMail({
    //     to: decryptedEmail,
    //     subject: 'Confirmation de compte',
    //     template: 'confirmation',
    //     context: {
    //       email: decryptedEmail,
    //       // Autres variables nécessaires pour le template...
    //     },
    // });
  }

  async changeUserRole(id: number, newRole: number): Promise<void> {
    // Récupérer l'utilisateur à partir de l'ID
    const user = await this.userRepository.findOne({ where: { id: id} });

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
