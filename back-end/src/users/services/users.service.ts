import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
import * as disposableEmailDomains from 'disposable-email-domains';
import { JwtService } from '@nestjs/jwt';
import { ListsMembersService } from 'src/lists-members/lists-members.service';
import { ResetPassword } from '../entities/reset-password.entity';
import { EncryptionService } from './encryption.service';
import { EmailService } from './email.service';
import { UserLicense } from '../entities/user-license.entity';
import { Federation } from '../../federations/federations.entity';


@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ResetPassword)
    private readonly resetPasswordRepository: Repository<ResetPassword>,

    @InjectRepository(UserLicense)
    private readonly userLicenseRepo: Repository<UserLicense>,

    @InjectRepository(Federation)
    private readonly fedRepo: Repository<Federation>,

    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => ListsMembersService))
    private readonly listsMembersService: ListsMembersService,
    private readonly encryptionService: EncryptionService,
    private readonly emailService: EmailService,
  ) { }

  verifyPasswordRegex(password: string): boolean {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  async listFederations() {
    return this.fedRepo.find({ order: { code: 'ASC' } });
  }


  async getUserLicenses(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['licenses', 'licenses.federation'],
    });
    if (!user) throw new NotFoundException('User not found');

    // Licences modernes -> ajoute number_plain (avec try/catch)
    // number_encrypted is already decrypted by the @EncryptedColumn transformer.
    const modern = (user.licenses ?? []).map((lic) => {
      return {
        id: lic.id,
        federation: {
          id: lic.federation.id,
          code: lic.federation.code,
          name: lic.federation.name,
        },
        number_encrypted: lic.number_encrypted,
        number_plain: lic.number_encrypted ?? '', // ← important pour le front
        createdAt: lic.createdAt,
        valid_from: lic.valid_from ?? null,
        valid_to: lic.valid_to ?? null,
        isLegacy: false,
      };
    });

    // Fallback LEGACY (on le renvoie aussi) — user.license is already decrypted.
    const legacy: any[] = [];
    if (user.license) {
      const legacyPlain = user.license;
      legacy.push({
        id: 'legacy',
        federation: { code: 'LEGACY', name: 'Licence importée (ancien champ)' },
        number_encrypted: user.license,
        number_plain: legacyPlain,      // ← dispo si le déchiffrement passe
        createdAt: new Date(),
        isLegacy: true,
      });
    }

    return [...modern, ...legacy];
  }


  async upsertUserLicense(
    userId: string,
    federationCode: string,
    licensePlainNumber: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const federation = await this.fedRepo.findOne({ where: { code: federationCode } });
    if (!federation) throw new BadRequestException('Fédération inconnue');

    // number_encrypted is encrypted automatically on save by the @EncryptedColumn transformer.
    let lic = await this.userLicenseRepo.findOne({
      where: { user: { id: userId }, federation: { id: federation.id } },
      relations: ['user', 'federation'],
    });

    if (!lic) {
      lic = this.userLicenseRepo.create({
        user,
        federation,
        number_encrypted: licensePlainNumber,
      });
    } else {
      lic.number_encrypted = licensePlainNumber;
    }

    return this.userLicenseRepo.save(lic);
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
        throw new BadRequestException('Un superAdmin existe déjà.');
      }
    }

    const emailDomain = createUserDto.email.split('@')[1];
    if (disposableEmailDomains.includes(emailDomain)) {
      throw new BadRequestException('Le domaine de l\'email n\'est pas autorisé.');
    }

    // Convertir la date anniversaire en objet Date
    const birthdayDate = new Date(createUserDto.birthday);
    if (isNaN(birthdayDate.getTime())) {
      throw new BadRequestException('Date de naissance invalide.');
    }

    const birthdayString = birthdayDate.toISOString();

    // Date création de compte
    const dateSubscribeString = new Date().toISOString();

    if (!this.verifyPasswordRegex(createUserDto.password)) {
      throw new BadRequestException('Le mot de passe ne correspond pas aux critères requis.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Duplicate-email check compares raw ciphertext via a query builder predicate,
    // so it needs the email encrypted manually (bypasses entity persistence, where
    // @EncryptedColumn would normally handle it automatically).
    const encryptedEmailForLookup = this.encryptionService.encryptField(createUserDto.email, true);
    const existingUser = await this.userRepository
      .createQueryBuilder('users')
      .where("users.email->>'data' = :data", { data: encryptedEmailForLookup.data })
      .getOne();

    if (existingUser) {
      throw new BadRequestException('Cette adresse E-mail est déjà utilisée.');
    }

    const newUser = this.userRepository.create({
      gender: createUserDto.gender,
      firstname: createUserDto.firstname,
      name: createUserDto.name,
      password: hashedPassword,
      email: createUserDto.email,
      birthday: birthdayString,
      date_subscribe: dateSubscribeString,
      role: role,
      isActive: isActive,
      approove_rules: createUserDto.approove_rules,
    });

    await this.emailService.sendConfirmationEmail(createUserDto.email);

    const savedUser = await this.userRepository.save(newUser);
    return savedUser;
  }

  async findAll(): Promise<User[]> {
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
    return users;
  }

  async findOne(id: string): Promise<User | undefined> {
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
        'approove_rules'
      ],
    });

    if (!user) {
      return undefined;
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    // Raw predicate against the ciphertext, so the search value needs to be
    // encrypted manually the same way @EncryptedColumn would for a save.
    const encryptedEmail = this.encryptionService.encryptField(email, true);

    const user = await this.userRepository
      .createQueryBuilder('users')
      .where("users.email->>'data' = :data", { data: encryptedEmail.data })
      .getOne();

    return user;
  }

