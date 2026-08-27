export const PASSWORD_RECOVERY_COOKIE = "hll-password-recovery";
export const PASSWORD_RECOVERY_COOKIE_VALUE = "active";
export const PASSWORD_RECOVERY_MAX_AGE_SECONDS = 15 * 60;

export function hasActivePasswordRecovery(value: string | undefined) {
  return value === PASSWORD_RECOVERY_COOKIE_VALUE;
}
