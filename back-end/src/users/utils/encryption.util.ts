import * as crypto from 'crypto';

export interface EncryptedField {
  identifier: string;
  data: string;
}

// Populated once at bootstrap by EncryptionService (which has the ConfigService
// wiring to GCP Secret Manager / .env). Module-level state is required because
// TypeORM column transformers are plain objects created at decoration time,
// outside of Nest's DI container, so they can't inject EncryptionService directly.
let salt: string | undefined;
let generalKey: string | undefined;
let emailKey: string | undefined;

export function configureEncryptionKeys(config: {
  salt: string;
  generalKey: string;
  emailKey: string;
}) {
  salt = config.salt;
  generalKey = config.generalKey;
  emailKey = config.emailKey;
}

function requireKeys() {
  if (!salt || !generalKey || !emailKey) {
    throw new Error(
      'Encryption keys are not configured yet. EncryptionService must be ' +
      'instantiated (which happens automatically during Nest bootstrap) before ' +
      'any @EncryptedColumn entity is read or written.',
    );
  }
}

// Same algorithm/keys/IV convention as before: AES-256-CBC, scrypt-derived key,
// random IV per field except for email which uses a fixed IV + dedicated key so
// that the same address always encrypts to the same ciphertext (required for
// the equality lookup in UsersService.findByEmail).
export function encryptValue(plain: string, isEmail = false): EncryptedField {
  requireKeys();
  const secret = isEmail ? emailKey : generalKey;
  const key = new Uint8Array(crypto.scryptSync(secret, salt, 32));
  const ivBuf = isEmail ? Buffer.from('unIVfixe16octets') : crypto.randomBytes(16);
  const iv = new Uint8Array(ivBuf);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(plain, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return { identifier: Buffer.from(iv).toString('hex'), data: encrypted };
}

export function decryptValue(encrypted: EncryptedField, isEmail = false): string {
  requireKeys();
  const secret = isEmail ? emailKey : generalKey;
  const key = new Uint8Array(crypto.scryptSync(secret, salt, 32));
  const iv = new Uint8Array(Buffer.from(encrypted.identifier, 'hex'));

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
