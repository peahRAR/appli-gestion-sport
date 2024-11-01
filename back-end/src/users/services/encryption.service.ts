import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
    private salt: string;
    private generalKey: string;
    private emailKey: string;

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
        const key = crypto.scryptSync(secret, this.salt, 32);
        const iv = isEmail ? Buffer.from('unIVfixe16octets') : crypto.randomBytes(16);

        try {
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let encrypted = cipher.update(data, 'utf-8', 'hex');
            encrypted += cipher.final('hex');
            const result = iv.toString('hex') + ':' + encrypted;
            return result;
        } catch (error) {
            throw error;
        }
    }

    splitEncryptedField(encryptedData: string): { identifier: string, data: string } {
        const [identifier, data] = encryptedData.split(':');
        return { identifier, data };
    }

    // Dans votre service de chiffrement
    private decryptionCache = new Map<string, string>();

    async decryptField(encryptedObj: { identifier: string, data: string }, isEmail: boolean = false): Promise<string> {
        // Clé unique basée sur les données chiffrées
        const cacheKey = `${encryptedObj.identifier}:${encryptedObj.data}`;

        // Vérifier le cache avant de déchiffrer
        if (this.decryptionCache.has(cacheKey)) {
            return this.decryptionCache.get(cacheKey);
        }

        const { identifier, data } = encryptedObj;
        const secret = isEmail ? this.emailKey : this.generalKey;
        const key = crypto.scryptSync(secret, this.salt, 32);
        const iv = Buffer.from(identifier, 'hex');

        try {
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(data, 'hex', 'utf-8');
            decrypted += decipher.final('utf-8');

            // Mettre en cache le résultat
            this.decryptionCache.set(cacheKey, decrypted);

            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            throw error;
        }
    }
}
