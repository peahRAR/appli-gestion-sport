import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';

@Injectable()
export class EncryptionService {
    private salt: string;
    private generalKey: string;
    private emailKey: string;
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly configService: ConfigService) {
        this.initialize();
    }

    private async initialize() {
        this.salt = this.configService.get<string>('SALT');
        this.generalKey = this.configService.get<string>('ENCRYPTION_KEY');
        this.emailKey = this.configService.get<string>('PASSWORDMAIL');
    }

    async createEncryptedField(data: string, isEmail: boolean = false): Promise<string> {
        const secret = isEmail ? this.emailKey : this.generalKey;

        // crypto.scryptSync peut renvoyer un Buffer, on force en Uint8Array pour TS
        const key = new Uint8Array(crypto.scryptSync(secret, this.salt, 32));

        // IV 16 bytes
        const ivBuf = isEmail ? Buffer.from('unIVfixe16octets') : crypto.randomBytes(16);
        const iv = new Uint8Array(ivBuf);

        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return Buffer.from(iv).toString('hex') + ':' + encrypted;
    }


    splitEncryptedField(encryptedData: string): { identifier: string, data: string } {
        const [identifier, data] = encryptedData.split(':');
        return { identifier, data };
    }

    // Dans votre service de chiffrement
    private decryptionCache = new Map<string, string>();

    async decryptField(
        encryptedObj: { identifier: string; data: string },
        isEmail: boolean = false,
    ): Promise<string> {
        const cacheKey = `${encryptedObj.identifier}:${encryptedObj.data}`;
        if (this.decryptionCache.has(cacheKey)) {
            return this.decryptionCache.get(cacheKey)!;
        }

        const secret = isEmail ? this.emailKey : this.generalKey;
        const key = new Uint8Array(crypto.scryptSync(secret, this.salt, 32));

        const ivBuf = Buffer.from(encryptedObj.identifier, 'hex');
        const iv = new Uint8Array(ivBuf);

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

        let decrypted = decipher.update(encryptedObj.data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        this.decryptionCache.set(cacheKey, decrypted);
        return decrypted;
    }


}
