import { describe, it, expect } from "vitest";
import { tenantCreateSchema } from "@/domain/schemas/tenantSchema";

describe("tenantSchema", () => {
  const validTenant = {
    full_name: "Nguyễn Văn A",
    id_card: "012345678901",
    phone: "0912345678",
  };

  it("should validate valid tenant data", () => {
    const result = tenantCreateSchema.safeParse(validTenant);
    expect(result.success).toBe(true);
  });

  it("should reject empty full_name", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, full_name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/họ và tên/i);
    }
  });

  it("should reject full_name over 100 chars", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, full_name: "A".repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/100 ký tự/);
    }
  });

  it("should accept 9-digit id_card", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, id_card: "123456789" });
    expect(result.success).toBe(true);
  });

  it("should accept 12-digit id_card", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, id_card: "012345678901" });
    expect(result.success).toBe(true);
  });

  it("should reject 10-digit id_card", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, id_card: "1234567890" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/9 hoặc 12/);
    }
  });

  it("should reject id_card with letters", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, id_card: "0123abc456" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/9 hoặc 12/);
    }
  });

  it("should reject empty id_card", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, id_card: "" });
    expect(result.success).toBe(false);
  });

  it("should accept valid phone starting with 09", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, phone: "0912345678" });
    expect(result.success).toBe(true);
  });

  it("should accept valid phone starting with 03", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, phone: "0312345678" });
    expect(result.success).toBe(true);
  });

  it("should reject phone starting with 01", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, phone: "0112345678" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/số điện thoại/i);
    }
  });

  it("should reject phone with 9 digits", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, phone: "091234567" });
    expect(result.success).toBe(false);
  });

  it("should reject empty phone", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, phone: "" });
    expect(result.success).toBe(false);
  });

  it("should accept valid email", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, email: "test@gmail.com" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = tenantCreateSchema.safeParse({ ...validTenant, email: "notanemail" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/email/i);
    }
  });

  it("should accept empty optional fields", () => {
    const result = tenantCreateSchema.safeParse({
      ...validTenant,
      email: "",
      address: "",
      notes: "",
    });
    expect(result.success).toBe(true);
  });
});
