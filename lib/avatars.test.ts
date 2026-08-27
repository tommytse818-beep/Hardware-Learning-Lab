import { describe, expect, it } from "vitest";

import {
  getAvatarOption,
  getFeaturedAvatarOptions,
  isAvatarKey,
} from "./avatars";

describe("avatars", () => {
  it("keeps spark and all featured engineering avatars valid", () => {
    expect(isAvatarKey("spark")).toBe(true);
    expect(getFeaturedAvatarOptions().length).toBeGreaterThanOrEqual(8);
  });

  it("rejects arbitrary user-provided avatar markup or keys", () => {
    expect(isAvatarKey("<svg onload=alert(1)>")).toBe(false);
  });

  it("falls back to a trusted avatar", () => {
    expect(getAvatarOption("not-real").key).toBe("spark");
  });
});
