import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Logger } from '@nestjs/common';

const client = new SecretManagerServiceClient();
const logger = new Logger('SecretsLoader');

async function listSecretNames() {
    try {
        const [secrets] = await client.listSecrets({
            parent: `projects/941748508363`
        });
        logger.log(`Fetched ${secrets.length} secrets.`);
        return secrets.map(secret => secret.name);
    } catch (error) {
        logger.error('Failed to list secrets:', error);
        throw error;
    }
}

async function loadSecrets() {
    const secrets = {};
    try {
        const secretNames = await listSecretNames();
        for (const secretFullName of secretNames) {
            const secretId = secretFullName.split('/').pop(); 
            const [version] = await client.accessSecretVersion({ name: `${secretFullName}/versions/latest` });
            secrets[secretId] = version.payload.data.toString();
            logger.debug(`Secret loaded successfully: ${secretId}`);
        }
    } catch (error) {
        logger.error('Failed to load secrets:', error.stack);
        throw new Error('Failed to load secrets');
    }
    return secrets;
}

export default async () => {
    const secrets = await loadSecrets();
    return secrets;
};

