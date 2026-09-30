import { describe, expect, it } from "vitest";
import { HLL_MAX_IMAGE_BYTES, validateHllImage } from "./hll-tutor-contract";

function file(type: string, bytes: number[], size = bytes.length) {
  return { type, size, slice: () => ({ arrayBuffer: async () => new Uint8Array(bytes).buffer }) };
}

describe("HLL local image validation", () => {
  it.each([
    ["image/png", [137, 80, 78, 71, 13, 10, 26, 10]],
    ["image/jpeg", [255, 216, 255, 224]],
    ["image/webp", [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]],
  ])("accepts a matching %s signature", async (type, bytes) => {
    expect(await validateHllImage(file(type, bytes))).toBeNull();
  });
  it("accepts the size boundary and rejects larger images", async () => {
    const bytes = [255, 216, 255];
    expect(await validateHllImage(file("image/jpeg", bytes, HLL_MAX_IMAGE_BYTES))).toBeNull();
    expect(await validateHllImage(file("image/jpeg", bytes, HLL_MAX_IMAGE_BYTES + 1))).toContain("5 MB");
  });
  it.each(["image/svg+xml", "image/gif", "text/html", "", "image/jpg"])("rejects unsupported type %s", async (type) => {
    expect(await validateHllImage(file(type, [255, 216, 255]))).not.toBeNull();
  });
  it("rejects renamed or truncated files and mismatched image types", async () => {
    expect(await validateHllImage(file("image/png", [60, 115, 118, 103]))).toContain("contents");
    expect(await validateHllImage(file("image/jpeg", [255, 216]))).toContain("contents");
    expect(await validateHllImage(file("image/png", [255, 216, 255]))).toContain("contents");
  });
  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])("rejects invalid size %s", async (size) => {
    expect(await validateHllImage(file("image/png", [], size))).not.toBeNull();
  });
  it("returns a useful message when local file reading fails", async () => {
    const broken = { type: "image/png", size: 50, slice: () => ({ arrayBuffer: async (): Promise<ArrayBuffer> => { throw new Error("unreadable"); } }) };
    expect(await validateHllImage(broken)).toContain("could not be read");
  });
});
