import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  configureEncryptionKeys,
  decryptValue,
  encryptValue,
  EncryptedField,
} from '../utils/encryption.util';

@Injectable()
export class EncryptionService {
  constructor(private readonly configService: ConfigService) {
    // Bridges Nest's ConfigService (GCP Secret Manager in prod, .env locally)
    // to the module-level key state used by @EncryptedColumn transformers,
    // which run outside of Nest's DI container.
    configureEncryptionKeys({
      salt: this.configService.get<string>('SALT'),
      generalKey: this.configService.get<string>('ENCRYPTION_KEY'),
      emailKey: this.configService.get<string>('PASSWORDMAIL'),
    });
  }

  // Only needed for the handful of call sites that build a raw SQL predicate
  // against an encrypted JSON column (comparing ciphertext directly), rather
  // than persisting/hydrating through an entity — @EncryptedColumn can't cover
  // those since no entity save/read is involved. See UsersService.findByEmail
  // and the duplicate-email check in UsersService.create.
  encryptField(plain: string, isEmail = false): EncryptedField {
    return encryptValue(plain, isEmail);
  }

  decryptField(encrypted: EncryptedField, isEmail = false): string {
    return decryptValue(encrypted, isEmail);
  }
}
