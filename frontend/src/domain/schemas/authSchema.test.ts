import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/domain/schemas/authSchema";

describe("authSchema", () => {
  describe("loginSchema", () => {
    it("should validate valid login data", () => {
      const result = loginSchema.safeParse({
        username: "testuser",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty username", () => {
      const result = loginSchema.safeParse({
        username: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const result = loginSchema.safeParse({
        username: "testuser",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("should validate valid register data", () => {
      const result = registerSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
        password: "Password123",
        password_confirm: "Password123",
        full_name: "Test User",
        role: "TENANT",
      });
      expect(result.success).toBe(true);
    });

    it("should reject mismatched passwords", () => {
      const result = registerSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
        password: "Password123",
        password_confirm: "Different123",
        full_name: "Test User",
        role: "TENANT",
      });
      expect(result.success).toBe(false);
    });

    it("should reject short username", () => {
      const result = registerSchema.safeParse({
        username: "ab",
        email: "test@example.com",
        password: "Password123",
        password_confirm: "Password123",
        full_name: "Test User",
        role: "TENANT",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = registerSchema.safeParse({
        username: "testuser",
        email: "invalid-email",
        password: "Password123",
        password_confirm: "Password123",
        full_name: "Test User",
        role: "TENANT",
      });
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const result = registerSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
        password: "Pass1",
        password_confirm: "Pass1",
        full_name: "Test User",
        role: "TENANT",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without uppercase letter", () => {
      const result = registerSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        password_confirm: "password123",
        full_name: "Test User",
        role: "TENANT",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without digit", () => {
      const result = registerSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
        password: "Passwordxxx",
        password_confirm: "Passwordxxx",
        full_name: "Test User",
        role: "TENANT",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid phone format", () => {
      const result = registerSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
        password: "Password123",
        password_confirm: "Password123",
        full_name: "Test User",
        phone: "12345",
        role: "TENANT",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid phone format", () => {
      const result = registerSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
        password: "Password123",
        password_confirm: "Password123",
        full_name: "Test User",
        phone: "0912345678",
        role: "TENANT",
      });
      expect(result.success).toBe(true);
    });
  });
});