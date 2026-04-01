import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";

describe("auth schemas", () => {
  describe("loginSchema", () => {
    it("accepts valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "massimo@hestia.dev",
        password: "Hestia2024!",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "Hestia2024!",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty email", () => {
      const result = loginSchema.safeParse({
        email: "",
        password: "Hestia2024!",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password shorter than 6 characters", () => {
      const result = loginSchema.safeParse({
        email: "massimo@hestia.dev",
        password: "12345",
      });
      expect(result.success).toBe(false);
    });

    it("accepts password exactly 6 characters", () => {
      const result = loginSchema.safeParse({
        email: "massimo@hestia.dev",
        password: "123456",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing email", () => {
      const result = loginSchema.safeParse({
        password: "Hestia2024!",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing password", () => {
      const result = loginSchema.safeParse({
        email: "massimo@hestia.dev",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("accepts valid registration data", () => {
      const result = registerSchema.safeParse({
        name: "Massimo Belmonte",
        email: "massimo@hestia.dev",
        password: "Hestia2024!",
        confirmPassword: "Hestia2024!",
      });
      expect(result.success).toBe(true);
    });

    it("rejects when passwords do not match", () => {
      const result = registerSchema.safeParse({
        name: "Massimo Belmonte",
        email: "massimo@hestia.dev",
        password: "Hestia2024!",
        confirmPassword: "DifferentPassword1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password shorter than 8 characters", () => {
      const result = registerSchema.safeParse({
        name: "Massimo Belmonte",
        email: "massimo@hestia.dev",
        password: "Short1",
        confirmPassword: "Short1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password without a number", () => {
      const result = registerSchema.safeParse({
        name: "Massimo Belmonte",
        email: "massimo@hestia.dev",
        password: "NoNumbersHere!",
        confirmPassword: "NoNumbersHere!",
      });
      expect(result.success).toBe(false);
    });

    it("accepts password with number and 8+ characters", () => {
      const result = registerSchema.safeParse({
        name: "Massimo Belmonte",
        email: "massimo@hestia.dev",
        password: "ValidPass1",
        confirmPassword: "ValidPass1",
      });
      expect(result.success).toBe(true);
    });

    it("rejects name shorter than 2 characters", () => {
      const result = registerSchema.safeParse({
        name: "M",
        email: "massimo@hestia.dev",
        password: "Hestia2024!",
        confirmPassword: "Hestia2024!",
      });
      expect(result.success).toBe(false);
    });

    it("accepts name exactly 2 characters", () => {
      const result = registerSchema.safeParse({
        name: "Ma",
        email: "massimo@hestia.dev",
        password: "Hestia2024!",
        confirmPassword: "Hestia2024!",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = registerSchema.safeParse({
        name: "Massimo Belmonte",
        email: "bad-email",
        password: "Hestia2024!",
        confirmPassword: "Hestia2024!",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing confirmPassword", () => {
      const result = registerSchema.safeParse({
        name: "Massimo Belmonte",
        email: "massimo@hestia.dev",
        password: "Hestia2024!",
      });
      expect(result.success).toBe(false);
    });
  });
});
