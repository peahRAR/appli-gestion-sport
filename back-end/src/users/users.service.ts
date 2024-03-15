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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const mailIdentifier = this.createMailIdentifier(createUserDto.email);
     const encryptedBirthday = this.createEncryptedField(createUserDto.birthday.toString());
     const encryptedTelMedic = this.createEncryptedField(createUserDto.tel_medic);
     const encryptedTelEmergency = this.createEncryptedField(createUserDto.tel_emergency);
     const encryptedWeight = this.createEncryptedField(createUserDto.weight.toString());
     const encryptedLicence = this.createEncryptedField(createUserDto.licence);
     const encryptedDateSubscribe = this.createEncryptedField(createUserDto.date_subscribe.toISOString());
     const encryptedDatePayment = this.createEncryptedField(createUserDto.date_payment.toISOString());
     const encryptedDateEndPay = this.createEncryptedField(createUserDto.date_end_pay.toISOString());
 

    //  Vérifier si un utilisateur avec le même mailIdentifier existe déjà
    const hashedPassword = await bcrypt.hash(createUserDto.password,10)

    const newUser= this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      email:{
        mailIdentifier:mailIdentifier,
        mailData:this.createMailData(createUserDto.email)
      },
      birthday:{
        identifier:encryptedBirthday,
        data:this.createEncryptedField(createUserDto.birthday)
      },
      tel_medic:{
        identifier:encryptedTelMedic,
        data:this.createEncryptedField(createUserDto.tel_medic)
      },
      tel_emergency:{
        identifier:encryptedTelEmergency,
        data:this.createEncryptedField(createUserDto.tel_emergency)
      },
      weight:{
        identifier:encryptedWeight,
        data:this.createEncryptedField(createUserDto.weight)
      },
      licence:{
        identifier:encryptedLicence,
        data:this.createEncryptedField(createUserDto.licence)
      },
      date_subscribe:{
        identifier:encryptedDateSubscribe,
        data:this.createEncryptedField(createUserDto.date_subscribe)
      },
      date_end_pay:{
        identifier:encryptedDateEndPay,
        data:this.createEncryptedField(createUserDto.date_end_pay)
      },
      date_payment:{
        identifier:encryptedDatePayment,
        date:this.createEncryptedField(createUserDto.date_payment)
      },
    })

    return this.userRepository.save(newUser)
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  // async findByEmail(email: string): Promise<User | undefined> {
  //   return this.userRepository.findOne({ where: { email } });
  // }

  // async update(id: number, updateUserDto: UpdateUserDto): Promise<User | undefined> {
  //   await this.userRepository.update(id, updateUserDto);
  //   return this.userRepository.findOne({ where: { id } });
  // }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
