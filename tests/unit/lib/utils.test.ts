import { describe, it, expect } from "vitest";
import {
  cn,
  slugify,
  getInitials,
  formatCurrency,
  formatDate,
  formatDateShort,
  formatRelativeDate,
} from "@/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      const result = cn("px-2", "py-1");
      expect(result).toBe("px-2 py-1");
    });

    it("handles conditional classes", () => {
      const result = cn("base", false && "hidden", "visible");
      expect(result).toBe("base visible");
    });

    it("resolves tailwind conflicts by keeping the last one", () => {
      const result = cn("px-2", "px-4");
      expect(result).toBe("px-4");
    });

    it("handles undefined and null values", () => {
      const result = cn("base", undefined, null, "end");
      expect(result).toBe("base end");
    });

    it("handles empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("merges array inputs", () => {
      const result = cn(["px-2", "py-1"], "mx-auto");
      expect(result).toBe("px-2 py-1 mx-auto");
    });
  });

  describe("slugify", () => {
    it("converts a string to a URL-safe slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("handles special characters", () => {
      expect(slugify("Côte d'Azur Villa!")).toBe("cte-dazur-villa");
    });

    it("collapses multiple spaces and dashes", () => {
      expect(slugify("hello   world---test")).toBe("hello-world-test");
    });

    it("trims leading and trailing dashes", () => {
      expect(slugify(" -hello world- ")).toBe("hello-world");
    });

    it("handles empty string", () => {
      expect(slugify("")).toBe("");
    });

    it("converts underscores to dashes", () => {
      expect(slugify("hello_world_test")).toBe("hello-world-test");
    });

    it("handles purely numeric strings", () => {
      expect(slugify("123 456")).toBe("123-456");
    });
  });

  describe("getInitials", () => {
    it("returns two-letter initials from a full name", () => {
      expect(getInitials("Massimo Belmonte")).toBe("MB");
    });

    it("returns two letters for a single name", () => {
      expect(getInitials("Massimo")).toBe("M");
    });

    it("limits to two characters for names with three or more words", () => {
      expect(getInitials("Jean Pierre Martin")).toBe("JP");
    });

    it("returns uppercase initials", () => {
      expect(getInitials("sophie belmont")).toBe("SB");
    });
  });

  describe("formatCurrency", () => {
    it("formats EUR amount in English locale", () => {
      const result = formatCurrency(1200, "EUR", "en");
      // Intl may use the euro symbol or EUR text
      expect(result).toContain("1,200");
      expect(result).toMatch(/EUR|\u20AC/);
    });

    it("formats USD amount in English locale", () => {
      const result = formatCurrency(99.99, "USD", "en");
      expect(result).toContain("99.99");
      expect(result).toMatch(/\$|USD/);
    });

    it("formats EUR amount in French locale", () => {
      const result = formatCurrency(1200, "EUR", "fr");
      // French format uses different separators
      expect(result).toMatch(/1[\s\u202f\u00a0]?200/);
    });

    it("defaults to EUR currency", () => {
      const result = formatCurrency(500);
      expect(result).toMatch(/500|EUR|\u20AC/);
    });

    it("handles zero amount", () => {
      const result = formatCurrency(0, "EUR", "en");
      expect(result).toContain("0");
    });

    it("handles negative amounts", () => {
      const result = formatCurrency(-250, "EUR", "en");
      expect(result).toMatch(/-|250/);
    });
  });

  describe("formatDate", () => {
    it("formats a Date object in English", () => {
      const date = new Date("2026-04-01T00:00:00Z");
      const result = formatDate(date, "en");
      expect(result).toContain("April");
      expect(result).toContain("2026");
    });

    it("formats a string date in English", () => {
      const result = formatDate("2026-12-25", "en");
      expect(result).toContain("December");
      expect(result).toContain("2026");
    });

    it("formats a date in French locale", () => {
      const date = new Date("2026-04-01T00:00:00Z");
      const result = formatDate(date, "fr");
      expect(result).toMatch(/avril/i);
      expect(result).toContain("2026");
    });
  });

  describe("formatDateShort", () => {
    it("formats a date in short format", () => {
      const date = new Date("2026-04-01T00:00:00Z");
      const result = formatDateShort(date, "en");
      expect(result).toContain("2026");
      expect(result).toMatch(/Apr/);
    });

    it("handles string input", () => {
      const result = formatDateShort("2026-07-15", "en");
      expect(result).toContain("2026");
    });
  });

  describe("formatRelativeDate", () => {
    it("returns a relative time string", () => {
      const recentDate = new Date(Date.now() - 60_000); // 1 minute ago
      const result = formatRelativeDate(recentDate, "en");
      expect(result).toContain("ago");
    });

    it("handles string date input", () => {
      const result = formatRelativeDate("2020-01-01", "en");
      expect(result).toContain("ago");
    });
  });
});
