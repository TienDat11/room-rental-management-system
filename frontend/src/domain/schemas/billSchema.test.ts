import { describe, it, expect } from "vitest";
import { billCreateSchema, paymentCreateSchema } from "@/domain/schemas/billSchema";

describe("billSchema", () => {
  const validBill = {
    contract: 1,
    room: 2,
    tenant: 3,
    bill_month: 4,
    bill_year: 2026,
    room_price: "3000000",
    due_date: "2026-04-30",
  };

  it("should validate valid bill data", () => {
    const result = billCreateSchema.safeParse(validBill);
    expect(result.success).toBe(true);
  });

  it("should reject bill_month below 1", () => {
    const result = billCreateSchema.safeParse({ ...validBill, bill_month: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/1 đến 12/);
    }
  });

  it("should reject bill_month above 12", () => {
    const result = billCreateSchema.safeParse({ ...validBill, bill_month: 13 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/1 đến 12/);
    }
  });

  it("should reject bill_year below 2000", () => {
    const result = billCreateSchema.safeParse({ ...validBill, bill_year: 1999 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/2000/);
    }
  });

  it("should reject empty room_price", () => {
    const result = billCreateSchema.safeParse({ ...validBill, room_price: "" });
    expect(result.success).toBe(false);
  });

  it("should reject non-numeric room_price", () => {
    const result = billCreateSchema.safeParse({ ...validBill, room_price: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/chỉ được nhập số/);
    }
  });

  it("should reject zero room_price", () => {
    const result = billCreateSchema.safeParse({ ...validBill, room_price: "0" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/lớn hơn 0/);
    }
  });

  it("should reject electricity_current less than previous", () => {
    const result = billCreateSchema.safeParse({
      ...validBill,
      electricity_previous: "100",
      electricity_current: "50",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("electricity_current"));
      expect(issue?.message).toMatch(/chỉ số điện/i);
    }
  });

  it("should accept electricity_current equal to previous", () => {
    const result = billCreateSchema.safeParse({
      ...validBill,
      electricity_previous: "100",
      electricity_current: "100",
    });
    expect(result.success).toBe(true);
  });

  it("should reject water_current less than previous", () => {
    const result = billCreateSchema.safeParse({
      ...validBill,
      water_previous: "50",
      water_current: "30",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("water_current"));
      expect(issue?.message).toMatch(/chỉ số nước/i);
    }
  });

  it("should accept water_current equal to previous", () => {
    const result = billCreateSchema.safeParse({
      ...validBill,
      water_previous: "50",
      water_current: "50",
    });
    expect(result.success).toBe(true);
  });

  it("should reject non-numeric electricity fields", () => {
    const result = billCreateSchema.safeParse({
      ...validBill,
      electricity_previous: "abc",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/chỉ được nhập số/);
    }
  });

  it("should reject non-numeric water fields", () => {
    const result = billCreateSchema.safeParse({
      ...validBill,
      water_price_per_unit: "xyz",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/chỉ được nhập số/);
    }
  });

  it("should reject empty due_date", () => {
    const result = billCreateSchema.safeParse({ ...validBill, due_date: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/hạn thanh toán/);
    }
  });

  it("should accept all optional fields empty", () => {
    const result = billCreateSchema.safeParse({
      ...validBill,
      electricity_previous: "",
      electricity_current: "",
      water_previous: "",
      water_current: "",
      other_fees: "",
      notes: "",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid contract/room/tenant ids", () => {
    const result = billCreateSchema.safeParse({
      ...validBill,
      contract: 0,
      room: 0,
      tenant: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("paymentSchema", () => {
  const validPayment = {
    amount: "500000",
    payment_method: "CASH" as const,
    payment_date: "2026-04-15",
  };

  it("should validate valid payment data", () => {
    const result = paymentCreateSchema.safeParse(validPayment);
    expect(result.success).toBe(true);
  });

  it("should accept TRANSFER payment method", () => {
    const result = paymentCreateSchema.safeParse({
      ...validPayment,
      payment_method: "TRANSFER",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty amount", () => {
    const result = paymentCreateSchema.safeParse({ ...validPayment, amount: "" });
    expect(result.success).toBe(false);
  });

  it("should reject non-numeric amount", () => {
    const result = paymentCreateSchema.safeParse({ ...validPayment, amount: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/chỉ được nhập số/);
    }
  });

  it("should reject zero amount", () => {
    const result = paymentCreateSchema.safeParse({ ...validPayment, amount: "0" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/lớn hơn 0/);
    }
  });

  it("should reject invalid payment_method", () => {
    const result = paymentCreateSchema.safeParse({
      ...validPayment,
      payment_method: "CREDIT_CARD",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty payment_date", () => {
    const result = paymentCreateSchema.safeParse({ ...validPayment, payment_date: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/ngày thanh toán/);
    }
  });
});
