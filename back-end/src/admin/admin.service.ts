// import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { UserLicense } from '../users/entities/user-license.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from '../users/services/users.service';
import { AuditLogService } from '../audit/services/audit-log.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserLicense)
    private readonly userLicenseRepository: Repository<UserLicense>,
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

    // user.email is already decrypted by the @EncryptedColumn transformer.
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Confirmation de compte',
      template: 'activation',
      context: {
        email: user.email,
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

  // Purge de fin de saison — vide uniquement le numéro de licence (legacy +
  // moderne), garde le compte adhérent et l'association fédération intacts.
  async purgeLicenses(actorUserId: string): Promise<{ affectedCount: number }> {
    const legacyResult = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ license: null })
      .where('license IS NOT NULL')
      .execute();

    const modernResult = await this.userLicenseRepository
      .createQueryBuilder()
      .update(UserLicense)
      .set({ number_encrypted: null })
      .where('number_encrypted IS NOT NULL')
      .execute();

    const affectedCount = (legacyResult.affected ?? 0) + (modernResult.affected ?? 0);
    await this.auditLogService.record(actorUserId, 'purge_licenses', affectedCount);
    return { affectedCount };
  }

  // Purge de fin de saison — vide les dates de paiement/fin d'adhésion,
  // garde le compte adhérent et le reste de ses informations intacts.
  async purgePayments(actorUserId: string): Promise<{ affectedCount: number }> {
    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ date_payment: null, date_end_pay: null })
      .where('date_payment IS NOT NULL OR date_end_pay IS NOT NULL')
      .execute();

    const affectedCount = result.affected ?? 0;
    await this.auditLogService.record(actorUserId, 'purge_payments', affectedCount);
    return { affectedCount };
  }
}
