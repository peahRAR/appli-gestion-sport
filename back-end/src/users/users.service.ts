import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { ConfigService } from '@nestjs/config';
import { promisify } from 'util';
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  private readonly salt: string;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    this.salt = this.configService.get<string>('SALT');
  }

  private createMailIdentifier(email: string): string {
    const secretKey = this.configService.get<string>('PASSWORDMAIL');
    return crypto.createHmac('sha256', secretKey).update(email).digest('hex');
  }

  private createMailData(email: string): string {
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

  private decryptField(encryptedData: string): string {
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
    // Date anniversaire
    const birthdayString = createUserDto.birthday.toString();

    // Date création de compte
    const dateSubscribeString = new Date().toString();

    // Créer les champs encryptés
    const encryptedBirthday = this.createEncryptedField(birthdayString);
    const encryptedDateSubscribe =
      this.createEncryptedField(dateSubscribeString);

    // Créer le mailIdentifier
    const mailIdentifier = this.createMailIdentifier(createUserDto.email);

    // Hashage Mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Créer la nouvelle entité utilisateur
    const newUser = this.userRepository.create({
      gender: createUserDto.gender,
      firstname: createUserDto.firstname,
      name: createUserDto.name,
      password: hashedPassword,
      email: {
        mailIdentifier: mailIdentifier,
        mailData: this.createMailData(createUserDto.email),
      },
      birthday: {
        identifier: encryptedBirthday,
        data: encryptedBirthday,
      },
      date_subscribe: {
        identifier: encryptedDateSubscribe,
        data: encryptedDateSubscribe,
      },
    });

    // Enregistrer et retourner l'utilisateur
    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    // Récupérer tous les utilisateurs depuis la base de données
    const users = await this.userRepository.find();

    // Parcourir chaque utilisateur
    for (const user of users) {
      // Décrypter l'email s'il n'est pas null
      if (user.email && user.email.mailData) {
        const decryptedEmail = this.decryptField(user.email.mailData);
        user.email.mailData = decryptedEmail;
      }

      // Décrypter la date de naissance s'il n'est pas null
      if (user.birthday && user.birthday.data) {
        const decryptedBirthday = this.decryptField(user.birthday.data);
        user.birthday.data = decryptedBirthday;
      }

      // Décrypter la date d'inscription s'il n'est pas null
      if (user.date_subscribe && user.date_subscribe.data) {
        const decryptedDateSubscribe = this.decryptField(
          user.date_subscribe.data,
        );
        user.date_subscribe.data = decryptedDateSubscribe;
      }

      // Décrypter la date de paiment s'il n'est pas null
      if (user.date_payment && user.date_payment.data) {
        const decryptedDatePayment = this.decryptField(
          user.date_payment.data,
        );
        user.date_payment.data = decryptedDatePayment;
      }

      // Décrypter la date de fin de paiment s'il n'est pas null
      if (user.date_end_pay && user.date_end_pay.data) {
        const decryptedDateEndPay = this.decryptField(
          user.date_end_pay.data,
        );
        user.date_end_pay.data = decryptedDateEndPay;
      }

      // Décrypter la licence s'il n'est pas null
      if (user.licence && user.licence.data) {
        const decryptedLicence = this.decryptField(
          user.licence.data,
        );
        user.licence.data = decryptedLicence;
      }

      // Décrypter le poids s'il n'est pas null
      if (user.weight && user.weight.data) {
        const decryptedWeight = this.decryptField(
          user.weight.data,
        );
        user.weight.data = decryptedWeight;
      }

      // Décrypter le numéro medecin s'il n'est pas null
      if (user.tel_medic && user.tel_medic.data) {
        const decryptedTelMedic = this.decryptField(
          user.tel_medic.data,
        );
        user.tel_medic.data = decryptedTelMedic;
      }

      // Décrypter le numéro de tel d'urgence s'il n'est pas null
      if (user.tel_emergency && user.tel_emergency.data) {
        const decryptedTelEmergency = this.decryptField(
          user.tel_emergency.data,
        );
        user.tel_emergency.data = decryptedTelEmergency;
      }

      
    }

    // Retourner les utilisateurs avec les données décryptées
    return users;
  }

  async findOne(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    console.log('coucou');

    // Créer le mailIdentifier à partir de l'e-mail fourni
    const mailIdentifier = this.createMailIdentifier(email);

    // Rechercher l'utilisateur dans la base de données en utilisant le mailIdentifier
    return this.userRepository.findOne({
      where: { email: { mailIdentifier } },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | undefined> {
    // Récupérer l'utilisateur existant
    const user = await this.userRepository.findOne({ where: { id } });

    // Vérifier si l'utilisateur existe
    if (!user) {
       throw new Error('Utilisateur non trouvé');
    }

    // Mettre à jour le mot de passe s'il est fourni
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      user.password = hashedPassword;
    }

    // Crypter les autres champs s'ils sont non null
    if (updateUserDto.tel_medic) {
      const telMedicEncrypt = this.createEncryptedField(updateUserDto.tel_medic);
      user.tel_medic = {
        identifier: telMedicEncrypt,
        data: telMedicEncrypt,
      };
    }
    if (updateUserDto.tel_emergency) {
      const telEmergencyEncrypt = this.createEncryptedField(updateUserDto.tel_emergency);
      user.tel_emergency = {
        identifier: telEmergencyEncrypt,
        data: telEmergencyEncrypt,
      };
    }
    if (updateUserDto.weight) {
      const weightEncrypt = this.createEncryptedField(updateUserDto.weight.toString());
      user.weight = {
        identifier: weightEncrypt,
        data: weightEncrypt,
      };
    }
    if (updateUserDto.licence) {
      const licenceEncrypt = this.createEncryptedField(updateUserDto.licence.toString());
      user.licence = {
        identifier: licenceEncrypt,
        data: licenceEncrypt,
      };
    }
    if (updateUserDto.date_payment) {
      const datePaymentEncrypt = this.createEncryptedField(updateUserDto.date_payment.toString());
      user.date_payment = {
        identifier: datePaymentEncrypt,
        data: datePaymentEncrypt,
      };
    }
    if (updateUserDto.date_end_pay) {
      const dateEndPayEncrypt = this.createEncryptedField(updateUserDto.date_end_pay.toString());
      user.date_end_pay = {
        identifier: dateEndPayEncrypt,
        data: dateEndPayEncrypt,
      };
    }
  
    // Enregistrer les modifications
    await this.userRepository.save(user);
  
    // Retourner l'utilisateur mis à jour
    return user;
}


  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
