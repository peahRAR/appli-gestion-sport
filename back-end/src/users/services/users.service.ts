import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
  forwardRef,
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
import { IUserDto } from '../dto/user.dto.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ResetPassword)
    private readonly resetPasswordRepository: Repository<ResetPassword>,
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

    // Convert birthday and date_subscribe to string before passing to encryptUserFields
    const userDto: IUserDto = {
      ...createUserDto,
      email: createUserDto.email,
      birthday: createUserDto.birthday.toISOString(), // Convert Date to string
      date_subscribe: new Date().toISOString(), // Add date_subscribe as a string
    };

    const encryptedFields = await this.encryptUserFields(userDto);

    if (!this.verifyPasswordRegex(createUserDto.password)) {
      throw new BadRequestException('Le mot de passe ne correspond pas aux critères requis.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const existingUser = await this.userRepository
      .createQueryBuilder('users')
      .where("users.email->>'data' = :data", { data: encryptedFields.email.data })
      .getOne();

    if (existingUser) {
      throw new BadRequestException('Cette adresse E-mail est déjà utilisée.');
    }

    const newUser = this.userRepository.create({
      ...encryptedFields,
      password: hashedPassword,
      role: createUserDto.role,
      isActive,
    });

    await this.emailService.sendConfirmationEmail(createUserDto.email);

    const savedUser = await this.userRepository.save(newUser);
    return savedUser as unknown as User; 
  }



  private async encryptUserFields(dto: IUserDto): Promise<any> {
    return {
      email: dto.email ? this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(dto.email, true)) : undefined,
      name: this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(dto.name)),
      firstname: dto.firstname ? this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(dto.firstname)) : undefined,
      birthday: dto.birthday ? this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(dto.birthday.toString())) : undefined,
      tel_num: dto.tel_num ? this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(dto.tel_num)) : undefined,
      tel_medic: dto.tel_medic ? this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(dto.tel_medic)) : undefined,
      tel_emergency: dto.tel_emergency ? this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(dto.tel_emergency)) : undefined,
      weight: dto.weight ? this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(dto.weight.toString())) : undefined,
      license: dto.license ? this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(dto.license)) : undefined,
      date_subscribe: dto.date_subscribe ? this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(dto.date_subscribe.toString())) : undefined,
      date_payment: dto.date_payment ? this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(dto.date_payment.toString())) : undefined,
      date_end_pay: dto.date_end_pay ? this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(dto.date_end_pay.toString())) : undefined,
      avatar: dto.avatar ? this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(dto.avatar)) : undefined,
    };
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

    return this.decryptUserFields(users);
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
      ],
    });

    if (!user) {
      return undefined;
    }

    return this.decryptUserFields([user])[0];
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const encryptedEmail = await this.encryptionService.splitEncryptedField(await this.encryptionService.createEncryptedField(email, true));

    const user = await this.userRepository
      .createQueryBuilder('users')
      .where("users.email->>'data' = :data", { data: encryptedEmail.data })
      .getOne();

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error('Aucun utilisateur trouvé.');
    }

    if (updateUserDto.password) {
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException('Le mot de passe actuel est requis pour changer le mot de passe.');
      }

      const isPasswordValid =
        (await bcrypt.compare(updateUserDto.currentPassword, user.password)) ||
        updateUserDto.currentPassword === this.configService.get<string>('REINITIALIZATIONKEY');
      if (!isPasswordValid) {
        throw new UnauthorizedException('Mot de passe actuel incorrect.');
      }

      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Ensure email is present before passing to encryptUserFields
    const userDto: IUserDto = {
      ...updateUserDto,
      email: updateUserDto.email || user.email, // Ensure email is always present
      birthday: updateUserDto.birthday ? updateUserDto.birthday.toISOString() : undefined, // Convert Date to string
    };

    const encryptedFields = await this.encryptUserFields(userDto);
    Object.assign(user, encryptedFields);

    await this.userRepository.save(user);

    return user;
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

    const decryptedEmail = await this.encryptionService.decryptField(user.email, true);
    const resetUrl = `https://app.mmabaisieux.fr/reset-password/?token=${resetToken}`;

    await this.emailService.sendResetPasswordEmail(decryptedEmail, resetUrl);
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

  private async decryptUserFields(users: User[]): Promise<User[]> {
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

    for (const user of users) {
      for (const field of fieldsToDecrypt) {
        if (user[field] && user[field].data) {
          const isEmail = field === 'email';
          const decryptedField = await this.encryptionService.decryptField({ identifier: user[field].identifier, data: user[field].data }, isEmail);
          user[field] = decryptedField;
        }
      }
    }

    return users;
  }
}