async update(id: string, updateUserDto: UpdateUserDto): Promise<User | undefined> {
  this.logger.log(`update() called for id=${id}`);

  const user = await this.userRepository.findOne({ where: { id } });
  if (!user) {
    throw new Error('Aucun utilisateur trouvé.');
  }

  // ————— Password flow (inchangé) —————
  if (updateUserDto.password) {
    if (!updateUserDto.currentPassword) {
      throw new BadRequestException(
        'Le mot de passe actuel est requis pour changer le mot de passe.',
      );
    }

    const isPasswordValid =
      (await bcrypt.compare(updateUserDto.currentPassword, user.password)) ||
      updateUserDto.currentPassword === this.configService.get<string>('REINITIALIZATIONKEY');

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect.');
    }

    user.password = await bcrypt.hash(updateUserDto.password, 10);
  }

  // ————— Helpers —————
  const has = (k: keyof UpdateUserDto) =>
    Object.prototype.hasOwnProperty.call(updateUserDto, k);

  const toIso = (v: string | Date | null | undefined) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const d = new Date(v as any);
    if (isNaN(+d)) throw new BadRequestException('Date invalide');
    return d.toISOString();
  };

  // ————— Build dto à chiffrer —————
  const userDto = {
    email: has('email') ? updateUserDto.email : user.email,
    name: has('name') ? updateUserDto.name : user.name,
    firstname: has('firstname') ? updateUserDto.firstname : user.firstname,

    birthday: has('birthday') ? toIso(updateUserDto.birthday as any) : user.birthday,
    date_payment: has('date_payment') ? toIso(updateUserDto.date_payment as any) : user.date_payment,
    date_end_pay: has('date_end_pay') ? toIso(updateUserDto.date_end_pay as any) : user.date_end_pay,

    tel_num: has('tel_num') ? updateUserDto.tel_num : user.tel_num,
    tel_medic: has('tel_medic') ? updateUserDto.tel_medic : user.tel_medic,
    tel_emergency: has('tel_emergency') ? updateUserDto.tel_emergency : user.tel_emergency,
    weight: has('weight') ? (updateUserDto.weight as any) : user.weight,
    avatar: has('avatar') ? updateUserDto.avatar : user.avatar,
    approove_rules: has('approove_rules') ? updateUserDto.approove_rules : user.approove_rules,

    date_subscribe: user.date_subscribe,
  };

  // userDto only holds plain strings (either from the DTO, or from `user`, which
  // was already decrypted by the @EncryptedColumn transformer above) — saving
  // re-encrypts automatically, no manual encryption needed.
  Object.assign(user, userDto);

  await this.userRepository.save(user);

  // ✅ IMPORTANT : refetch (retour cohérent avec findOne, already decrypted)
  const fresh = await this.userRepository.findOne({
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
      'approove_rules',
      'isActive',
    ],
  });

  if (!fresh) return undefined;

  this.logger.log(
    `returning decrypted firstname/name types: ${typeof fresh.firstname}/${typeof fresh.name}`,
  );

  return fresh;
}



  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('Utilisateur non trouvé.');
    }

    const payload = { sub: user.id, email: user.email };
    const resetToken = await this.jwtService.signAsync(payload);

    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    const resetRecord = new ResetPassword();
    resetRecord.token = resetToken;
    resetRecord.userId = user.id;
    resetRecord.expires = expires;

    await this.resetPasswordRepository.save(resetRecord);

    // user.email is already decrypted by the @EncryptedColumn transformer.
    const resetUrl = `https://app.mmabaisieux.fr/reset-password/?token=${resetToken}`;

    await this.emailService.sendResetPasswordEmail(user.email, resetUrl);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    let userId: string;
    try {
      const payload = this.jwtService.verify(token);
      userId = payload.sub;
    } catch (error) {
      throw new UnauthorizedException('Token invalide ou expiré.');
    }

    const resetRecord = await this.resetPasswordRepository.findOne({ where: { token } });

    if (!resetRecord || resetRecord.expires < new Date()) {
      throw new Error('Token de réinitialisation invalide ou expiré.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Utilisateur non trouvé.');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    await this.resetPasswordRepository.delete(resetRecord.id);
  }
}