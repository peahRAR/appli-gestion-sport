import { Injectable, Logger } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

@Injectable()
export class SecretsService {
    private readonly client: SecretManagerServiceClient;
    private readonly logger = new Logger(SecretsService.name);

    constructor() {
        this.client = new SecretManagerServiceClient();
    }

    async getSecret(secretName: string): Promise<string> {
        const [version] = await this.client.accessSecretVersion({
            name: `projects/mma-baisieux/secrets/${secretName}/versions/latest`
        });

        if (version.payload && version.payload.data) {
            const payload = version.payload.data.toString(); // Convert Buffer to string
            this.logger.debug(`Secret récupéré avec succès : ${secretName}`);
            return payload;
        }

        this.logger.error('Aucune donnée secrète trouvée.');
        throw new Error('Aucune donnée secrète trouvée.');
    }
}