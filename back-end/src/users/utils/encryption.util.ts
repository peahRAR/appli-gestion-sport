import * as crypto from 'crypto';

export interface EncryptedField {
  identifier: string;
  data: string;
}

// Populated once at bootstrap by EncryptionService (which has the ConfigService
// wiring to GCP Secret Manager / .env). Module-level state is required because
// TypeORM column transformers are plain objects created at decoration time,
// outside of Nest's DI container, so they can't inject EncryptionService directly.
let generalDerivedKey: Uint8Array | undefined;
let emailDerivedKey: Uint8Array | undefined;

export function configureEncryptionKeys(config: {
  salt: string;
  generalKey: string;
  emailKey: string;
}) {
  // scryptSync is deliberately CPU/memory-hard (~30ms per call on typical
  // hardware) — deriving it once here instead of on every encrypt/decrypt call
  // is what makes @EncryptedColumn viable for list endpoints with many rows x
  // many encrypted fields (previously: N users x ~13 fields x ~30ms per read,
  // which is the real reason the admin panel needed a cache workaround).
  generalDerivedKey = new Uint8Array(crypto.scryptSync(config.generalKey, config.salt, 32));
  emailDerivedKey = new Uint8Array(crypto.scryptSync(config.emailKey, config.salt, 32));
}

function requireKeys() {
  if (!generalDerivedKey || !emailDerivedKey) {
    throw new Error(
      'Encryption keys are not configured yet. EncryptionService must be ' +
      'instantiated (which happens automatically during Nest bootstrap) before ' +
      'any @EncryptedColumn entity is read or written.',
    );
  }
}

// Memoizes decrypted plaintext by ciphertext, same bounded-for-process-lifetime
// Map the previous implementation used — avoids repeat AES work when the same
// encrypted value is read many times in a short window (e.g. repeated admin
// list requests before the underlying data changes).
const decryptionCache = new Map<string, string>();

// Same algorithm/keys/IV convention as before: AES-256-CBC, scrypt-derived key,
// random IV per field except for email which uses a fixed IV + dedicated key so
// that the same address always encrypts to the same ciphertext (required for
// the equality lookup in UsersService.findByEmail).
export function encryptValue(plain: string, isEmail = false): EncryptedField {
  requireKeys();
  const key = isEmail ? emailDerivedKey : generalDerivedKey;
  const ivBuf = isEmail ? Buffer.from('unIVfixe16octets') : crypto.randomBytes(16);
  const iv = new Uint8Array(ivBuf);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(plain, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return { identifier: Buffer.from(iv).toString('hex'), data: encrypted };
}

export function decryptValue(encrypted: EncryptedField, isEmail = false): string {
  requireKeys();
  const cacheKey = `${encrypted.identifier}:${encrypted.data}`;
  const cached = decryptionCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const key = isEmail ? emailDerivedKey : generalDerivedKey;
  const iv = new Uint8Array(Buffer.from(encrypted.identifier, 'hex'));

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  decryptionCache.set(cacheKey, decrypted);
  return decrypted;
}
