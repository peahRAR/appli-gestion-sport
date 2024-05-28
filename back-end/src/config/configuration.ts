import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Logger } from '@nestjs/common';

const client = new SecretManagerServiceClient();
const logger = new Logger('SecretsLoader');

async function loadSecrets() {
    const secrets = {};
    try {
        const [secretNames] = await client.listSecrets({
            parent: `projects/941748508363`
        });
        logger.log(`Fetched ${secretNames.length} secrets.`);
        for (const secretFullName of secretNames.map(secret => secret.name)) {
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

export default loadSecrets;
