// Single source of truth for the password complexity rule, enforced at every
// entry point that sets a password (signup, change, reset). Mirrored 1:1 in
// front-end/composables/usePasswordPolicy.ts (front and back can't share code
// across the two deployed apps) — keep both literals identical.
export const PASSWORD_SPECIAL_CHARS = '!@#$%^&*()_+-=[]{};\':"\\|,.<>/?~`';

// Regex metacharacters inside a character class need escaping regardless of
// position (a bare "-" between two other chars would silently form a range,
// e.g. "+-=" would match everything from "+" to "=").
function escapeForCharClass(chars: string): string {
  return chars.replace(/[\]\\^-]/g, '\\$&');
}

const SPECIAL_CLASS = `${escapeForCharClass(PASSWORD_SPECIAL_CHARS)} `; // space allowed too

export const PASSWORD_REGEX = new RegExp(
  `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[${SPECIAL_CLASS}])[A-Za-z\\d${SPECIAL_CLASS}]{8,}$`,
);

export const PASSWORD_RULE_MESSAGE =
  `Le mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule, ` +
  `un chiffre et au moins un caractère spécial parmi : ${PASSWORD_SPECIAL_CHARS} (l'espace est aussi accepté).`;

export function isValidPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}
