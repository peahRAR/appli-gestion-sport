import { isValidPassword, PASSWORD_REGEX, PASSWORD_SPECIAL_CHARS } from './password-policy';

describe('password-policy', () => {
  describe('isValidPassword', () => {
    it.each(['.', '-', '_', '@', '#', '[', ']', '\\', '`', '~'])(
      'accepts a password whose only special character is "%s"',
      (specialChar) => {
        expect(isValidPassword(`Abcdefg1${specialChar}`)).toBe(true);
      },
    );

    it('accepts a space as part of the password', () => {
      expect(isValidPassword('Abc defg1.')).toBe(true);
    });

    it('rejects a password shorter than 8 characters', () => {
      expect(isValidPassword('Ab1def!')).toBe(false);
    });

    it('rejects a password with no uppercase letter', () => {
      expect(isValidPassword('abcdefg1.')).toBe(false);
    });

    it('rejects a password with no lowercase letter', () => {
      expect(isValidPassword('ABCDEFG1.')).toBe(false);
    });

    it('rejects a password with no digit', () => {
      expect(isValidPassword('Abcdefgh.')).toBe(false);
    });

    it('rejects a password with no special character', () => {
      expect(isValidPassword('Abcdefgh1')).toBe(false);
    });

    it('every declared special character is individually accepted', () => {
      for (const ch of PASSWORD_SPECIAL_CHARS) {
        expect(isValidPassword(`Abcdefg1${ch}`)).toBe(true);
      }
    });
  });

  it('PASSWORD_REGEX stays in sync with isValidPassword', () => {
    expect(PASSWORD_REGEX.test('Abcdefg1.')).toBe(isValidPassword('Abcdefg1.'));
  });
});
