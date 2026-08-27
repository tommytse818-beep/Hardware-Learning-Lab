import { describe, expect, it } from "vitest";

import {
  PASSWORD_MIN_LENGTH,
  validateNewPassword,
} from "./password-policy";

describe("password policy", () => {
  it("rejects a password below the minimum", () => {
    expect(validateNewPassword("too-short").ok).toBe(false);
  });

  it("accepts a memorable passphrase and spaces", () => {
    const password = "circuits make ideas visible";
    expect(password.length).toBeGreaterThanOrEqual(PASSWORD_MIN_LENGTH);
    expect(validateNewPassword(password)).toEqual({ ok: true });
  });

  it("rejects an excessive password", () => {
    expect(validateNewPassword("x".repeat(129)).ok).toBe(false);
  });
});
