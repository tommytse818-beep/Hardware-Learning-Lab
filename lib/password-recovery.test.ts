import { describe, expect, it } from "vitest";

import {
  hasActivePasswordRecovery,
  PASSWORD_RECOVERY_COOKIE_VALUE,
} from "./password-recovery";

describe("password recovery marker", () => {
  it("accepts only the server-issued marker value", () => {
    expect(
      hasActivePasswordRecovery(PASSWORD_RECOVERY_COOKIE_VALUE),
    ).toBe(true);
    expect(hasActivePasswordRecovery(undefined)).toBe(false);
    expect(hasActivePasswordRecovery("true")).toBe(false);
  });
});
