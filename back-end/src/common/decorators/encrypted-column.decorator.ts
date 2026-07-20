import { Column, ColumnOptions } from 'typeorm';
import {
  decryptValue,
  encryptValue,
  EncryptedField,
} from '../../users/utils/encryption.util';

export interface EncryptedColumnOptions {
  /** Use the dedicated email key + fixed IV, so equal plaintext always
   *  encrypts to equal ciphertext (needed for equality lookups). */
  isEmail?: boolean;
  nullable?: boolean;
}

/**
 * Stores the column as reversibly-encrypted JSON ({identifier, data}, same
 * format/algorithm as before: AES-256-CBC), while the in-memory entity
 * property holds the plain string. Encryption/decryption happens
 * automatically on save/read via a TypeORM transformer.
 */
export function EncryptedColumn(options: EncryptedColumnOptions = {}): PropertyDecorator {
  const { isEmail = false, nullable = false } = options;

  const columnOptions: ColumnOptions = {
    type: 'json',
    nullable,
    transformer: {
      to: (value?: string | null): EncryptedField | null => {
        if (value === null || value === undefined) return null;
        return encryptValue(value, isEmail);
      },
      from: (value?: EncryptedField | null): string | null => {
        if (!value) return null;
        return decryptValue(value, isEmail);
      },
    },
  };

  return Column(columnOptions);
}
