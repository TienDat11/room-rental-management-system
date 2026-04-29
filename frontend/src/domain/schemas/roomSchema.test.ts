import { describe, it, expect } from "vitest";
import { roomCreateSchema } from "@/domain/schemas/roomSchema";

describe("roomSchema", () => {
  const validRoom = {
    room_number: "101",
    floor: 1,
    area: 25,
    base_price: "3000000",
  };

  it("should validate valid room data", () => {
    const result = roomCreateSchema.safeParse(validRoom);
    expect(result.success).toBe(true);
  });

  it("should reject empty room_number", () => {
    const result = roomCreateSchema.safeParse({ ...validRoom, room_number: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/số phòng/i);
    }
  });

  it("should reject room_number with special characters", () => {
    const result = roomCreateSchema.safeParse({ ...validRoom, room_number: "101-A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/chữ cái và số/);
    }
  });

  it("should accept room_number with letters", () => {
    const result = roomCreateSchema.safeParse({ ...validRoom, room_number: "A201" });
    expect(result.success).toBe(true);
  });

  it("should reject floor below 1", () => {
    const result = roomCreateSchema.safeParse({ ...validRoom, floor: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/1 trở lên/);
    }
  });

  it("should reject floor above 100", () => {
    const result = roomCreateSchema.safeParse({ ...validRoom, floor: 101 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/100/);
    }
  });

  it("should reject non-integer floor", () => {
    const result = roomCreateSchema.safeParse({ ...validRoom, floor: 1.5 });
    expect(result.success).toBe(false);
  });

  it("should reject zero or negative area", () => {
    const result = roomCreateSchema.safeParse({ ...validRoom, area: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/lớn hơn 0/);
    }
  });

  it("should reject empty base_price", () => {
    const result = roomCreateSchema.safeParse({ ...validRoom, base_price: "" });
    expect(result.success).toBe(false);
  });

  it("should reject non-numeric base_price", () => {
    const result = roomCreateSchema.safeParse({ ...validRoom, base_price: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/chỉ được nhập số/);
    }
  });

  it("should reject zero base_price", () => {
    const result = roomCreateSchema.safeParse({ ...validRoom, base_price: "0" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/lớn hơn 0/);
    }
  });

  it("should reject room_number over 20 chars", () => {
    const result = roomCreateSchema.safeParse({ ...validRoom, room_number: "A".repeat(21) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/20 ký tự/);
    }
  });

  it("should accept optional fields", () => {
    const result = roomCreateSchema.safeParse({
      ...validRoom,
      amenities: "WiFi, máy lạnh",
      description: "Phòng đẹp",
    });
    expect(result.success).toBe(true);
  });
});
