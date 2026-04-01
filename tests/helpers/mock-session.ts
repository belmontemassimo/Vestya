import { vi } from "vitest";
import type { FamilyRole } from "@prisma/client";

export interface MockSessionUser {
  id: string;
  name: string;
  email: string;
  image: null;
  familyId: string;
  familyRole: FamilyRole;
  familyName: string;
}

export interface MockSession {
  user: MockSessionUser;
}

export function createMockSession(overrides: Partial<MockSessionUser> = {}): MockSession {
  return {
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@vestya.net",
      image: null,
      familyId: "test-family-id",
      familyRole: "OWNER",
      familyName: "Test Family",
      ...overrides,
    },
  };
}

export function mockAuthGuard(session: MockSession): void {
  vi.mock("@/lib/auth-guard", () => ({
    requireAuth: vi.fn().mockResolvedValue(session),
    requireFamilyAuth: vi.fn().mockResolvedValue(session),
  }));
}
