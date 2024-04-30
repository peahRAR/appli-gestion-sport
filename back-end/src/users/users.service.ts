import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPassword } from './reset-password.entity';
import { JwtService } from '@nestjs/jwt';
import { SecretsService } from 'src/secrets/secrets.service';

@Injectable()
export class UsersService {
  private salt: string;

  constructor(
    @InjectRepository(ResetPassword)
    private readonly resetPasswordRepository: Repository<ResetPassword>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly secretsService: SecretsService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {
    this.initialize();
  }

  private async createIdentifier(email: string): Promise<string> {
    const secretKey = await this.secretsService.getSecret('PASSWORDMAIL');
    return crypto.createHmac('sha256', secretKey).update(email).digest('hex');
  }

  async initialize() {
    this.salt = await this.secretsService.getSecret('SALT');
  }

  private async createEncryptedField(data: string): Promise<string> {
    const secret = await this.secretsService.getSecret('ENCRYPTION_KEY');
    const key = crypto.scryptSync(secret, this.salt, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  public async decryptField(encryptedData: string): Promise<string> {
    const [ivString, encryptedString] = encryptedData.split(':');
    const iv = Buffer.from(ivString, 'hex');
    const secret = await this.secretsService.getSecret('ENCRYPTION_KEY');
    const key = crypto.scryptSync(secret, this.salt, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(false);
    let decrypted = decipher.update(Buffer.from(encryptedString, 'hex'), null, 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }

  // Méthode pour vérifier si le mot de passe correspond à la regex
  verifyPasswordRegex(password: string): boolean {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
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
    const encryptedBirthday = await this.createEncryptedField(birthdayString);
    const encryptedDateSubscribe =
      await this.createEncryptedField(dateSubscribeString);
    const encryptedName = await this.createEncryptedField(createUserDto.name);
    const encryptedFirstName = await this.createEncryptedField(
      createUserDto.firstname,
    );
    const emailData = await this.createEncryptedField(createUserDto.email)

    const encryptedEmail = await this.createIdentifier(createUserDto.email);

    // Verifier que mdp correspond à la regex sinon lever erreur
    if (!this.verifyPasswordRegex(createUserDto.password)) {
      throw new Error('Le mot de passe ne correspond pas aux critères requis.');
    }

    // Hashage Mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const existingUser = await this.userRepository
      .createQueryBuilder('users')
      .where("users.email->>'identifier' = :identifier", {
        identifier: encryptedEmail,
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
        identifier: encryptedEmail,
        data: emailData,
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
    const users = await this.userRepository.find({
      select: [
        'id',
        'isActive',
        'birthday',
        'email',
        'gender',
        'weight',
        'license',
        'name',
        'firstname',
        'tel_num',
        'tel_medic',
        'tel_emergency',
        'avatar',
        'date_end_pay',
        'date_payment',
        'date_subscribe',
        'role',
      ],
    });

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
      'license',
      'weight',
      'tel_num',
      'tel_medic',
      'tel_emergency',
    ];

    // Parcourir chaque utilisateur
    for (const user of users) {
      // Parcourir chaque champ à décrypter
      for (const field of fieldsToDecrypt) {
        if (user[field] && user[field].data) {
          const decryptedField = this.decryptField(user[field].data);
          user[field] = decryptedField;
        }
      }
    }

    // Retourner les utilisateurs avec les données décryptées
    return users;
  }

  async findOne(id: number): Promise<User | undefined> {
    // Récupérer l'utilisateur depuis la base de données
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'birthday',
        'gender',
        'weight',
        'license',
        'name',
        'firstname',
        'tel_num',
        'tel_medic',
        'tel_emergency',
        'avatar',
        'date_end_pay',
        'date_payment',
        'date_subscribe',
        'role',
      ],
    });

    const fieldsToDecrypt = [
      'email',
      'name',
      'firstname',
      'avatar',
      'birthday',
      'date_subscribe',
      'date_payment',
      'date_end_pay',
      'license',
      'weight',
      'tel_num',
      'tel_medic',
      'tel_emergency',
    ];

    // Vérifier si l'utilisateur n'existe pas
    if (!user) {
      return undefined;
    }

    for (const field of fieldsToDecrypt) {
      if (user[field] && user[field].data) {
        const decryptedField = this.decryptField(user[field].data);
        user[field] = decryptedField;
      }
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    // Créer le identifier à partir de l'e-mail fourni
    const identifier = await this.createIdentifier(email);

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

    // Mettre à jour le mot de passe s'il est fourni
    if (updateUserDto.password) {
      // Vérifier si le mot de passe actuel est fourni
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException(
          'Le mot de passe actuel est requis pour changer le mot de passe.',
        );
      }

      // Comparer le mot de passe actuel fourni avec le mot de passe actuel de l'utilisateur
      const isPasswordValid =
        (await bcrypt.compare(updateUserDto.currentPassword, user.password)) ||
        updateUserDto.currentPassword ===
          this.secretsService.getSecret('REINITIALIZATIONKEY');
      if (!isPasswordValid) {
        throw new UnauthorizedException('Mot de passe actuel incorrect.');
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);

      // Mettre à jour le mot de passe de l'utilisateur
      user.password = hashedPassword;
    }

    // Crypter les autres champs s'ils sont non null
    if (updateUserDto.name) {
      const nameEncrypt = await this.createEncryptedField(updateUserDto.name);
      user.name = {
        identifier: nameEncrypt,
        data: nameEncrypt,
      };
    }
    if (updateUserDto.firstname) {
      const firstnameEncrypt = await this.createEncryptedField(
        updateUserDto.firstname,
      );
      user.firstname = {
        identifier: firstnameEncrypt,
        data: firstnameEncrypt,
      };
    }
    if (updateUserDto.tel_num) {
      const telNumEncrypt = await this.createEncryptedField(updateUserDto.tel_num);
      user.tel_num = {
        identifier: telNumEncrypt,
        data: telNumEncrypt,
      };
    }
    if (updateUserDto.tel_medic) {
      const telMedicEncrypt = await this.createEncryptedField(
        updateUserDto.tel_medic,
      );
      user.tel_medic = {
        identifier: telMedicEncrypt,
        data: telMedicEncrypt,
      };
    }
    if (updateUserDto.tel_emergency) {
      const telEmergencyEncrypt = await this.createEncryptedField(
        updateUserDto.tel_emergency,
      );
      user.tel_emergency = {
        identifier: telEmergencyEncrypt,
        data: telEmergencyEncrypt,
      };
    }
    if (updateUserDto.weight) {
      const weightEncrypt = await this.createEncryptedField(
        updateUserDto.weight.toString(),
      );
      user.weight = {
        identifier: weightEncrypt,
        data: weightEncrypt,
      };
    }
    if (updateUserDto.license) {
      const licenseEncrypt = await this.createEncryptedField(
        updateUserDto.license.toString(),
      );
      user.license = {
        identifier: licenseEncrypt,
        data: licenseEncrypt,
      };
    }
    if (updateUserDto.date_payment) {
      const datePaymentEncrypt = await this.createEncryptedField(
        updateUserDto.date_payment.toString(),
      );
      user.date_payment = {
        identifier: datePaymentEncrypt,
        data: datePaymentEncrypt,
      };
    }
    if (updateUserDto.date_end_pay) {
      const dateEndPayEncrypt = await this.createEncryptedField(
        updateUserDto.date_end_pay.toString(),
      );
      user.date_end_pay = {
        identifier: dateEndPayEncrypt,
        data: dateEndPayEncrypt,
      };
    }
    if (updateUserDto.avatar) {
      const avatarEncrypt = await this.createEncryptedField(updateUserDto.avatar);
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
    const userEmail = user.email.toString();

    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Suppression de compte',
      template: 'suppression',
      context: {
        email: user.email,
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
    const payload = { sub: user.id, email: user.email }; // Utilisez les informations appropriées de l'utilisateur
    const resetToken = await this.jwtService.signAsync(payload);

    const decryptedEmail = await this.decryptField(user.email.data);

    // Envoyer un email à l'utilisateur avec le lien de réinitialisation
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

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
