import * as crypto from 'crypto';
import {
  configureEncryptionKeys,
  decryptValue,
  encryptValue,
  EncryptedField,
} from './encryption.util';

// Faithful copy of the pre-refactor EncryptionService algorithm (git history:
// src/users/services/encryption.service.ts before this change), kept standalone
// here so these tests prove real interoperability with "the old code" rather
// than just testing the new implementation against itself.
function legacyCreateEncryptedField(
  data: string,
  secret: string,
  salt: string,
  isEmail = false,
): string {
  const key = new Uint8Array(crypto.scryptSync(secret, salt, 32));
  const ivBuf = isEmail ? Buffer.from('unIVfixe16octets') : crypto.randomBytes(16);
  const iv = new Uint8Array(ivBuf);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return Buffer.from(iv).toString('hex') + ':' + encrypted;
}

function legacySplitEncryptedField(encryptedData: string): EncryptedField {
  const [identifier, data] = encryptedData.split(':');
  return { identifier, data };
}

function legacyDecryptField(
  encryptedObj: EncryptedField,
  secret: string,
  salt: string,
): string {
  const key = new Uint8Array(crypto.scryptSync(secret, salt, 32));
  const iv = new Uint8Array(Buffer.from(encryptedObj.identifier, 'hex'));
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedObj.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const TEST_SALT = 'test-salt-value';
const TEST_GENERAL_KEY = 'test-general-key';
const TEST_EMAIL_KEY = 'test-email-key';

describe('encryption.util (AES-256-CBC, unchanged algorithm/keys/format)', () => {
  beforeAll(() => {
    configureEncryptionKeys({
      salt: TEST_SALT,
      generalKey: TEST_GENERAL_KEY,
      emailKey: TEST_EMAIL_KEY,
    });
  });

  it('round-trips a general (non-email) field', () => {
    const plain = 'Jean Dupont';
    const encrypted = encryptValue(plain, false);
    expect(decryptValue(encrypted, false)).toBe(plain);
  });

  it('round-trips an email field', () => {
    const plain = 'jean.dupont@example.com';
    const encrypted = encryptValue(plain, true);
    expect(decryptValue(encrypted, true)).toBe(plain);
  });

  it('uses a random IV per call for general fields (semantic security preserved)', () => {
    const a = encryptValue('same value', false);
    const b = encryptValue('same value', false);
    expect(a.identifier).not.toBe(b.identifier);
    expect(a.data).not.toBe(b.data);
  });

  it('uses a fixed IV for email fields so equal plaintext -> equal ciphertext (required for findByEmail lookups)', () => {
    const a = encryptValue('same@example.com', true);
    const b = encryptValue('same@example.com', true);
    expect(a).toEqual(b);
  });

  describe('backward compatibility: old code encrypts, new code decrypts', () => {
    it('decrypts a general field encrypted by the legacy implementation', () => {
      const plain = 'ancienne valeur chiffrée';
      const legacyRaw = legacyCreateEncryptedField(plain, TEST_GENERAL_KEY, TEST_SALT, false);
      const legacyEncrypted = legacySplitEncryptedField(legacyRaw);

      expect(decryptValue(legacyEncrypted, false)).toBe(plain);
    });

    it('decrypts an email field encrypted by the legacy implementation', () => {
      const plain = 'legacy.user@example.com';
      const legacyRaw = legacyCreateEncryptedField(plain, TEST_EMAIL_KEY, TEST_SALT, true);
      const legacyEncrypted = legacySplitEncryptedField(legacyRaw);

      expect(decryptValue(legacyEncrypted, true)).toBe(plain);
    });

    it('produces the exact same ciphertext as the legacy implementation for a fixed IV (email)', () => {
      const plain = 'deterministic@example.com';
      const legacyRaw = legacyCreateEncryptedField(plain, TEST_EMAIL_KEY, TEST_SALT, true);
      const legacyEncrypted = legacySplitEncryptedField(legacyRaw);

      const newEncrypted = encryptValue(plain, true);

      expect(newEncrypted).toEqual(legacyEncrypted);
    });
  });

  describe('forward compatibility: new code encrypts, old code decrypts', () => {
    it('legacy decryptField reads a value encrypted by the new implementation (general field)', () => {
      const plain = 'nouvelle valeur chiffrée';
      const encrypted = encryptValue(plain, false);

      expect(legacyDecryptField(encrypted, TEST_GENERAL_KEY, TEST_SALT)).toBe(plain);
    });

    it('legacy decryptField reads a value encrypted by the new implementation (email field)', () => {
      const plain = 'new.user@example.com';
      const encrypted = encryptValue(plain, true);

      expect(legacyDecryptField(encrypted, TEST_EMAIL_KEY, TEST_SALT)).toBe(plain);
    });
  });

  describe('known fixture (frozen ciphertext, catches any accidental format/algorithm drift)', () => {
    it('decrypts a hardcoded ciphertext generated once with the test keys above', () => {
      // Frozen output of encryptValue('fixture value', true) with TEST_EMAIL_KEY/TEST_SALT.
      // If this ever fails, the algorithm, key derivation, or storage format changed —
      // which would make already-stored production data unreadable.
      const fixture: EncryptedField = {
        identifier: '756e49566669786531366f6374657473',
        data: '8eb5be4abf52697560e844a9c50c8946',
      };

      expect(decryptValue(fixture, true)).toBe('fixture value');
    });
  });
});
