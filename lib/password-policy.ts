export const PASSWORD_MIN_LENGTH = 15;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordValidation =
  | { ok: true }
  | { ok: false; message: string };

export function validateNewPassword(password: string): PasswordValidation {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      message: `Use at least ${PASSWORD_MIN_LENGTH} characters. A short passphrase is easier to remember.`,
    };
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      ok: false,
      message: `Use no more than ${PASSWORD_MAX_LENGTH} characters.`,
    };
  }

  if (password.includes("\0")) {
    return { ok: false, message: "The password contains an unsupported character." };
  }

  return { ok: true };
}
