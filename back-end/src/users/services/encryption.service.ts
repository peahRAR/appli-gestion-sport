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
        console.log('Data to encrypt:', data); // Log pour vérifier la donnée à chiffrer
        const secret = isEmail ? this.emailKey : this.generalKey;
        const key = crypto.scryptSync(secret, this.salt, 32);
        const iv = isEmail ? Buffer.from('unIVfixe16octets') : crypto.randomBytes(16);

        try {
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let encrypted = cipher.update(data, 'utf-8', 'hex');
            encrypted += cipher.final('hex');
            const result = iv.toString('hex') + ':' + encrypted;
            console.log('Encrypted data:', result); // Log pour vérifier la donnée chiffrée
            return result;
        } catch (error) {
            console.error('Encryption error:', error); // Log en cas d'erreur
            throw error;
        }
    }

    splitEncryptedField(encryptedData: string): { identifier: string, data: string } {
        console.log('Encrypted data to split:', encryptedData); // Log pour vérifier la donnée chiffrée à diviser
        const [identifier, data] = encryptedData.split(':');
        console.log('Split result - Identifier:', identifier, 'Data:', data); // Log pour vérifier les résultats de la division
        return { identifier, data };
    }

    async decryptField(encryptedObj: { identifier: string, data: string }, isEmail: boolean = false): Promise<string> {
        const { identifier, data } = encryptedObj;
        console.log('Data to decrypt:', data, 'Identifier:', identifier); // Log pour vérifier les données à déchiffrer
        const secret = isEmail ? this.emailKey : this.generalKey;
        const key = crypto.scryptSync(secret, this.salt, 32);
        const iv = Buffer.from(identifier, 'hex');

        try {
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(data, 'hex', 'utf-8');
            decrypted += decipher.final('utf-8');
            console.log('Decrypted data:', decrypted); // Log pour vérifier la donnée déchiffrée
            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error); // Log en cas d'erreur
            throw error;
        }
    }
}
