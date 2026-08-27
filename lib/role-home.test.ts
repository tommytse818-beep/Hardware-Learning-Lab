import { describe, expect, it } from "vitest";

import { getRoleHome } from "./role-home";

describe("getRoleHome", () => {
  it("maps every trusted role to its portal", () => {
    expect(getRoleHome("admin")).toBe("/admin");
    expect(getRoleHome("teacher")).toBe("/teacher");
    expect(getRoleHome("student")).toBe("/dashboard");
  });
});
