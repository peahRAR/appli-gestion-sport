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

  async initialize() {
    this.salt = await this.secretsService.getSecret('SALT');
  }

  private async createIdentifier(email: string): Promise<string> {
    const secretKey = await this.secretsService.getSecret('PASSWORDMAIL');
    return crypto.createHmac('sha256', secretKey).update(email).digest('hex');
  }

  private async createEncryptedField(data: string, isEmail: boolean = false): Promise<string> {
    console.log("Crypt")
    // Initialisation par défaut avec la clé et l'IV pour les cas généraux
    const secret = await this.secretsService.getSecret('ENCRYPTION_KEY');
    let key = crypto.scryptSync(secret, this.salt, 32);
    let iv = crypto.randomBytes(16);

    // Si c'est un email, utiliser une clé spécifique et un IV fixe
    if (isEmail) {
      console.log("email")
      const secretKey = await this.secretsService.getSecret('PASSWORDMAIL');
      key = crypto.scryptSync(secretKey, this.salt, 32);
      iv = Buffer.from('unIVfixe16octets'); // Corrigé pour être exactement 16 octets
    }

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  splitEncryptedField(encryptedData: string): object {
    const [identifier, data] = encryptedData.split(':');
    return { identifier, data }
  }

  public async decryptField(encryptedObj: { identifier: string, data: string }, isEmail: boolean = false): Promise<string> {
    // Récupérer l'IV et les données cryptées depuis l'objet
    const { identifier, data } = encryptedObj;

    // Initialisation par défaut en utilisant la clé de cryptage générale
    const defaultSecret = await this.secretsService.getSecret('ENCRYPTION_KEY');
    let key = crypto.scryptSync(defaultSecret, this.salt, 32);
    console.log("identifier : " + identifier);
    console.log("data : " + data)
    const iv = Buffer.from(identifier, 'hex');  // Convertir l'IV hexadécimal en Buffer

    // Condition spécifique pour les emails
    if (isEmail) {
      const emailSecretKey = await this.secretsService.getSecret('PASSWORDMAIL');
      key = crypto.scryptSync(emailSecretKey, this.salt, 32);
      // L'IV est déjà fixé lors du cryptage pour les emails
    }

    // Créer un déchiffreur avec l'algorithme, la clé, et l'IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    console.log('Data to decrypt:', data);
    let decrypted = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');  // Concaténer le résultat final au texte déchiffré

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
    const encryptedBirthday = this.splitEncryptedField(await this.createEncryptedField(birthdayString));
    const encryptedDateSubscribe =
      this.splitEncryptedField(await this.createEncryptedField(dateSubscribeString));
    const encryptedName = this.splitEncryptedField(await this.createEncryptedField(createUserDto.name));
    const encryptedFirstName = this.splitEncryptedField(await this.createEncryptedField(
      createUserDto.firstname)
    );
    const encryptedEmail = this.splitEncryptedField(await this.createEncryptedField(createUserDto.email, true));




    // Verifier que mdp correspond à la regex sinon lever erreur
    if (!this.verifyPasswordRegex(createUserDto.password)) {
      throw new Error('Le mot de passe ne correspond pas aux critères requis.');
    }

    // Hashage Mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    console.log(" Email crypt : ")
    console.log(encryptedEmail)
    const existingUser = await this.userRepository
      .createQueryBuilder('users')
      .where("users.email->>'data' = :data", { data: (encryptedEmail as { data: string }).data })
      .getOne();
    
    console.log( "existant : " + existingUser)
    console.log( existingUser)

    // Si un utilisateur existe déjà avec le même identifier, renvoyer une erreur
    if (existingUser) {
      throw new Error('Cette adresse E-mail est déjà utilisée.');
    }

    const decryptedEmail = createUserDto.email;


    // Créer la nouvelle entité utilisateur
    const newUser = this.userRepository.create({
      gender: createUserDto.gender,
      firstname: encryptedFirstName,
      name: encryptedName,
      password: hashedPassword,
      email: encryptedEmail,
      birthday: encryptedBirthday,
      date_subscribe: encryptedDateSubscribe,
      role: role,
      isActive: isActive,
    });

    console.log(decryptedEmail)
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
          const isEmail = field === 'email';
          const decryptedField = await this.decryptField({ identifier: user[field].identifier, data: user[field].data }, isEmail);
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
        const isEmail = field === 'email';
        const decryptedField = await this.decryptField({ identifier: user[field].identifier, data: user[field].data }, isEmail);
        user[field] = decryptedField;
      }
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    // Créer le identifier à partir de l'e-mail fourni
    const encryptedEmail = await this.splitEncryptedField(await this.createEncryptedField(email, true));

    // Rechercher l'utilisateur dans la base de données en utilisant le identifier
    const user = await this.userRepository
      .createQueryBuilder('users')
      .where("users.email->>'identifier' = :identifier", { identifier: (encryptedEmail as { identifier: string }).identifier })
      .getOne();

    console.log(user)
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

    interface EncryptedField {
      identifier: string;
      data: string;
    }

    // Crypter les autres champs s'ils sont non null
    if (updateUserDto.name) {
      const nameEncrypt = this.splitEncryptedField(await this.createEncryptedField(updateUserDto.name)) as EncryptedField;
      user.name = {
        identifier: nameEncrypt.identifier,
        data: nameEncrypt.data,
      };
    }
    if (updateUserDto.firstname) {
      const firstnameEncrypt = this.splitEncryptedField(await this.createEncryptedField(
        updateUserDto.firstname)
      ) as EncryptedField;
      user.firstname = {
        identifier: firstnameEncrypt.identifier,
        data: firstnameEncrypt.data,
      };
    }
    if (updateUserDto.tel_num) {
      const telNumEncrypt = this.splitEncryptedField(await this.createEncryptedField(updateUserDto.tel_num)) as EncryptedField;
      user.tel_num = {
        identifier: telNumEncrypt.identifier,
        data: telNumEncrypt.data,
      };
    }
    if (updateUserDto.tel_medic) {
      const telMedicEncrypt = this.splitEncryptedField(await this.createEncryptedField(
        updateUserDto.tel_medic)) as EncryptedField
        ;
      user.tel_medic = {
        identifier: telMedicEncrypt.identifier,
        data: telMedicEncrypt.data,
      };
    }
    if (updateUserDto.tel_emergency) {
      const telEmergencyEncrypt = this.splitEncryptedField(await this.createEncryptedField(
        updateUserDto.tel_emergency)
      ) as EncryptedField;
      user.tel_emergency = {
        identifier: telEmergencyEncrypt.identifier,
        data: telEmergencyEncrypt.data,
      };
    }
    if (updateUserDto.weight) {
      const weightEncrypt = this.splitEncryptedField(await this.createEncryptedField(
        updateUserDto.weight.toString())
      ) as EncryptedField;
      user.weight = {
        identifier: weightEncrypt.identifier,
        data: weightEncrypt.data,
      };
    }
    if (updateUserDto.license) {
      const licenseEncrypt = this.splitEncryptedField( await this.createEncryptedField(
        updateUserDto.license.toString())
      ) as EncryptedField;
      user.license = {
        identifier: licenseEncrypt.identifier,
        data: licenseEncrypt.data,
      };
    }
    if (updateUserDto.date_payment) {
      const datePaymentEncrypt = this.splitEncryptedField( await this.createEncryptedField(
        updateUserDto.date_payment.toString())
      ) as EncryptedField;
      user.date_payment = {
        identifier: datePaymentEncrypt.identifier,
        data: datePaymentEncrypt.data,
      };
    }
    if (updateUserDto.date_end_pay) {
      const dateEndPayEncrypt = this.splitEncryptedField( await this.createEncryptedField(
        updateUserDto.date_end_pay.toString())
      ) as EncryptedField;
      user.date_end_pay = {
        identifier: dateEndPayEncrypt.identifier,
        data: dateEndPayEncrypt.data,
      };
    }
    if (updateUserDto.avatar) {
      const avatarEncrypt = this.splitEncryptedField( await this.createEncryptedField(updateUserDto.avatar)) as EncryptedField;
      user.avatar = {
        identifier: avatarEncrypt.identifier,
        data: avatarEncrypt.data,
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

    const decryptedEmail = await this.decryptField(user.email, true);

    // Envoyer un email à l'utilisateur avec le lien de réinitialisation
    const resetUrl = `https://app.mmabaisieux.fr/reset-password?token=${resetToken}`;

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
