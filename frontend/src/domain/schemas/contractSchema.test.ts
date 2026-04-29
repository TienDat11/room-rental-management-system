import { describe, it, expect } from "vitest";
import { contractCreateSchema } from "@/domain/schemas/contractSchema";

describe("contractSchema", () => {
  const validContract = {
    tenant: 1,
    room: 2,
    start_date: "2026-01-01",
    end_date: "2027-01-01",
    monthly_rent: "3000000",
  };

  it("should validate valid contract data", () => {
    const result = contractCreateSchema.safeParse(validContract);
    expect(result.success).toBe(true);
  });

  it("should reject empty start_date", () => {
    const result = contractCreateSchema.safeParse({ ...validContract, start_date: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/ngày bắt đầu/i);
    }
  });

  it("should reject empty end_date", () => {
    const result = contractCreateSchema.safeParse({ ...validContract, end_date: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/ngày kết thúc/i);
    }
  });

  it("should reject end_date before start_date", () => {
    const result = contractCreateSchema.safeParse({
      ...validContract,
      start_date: "2027-01-01",
      end_date: "2026-01-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("end_date"));
      expect(issue?.message).toMatch(/sau ngày bắt đầu/);
    }
  });

  it("should reject same start and end date", () => {
    const result = contractCreateSchema.safeParse({
      ...validContract,
      start_date: "2026-01-01",
      end_date: "2026-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty monthly_rent", () => {
    const result = contractCreateSchema.safeParse({ ...validContract, monthly_rent: "" });
    expect(result.success).toBe(false);
  });

  it("should reject non-numeric monthly_rent", () => {
    const result = contractCreateSchema.safeParse({ ...validContract, monthly_rent: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/chỉ được nhập số/);
    }
  });

  it("should reject zero monthly_rent", () => {
    const result = contractCreateSchema.safeParse({ ...validContract, monthly_rent: "0" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/lớn hơn 0/);
    }
  });

  it("should reject invalid tenant", () => {
    const result = contractCreateSchema.safeParse({ ...validContract, tenant: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject invalid room", () => {
    const result = contractCreateSchema.safeParse({ ...validContract, room: -1 });
    expect(result.success).toBe(false);
  });

  it("should accept optional deposit_amount", () => {
    const result = contractCreateSchema.safeParse({ ...validContract, deposit_amount: "1000000" });
    expect(result.success).toBe(true);
  });

  it("should reject non-numeric deposit_amount", () => {
    const result = contractCreateSchema.safeParse({ ...validContract, deposit_amount: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/chỉ được nhập số/);
    }
  });

  it("should accept empty optional fields", () => {
    const result = contractCreateSchema.safeParse({
      ...validContract,
      deposit_amount: "",
      terms: "",
      notes: "",
    });
    expect(result.success).toBe(true);
  });
});
