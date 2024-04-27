// src/secrets/secrets.service.ts
import { Injectable } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

@Injectable()
export class SecretsService {
    private client = new SecretManagerServiceClient();

    async getSecret(secretName: string): Promise<string> {
        const [version] = await this.client.accessSecretVersion({
            name: `projects/mma-baisieux/secrets/${secretName}/versions/latest`
        });

        if (version.payload && version.payload.data) {
            const payload = version.payload.data.toString(); // Convert Buffer to string
            return payload;
        }
        throw new Error('No secret data found.');
    }
}