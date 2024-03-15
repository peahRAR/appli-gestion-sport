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
    // Date anniversaire
    const birthdayString = createUserDto.birthday.toString();
  
    // Date création de compte
    const dateSubscribeString = new Date().toString();
  
    // Créer les champs encryptés
    const encryptedBirthday = this.createEncryptedField(birthdayString);
    const encryptedDateSubscribe = this.createEncryptedField(dateSubscribeString);
  
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
