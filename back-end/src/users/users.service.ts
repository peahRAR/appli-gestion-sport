import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { promisify } from 'util';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPassword } from './reset-password.entity';

@Injectable()
export class UsersService {
  private readonly salt: string;
  constructor(
    @InjectRepository(ResetPassword)
    private readonly resetPasswordRepository: Repository<ResetPassword>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
    this.salt = this.configService.get<string>('SALT');
  }

  private createidentifier(email: string): string {
    const secretKey = this.configService.get<string>('PASSWORDMAIL');
    return crypto.createHmac('sha256', secretKey).update(email).digest('hex');
  }

  private createdata(email: string): string {
    const secret = this.configService.get<string>('ENCRYPTION_KEY');
    if (!secret) {
      throw new Error('Secret key is not defined in the configuration');
    }
    // générer une clé de 32 octets à partir de la phrase secret
    const key = crypto.scryptSync(secret, 'salt', 32);

    // Générer un iv aléatoire
    const iv = crypto.randomBytes(16);

    // Créer/Uiliser le chiffreur
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(email, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  private createEncryptedField(data: string): string {
    const secret = this.configService.get<string>('ENCRYPTION_KEY');
    if (!secret) {
      throw new Error('Secret key is not defined in the configuration');
    }
    // Générer une clé de 32 octets à partir de la phrase secrète
    const key = crypto.scryptSync(secret, 'salt', 32);

    // Générer un IV aléatoire
    const iv = crypto.randomBytes(16);

    // Créer/utiliser le chiffreur
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  public decryptField(encryptedData: string): string {
    const secret = this.configService.get<string>('ENCRYPTION_KEY');
    // Extraire l'IV de la chaîne encryptée
    const [ivString, encryptedString] = encryptedData.split(':');
    const iv = Buffer.from(ivString, 'hex');
    const key = crypto.scryptSync(secret, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedString, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    let isActive = false;
    let role = 0;

    if (+createUserDto.role === 2) {
      const existingSuperAdmin = await this.userRepository.findOne({
        where: { role: 2 },
      });

      role = existingSuperAdmin
        ? existingSuperAdmin.role
        : !createUserDto.role
          ? 0
          : createUserDto.role;

      isActive = +role === 2 ? true : false;

      if (existingSuperAdmin) {
        throw new Error('Un superAdmin existe déjà.');
      }
    }

    // Date anniversaire
    const birthdayString = createUserDto.birthday.toString();

    // Date création de compte
    const dateSubscribeString = new Date().toString();

    // Créer les champs encryptés
    const encryptedBirthday = this.createEncryptedField(birthdayString);
    const encryptedDateSubscribe =
      this.createEncryptedField(dateSubscribeString);
    const encryptedName = this.createEncryptedField(createUserDto.name);
    const encryptedFirstName = this.createEncryptedField(
      createUserDto.firstname,
    );

    // Créer le identifier
    const identifier = this.createidentifier(createUserDto.email);

    // Hashage Mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Vérifier si un utilisateur avec le même identifier existe déjà

    const existingUser = await this.userRepository
      .createQueryBuilder('users')
      .where("users.email->>'identifier' = :identifier", {
        identifier,
      })
      .getOne();

    // Si un utilisateur existe déjà avec le même identifier, renvoyer une erreur
    if (existingUser) {
      throw new Error('Cette adresse E-mail est déjà utilisée.');
    }

    const decryptedEmail = createUserDto.email;

    // Créer la nouvelle entité utilisateur
    const newUser = this.userRepository.create({
      gender: createUserDto.gender,
      firstname: {
        identifier: encryptedFirstName,
        data: encryptedFirstName,
      },
      name: {
        identifier: encryptedName,
        data: encryptedName,
      },
      password: hashedPassword,
      email: {
        identifier: identifier,
        data: this.createdata(createUserDto.email),
      },
      birthday: {
        identifier: encryptedBirthday,
        data: encryptedBirthday,
      },
      date_subscribe: {
        identifier: encryptedDateSubscribe,
        data: encryptedDateSubscribe,
      },
      role: role,
      isActive: isActive,
    });
    
    await this.mailerService.sendMail({
      to: decryptedEmail,
      subject: 'Confirmation de compte',
      template: 'activation',
      context: {
        email: decryptedEmail,
      },
    });
    

    // Enregistrer et retourner l'utilisateur
    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    // Récupérer tous les utilisateurs depuis la base de données
    const users = await this.userRepository.find();

    // Définir les champs à décrypter
    const fieldsToDecrypt = [
      'email',
      'name',
      'firstname',
      'avatar',
      'birthday',
      'date_subscribe',
      'date_payment',
      'date_end_pay',
      'licence',
      'weight',
      'tel_medic',
      'tel_emergency',
    ];

    // Parcourir chaque utilisateur
    for (const user of users) {
      // Parcourir chaque champ à décrypter
      for (const field of fieldsToDecrypt) {
        if (user[field] && user[field].data) {
          const decryptedField = this.decryptField(user[field].data);
          user[field].data = decryptedField;
        }
      }
    }

    // Retourner les utilisateurs avec les données décryptées
    return users;
  }

  async findOne(id: number): Promise<User | undefined> {
    // Récupérer l'utilisateur depuis la base de données
    const user = await this.userRepository.findOne({ where: { id } });

    // Vérifier si l'utilisateur n'existe pas
    if (!user) {
      return undefined;
    }

    // Déchiffrer les champs encryptés s'ils sont non null
    if (user.email?.data) {
      user.email.data = this.decryptField(user.email.data);
    }
    if (user.weight?.data) {
      user.weight.data = this.decryptField(user.weight.data)
    }
    if (user.licence?.data) {
      user.licence.data = this.decryptField(user.licence.data);
    }
    if (user.name?.data) {
      user.name.data = this.decryptField(user.name.data);
    }
    if (user.firstname?.data) {
      user.firstname.data = this.decryptField(user.firstname.data);
    }
    if (user.tel_medic?.data) {
      user.tel_medic.data = this.decryptField(user.tel_medic.data);
    }
    if (user.tel_emergency?.data) {
      user.tel_emergency.data = this.decryptField(user.tel_emergency.data);
    }
    if (user.avatar?.data) {
      user.avatar.data = this.decryptField(user.avatar.data);
    }
    if (user.date_end_pay?.data) {
      user.date_end_pay.data = this.decryptField(user.date_end_pay.data);
    }
    if (user.date_payment?.data) {
      user.date_payment.data = this.decryptField(user.date_payment.data);
    }
    if (user.date_subscribe?.data) {
      user.date_subscribe.data = this.decryptField(user.date_subscribe.data);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    // Créer le identifier à partir de l'e-mail fourni
    const identifier = this.createidentifier(email);

    // Rechercher l'utilisateur dans la base de données en utilisant le identifier
    const user = await this.userRepository
      .createQueryBuilder('users')
      .where("users.email->>'identifier' = :identifier", {
        identifier,
      })
      .getOne();

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User | undefined> {
    // Récupérer l'utilisateur existant
    const user = await this.userRepository.findOne({ where: { id } });

    // Vérifier si l'utilisateur existe
    if (!user) {
      throw new Error('Aucun utilisateur trouvé.');
    }
    console.log("new password :"+updateUserDto.password)
    // Mettre à jour le mot de passe s'il est fourni
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);

      user.password = hashedPassword;
    }

    // Crypter les autres champs s'ils sont non null
    if (updateUserDto.tel_medic) {
      const telMedicEncrypt = this.createEncryptedField(
        updateUserDto.tel_medic,
      );
      user.tel_medic = {
        identifier: telMedicEncrypt,
        data: telMedicEncrypt,
      };
    }
    if (updateUserDto.tel_emergency) {
      const telEmergencyEncrypt = this.createEncryptedField(
        updateUserDto.tel_emergency,
      );
      user.tel_emergency = {
        identifier: telEmergencyEncrypt,
        data: telEmergencyEncrypt,
      };
    }
    if (updateUserDto.weight) {
      const weightEncrypt = this.createEncryptedField(
        updateUserDto.weight.toString(),
      );
      user.weight = {
        identifier: weightEncrypt,
        data: weightEncrypt,
      };
    }
    if (updateUserDto.licence) {
      const licenceEncrypt = this.createEncryptedField(
        updateUserDto.licence.toString(),
      );
      user.licence = {
        identifier: licenceEncrypt,
        data: licenceEncrypt,
      };
    }
    if (updateUserDto.date_payment) {
      const datePaymentEncrypt = this.createEncryptedField(
        updateUserDto.date_payment.toString(),
      );
      user.date_payment = {
        identifier: datePaymentEncrypt,
        data: datePaymentEncrypt,
      };
    }
    if (updateUserDto.date_end_pay) {
      const dateEndPayEncrypt = this.createEncryptedField(
        updateUserDto.date_end_pay.toString(),
      );
      user.date_end_pay = {
        identifier: dateEndPayEncrypt,
        data: dateEndPayEncrypt,
      };
    }
    if (updateUserDto.avatar) {
      const avatarEncrypt = this.createEncryptedField(updateUserDto.avatar);
      user.avatar = {
        identifier: avatarEncrypt,
        data: avatarEncrypt,
      };
    }

    // Enregistrer les modifications
    await this.userRepository.save(user);

    // Retourner l'utilisateur mis à jour
    return user;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);

    const decryptedEmail = this.decryptField(user.email.data);

    await this.mailerService.sendMail({
      to: decryptedEmail,
      subject: 'Suppression de compte',
      template: 'suppression',
      context: {
        email: decryptedEmail,
      },
    });
    await this.userRepository.delete(id);
  }

  async requestPasswordReset(email: string): Promise<void> {
    // Rechercher l'utilisateur par email et récupérer son ID
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('Utilisateur non trouvé.');
    }

    // Générer un token unique et le stocker dans la table de réinitialisation de mot de passe
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 600000); // 10 minutes
    await this.resetPasswordRepository.save({
      userId: user.id,
      token: resetToken,
      expires: resetExpires,
    });

    const decryptedEmail = this.decryptField(user.email.data);

    // Envoyer un email à l'utilisateur avec le lien de réinitialisation
    const resetUrl = `https://localhost:3000/resetpassword/${resetToken}`;

    await this.mailerService.sendMail({
      to: decryptedEmail,
      subject: 'Réinitialisation du mot de passe',
      template: 'reset-password',
      context: {
        email: decryptedEmail,
        resetUrl: resetUrl,
      },
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Rechercher le token dans la table de réinitialisation de mot de passe
    const resetRecord = await this.resetPasswordRepository.findOne({
      where: { token },
    });
    if (!resetRecord || resetRecord.expires < new Date()) {
      throw new Error('Token de réinitialisation invalide ou expiré.');
    }

    // Mettre à jour le mot de passe de l'utilisateur et supprimer l'enregistrement de réinitialisation
    const user = await this.findOne(resetRecord.userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé.');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    await this.resetPasswordRepository.delete(resetRecord.id);
  }
}
