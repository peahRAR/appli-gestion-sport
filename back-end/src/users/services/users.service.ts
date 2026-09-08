import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
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
import { ListsMembersService } from 'src/lists-members/lists-members.service';
import { ResetPassword } from '../entities/reset-password.entity';
import { EncryptionService } from './encryption.service';
import { EmailService } from './email.service';
import { UserLicense } from '../entities/user-license.entity';
import { Federation } from '../../federations/federations.entity';
import { isValidPassword, PASSWORD_RULE_MESSAGE } from '../../common/validators/password-policy';
import { GRADE_VALUES, FORMATION_VALUES } from '../constants/fmmaf';


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
    @Inject(forwardRef(() => ListsMembersService))
    private readonly listsMembersService: ListsMembersService,
    private readonly encryptionService: EncryptionService,
    private readonly emailService: EmailService,
  ) { }

  verifyPasswordRegex(password: string): boolean {
    return isValidPassword(password);
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
    licensePlainNumber: string | null,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const federation = await this.fedRepo.findOne({ where: { code: federationCode } });
    if (!federation) throw new BadRequestException('Fédération inconnue');

    // Un champ vidé côté front arrive ici en "" ou null : les deux doivent
    // effacer la licence (number_encrypted nullable), pas stocker une chaîne vide.
    const normalizedNumber = licensePlainNumber?.trim() ? licensePlainNumber.trim() : null;

    // number_encrypted is encrypted automatically on save by the @EncryptedColumn transformer.
    let lic = await this.userLicenseRepo.findOne({
      where: { user: { id: userId }, federation: { id: federation.id } },
      relations: ['user', 'federation'],
    });

    if (!lic) {
      lic = this.userLicenseRepo.create({
        user,
        federation,
        number_encrypted: normalizedNumber,
      });
    } else {
      lic.number_encrypted = normalizedNumber;
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

    if (!isValidPassword(createUserDto.password)) {
      throw new BadRequestException(PASSWORD_RULE_MESSAGE);
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

  async findAll(): Promise<any[]> {
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
        'grade',
        'formation',
        'last_login_at',
        'last_course_registration_at',
        'status',
      ],
      relations: ['licenses', 'licenses.federation'],
    });

    // `license` (legacy single-field) can be empty even when a licence
    // exists in the new per-federation system, so also check `licenses`.
    // Only a derived boolean is returned — not the licence numbers
    // themselves, to keep this list endpoint's response as lean as before.
    return users.map(({ licenses, ...user }) => ({
      ...user,
      hasLicense: !!user.license
        || (licenses ?? []).some(l => l.federation?.code !== 'LEGACY' && !!l.number_encrypted),
      hasFmmafLicense: (licenses ?? []).some(l => l.federation?.code === 'FMMAF' && !!l.number_encrypted),
    }));
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
        'approove_rules',
        'grade',
        'formation',
      ],
    });

    if (!user) {
      return undefined;
    }

    return user;
  }

  // Variant used by the self/admin "view one user" route only — adds
  // hasFmmafLicense (needs a licenses+federation join), unlike the plain
  // findOne() above which stays lean since it's also called by JwtStrategy on
  // every authenticated request, and by remove() which needs a real entity.
  async findOneWithFmmafInfo(id: string): Promise<any> {
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
        'approove_rules',
        'grade',
        'formation',
        'push_notifications_enabled',
      ],
      relations: ['licenses', 'licenses.federation'],
    });

    if (!user) {
      return undefined;
    }

    const { licenses, ...rest } = user;
    return {
      ...rest,
      hasFmmafLicense: (licenses ?? []).some(l => l.federation?.code === 'FMMAF' && !!l.number_encrypted),
    };
  }

  async touchLastLogin(userId: string): Promise<void> {
    await this.userRepository.update({ id: userId }, { last_login_at: new Date() });
  }

  // role = 0 (plain member) only — admins/superadmins are never
  // auto-deactivated. Returns the number of accounts deactivated.
  async deactivateInactiveUsers(months: number): Promise<number> {
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() - months);

    // last_login_at IS NULL is excluded on purpose: it means the account was
    // never activated/logged in yet (still gated by the separate `isActive`
    // approval flow), not that it went quiet after being used.
    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ status: 'deactivated_inactivity', deactivated_at: new Date(), deactivation_reason: 'inactivity' })
      .where('role = 0')
      .andWhere('status = :active', { active: 'active' })
      .andWhere('last_login_at < :threshold', { threshold })
      .execute();

    return result.affected ?? 0;
  }

  async findDeactivatedForInactivity(): Promise<User[]> {
    return this.userRepository.find({
      where: { status: 'deactivated_inactivity' },
      select: [
        'id', 'name', 'firstname', 'email',
        'last_login_at', 'last_course_registration_at', 'deactivated_at',
      ],
    });
  }

  async reactivateUser(userId: string): Promise<void> {
    // Reset last_login_at to now so the account isn't immediately
    // re-deactivated by the next run of the inactivity cron.
    await this.userRepository.update(
      { id: userId },
      { status: 'active', deactivated_at: null, deactivation_reason: null, last_login_at: new Date() },
    );
  }

  async touchLastCourseRegistration(userId: string): Promise<void> {
    await this.userRepository.update({ id: userId }, { last_course_registration_at: new Date() });
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

    // Not enforced by UpdateUserDto's decorators: this endpoint receives an
    // untyped body (@Body() body: any) in the controller, so class-validator
    // never runs against UpdateUserDto here — check imperatively instead.
    if (!isValidPassword(updateUserDto.password)) {
      throw new BadRequestException(PASSWORD_RULE_MESSAGE);
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

  if (has('grade')) {
    if (!GRADE_VALUES.includes(updateUserDto.grade as any)) {
      throw new BadRequestException('Grade invalide.');
    }
    (userDto as any).grade = updateUserDto.grade;
  }
  if (has('formation')) {
    if (!FORMATION_VALUES.includes(updateUserDto.formation as any)) {
      throw new BadRequestException('Formation invalide.');
    }
    (userDto as any).formation = updateUserDto.formation;
  }

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
      'grade',
      'formation',
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

  private getResetTokenTtlMinutes(): number {
    const raw = this.configService.get<string>('RESET_PASSWORD_TOKEN_TTL_MINUTES');
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('Utilisateur non trouvé.');
    }

    // Opaque random token — not a JWT, so this flow no longer depends on the
    // login JWT_SECRET/JWT_EXP and doesn't need the client to send it as an
    // Authorization bearer.
    const resetToken = crypto.randomBytes(32).toString('hex');
    const ttlMinutes = this.getResetTokenTtlMinutes();
    const expires = new Date(Date.now() + ttlMinutes * 60_000);

    const resetRecord = new ResetPassword();
    resetRecord.token = resetToken;
    resetRecord.userId = user.id;
    resetRecord.expires = expires;
    resetRecord.usedAt = null;

    await this.resetPasswordRepository.save(resetRecord);

    // user.email is already decrypted by the @EncryptedColumn transformer.
    const resetUrl = `https://app.mmabaisieux.fr/reset-password/?token=${resetToken}`;

    await this.emailService.sendResetPasswordEmail(user.email, resetUrl);
  }

  private async getResetRecordStatus(
    token: string,
  ): Promise<{ status: 'valid' | 'expired' | 'invalid' | 'used'; resetRecord?: ResetPassword }> {
    const resetRecord = await this.resetPasswordRepository.findOne({ where: { token } });
    if (!resetRecord) return { status: 'invalid' };
    if (resetRecord.usedAt) return { status: 'used', resetRecord };
    if (resetRecord.expires < new Date()) return { status: 'expired', resetRecord };
    return { status: 'valid', resetRecord };
  }

  private throwForResetStatus(status: 'expired' | 'invalid' | 'used'): never {
    const ttlMinutes = this.getResetTokenTtlMinutes();
    const messages: Record<typeof status, string> = {
      expired:
        `Ce lien de réinitialisation a expiré. Pour des raisons de sécurité, les liens ne sont ` +
        `valables que ${ttlMinutes} minute${ttlMinutes > 1 ? 's' : ''}. ` +
        `Veuillez refaire une demande via « Mot de passe oublié ».`,
      invalid: 'Ce lien de réinitialisation est invalide. Veuillez refaire une demande via « Mot de passe oublié ».',
      used:
        'Ce lien de réinitialisation a déjà été utilisé. Veuillez refaire une demande via « Mot de passe oublié ».',
    };
    const codes: Record<typeof status, string> = {
      expired: 'RESET_TOKEN_EXPIRED',
      invalid: 'RESET_TOKEN_INVALID',
      used: 'RESET_TOKEN_USED',
    };
    throw new BadRequestException({ code: codes[status], message: messages[status] });
  }

  async validateResetToken(token: string): Promise<{ valid: true }> {
    const { status } = await this.getResetRecordStatus(token);
    if (status !== 'valid') this.throwForResetStatus(status);
    return { valid: true };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const { status, resetRecord } = await this.getResetRecordStatus(token);
    if (status !== 'valid') this.throwForResetStatus(status);

    const user = await this.userRepository.findOne({ where: { id: resetRecord.userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    if (!isValidPassword(newPassword)) {
      throw new BadRequestException(PASSWORD_RULE_MESSAGE);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    resetRecord.usedAt = new Date();
    await this.resetPasswordRepository.save(resetRecord);
  }
}