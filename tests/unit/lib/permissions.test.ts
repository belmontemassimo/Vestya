import { describe, it, expect } from "vitest";
import {
  hasPermission,
  checkPermission,
  isRoleAtLeast,
  PermissionDeniedError,
  PERMISSIONS,
  type Permission,
} from "@/lib/permissions";
import type { FamilyRole } from "@prisma/client";

describe("permissions", () => {
  describe("hasPermission", () => {
    describe("OWNER role", () => {
      const role: FamilyRole = "OWNER";

      it("has all permissions", () => {
        const allPermissions = Object.keys(PERMISSIONS) as Permission[];
        for (const permission of allPermissions) {
          expect(hasPermission(role, permission)).toBe(true);
        }
      });
    });

    describe("ADMIN role", () => {
      const role: FamilyRole = "ADMIN";

      it("can create, read, update, and delete properties", () => {
        expect(hasPermission(role, "property:create")).toBe(true);
        expect(hasPermission(role, "property:read")).toBe(true);
        expect(hasPermission(role, "property:update")).toBe(true);
        expect(hasPermission(role, "property:delete")).toBe(true);
      });

      it("can manage tasks", () => {
        expect(hasPermission(role, "task:create")).toBe(true);
        expect(hasPermission(role, "task:read")).toBe(true);
        expect(hasPermission(role, "task:update")).toBe(true);
        expect(hasPermission(role, "task:delete")).toBe(true);
      });

      it("can manage spending", () => {
        expect(hasPermission(role, "spending:create")).toBe(true);
        expect(hasPermission(role, "spending:read")).toBe(true);
        expect(hasPermission(role, "spending:update")).toBe(true);
        expect(hasPermission(role, "spending:delete")).toBe(true);
      });

      it("can invite members", () => {
        expect(hasPermission(role, "member:invite")).toBe(true);
      });

      it("cannot remove members", () => {
        expect(hasPermission(role, "member:remove")).toBe(false);
      });

      it("cannot change member roles", () => {
        expect(hasPermission(role, "member:changeRole")).toBe(false);
      });
    });

    describe("MEMBER role", () => {
      const role: FamilyRole = "MEMBER";

      it("can create and read tasks", () => {
        expect(hasPermission(role, "task:create")).toBe(true);
        expect(hasPermission(role, "task:read")).toBe(true);
        expect(hasPermission(role, "task:update")).toBe(true);
      });

      it("cannot delete tasks", () => {
        expect(hasPermission(role, "task:delete")).toBe(false);
      });

      it("can create and read contacts", () => {
        expect(hasPermission(role, "contact:create")).toBe(true);
        expect(hasPermission(role, "contact:read")).toBe(true);
        expect(hasPermission(role, "contact:update")).toBe(true);
      });

      it("cannot delete contacts", () => {
        expect(hasPermission(role, "contact:delete")).toBe(false);
      });

      it("can upload and read documents", () => {
        expect(hasPermission(role, "document:upload")).toBe(true);
        expect(hasPermission(role, "document:read")).toBe(true);
      });

      it("cannot delete documents", () => {
        expect(hasPermission(role, "document:delete")).toBe(false);
      });

      it("can create, read, and update events", () => {
        expect(hasPermission(role, "event:create")).toBe(true);
        expect(hasPermission(role, "event:read")).toBe(true);
        expect(hasPermission(role, "event:update")).toBe(true);
      });

      it("cannot delete events", () => {
        expect(hasPermission(role, "event:delete")).toBe(false);
      });

      it("cannot manage spending", () => {
        expect(hasPermission(role, "spending:create")).toBe(false);
        expect(hasPermission(role, "spending:read")).toBe(false);
        expect(hasPermission(role, "spending:update")).toBe(false);
        expect(hasPermission(role, "spending:delete")).toBe(false);
      });

      it("cannot create properties", () => {
        expect(hasPermission(role, "property:create")).toBe(false);
      });

      it("cannot invite or manage members", () => {
        expect(hasPermission(role, "member:invite")).toBe(false);
        expect(hasPermission(role, "member:remove")).toBe(false);
        expect(hasPermission(role, "member:changeRole")).toBe(false);
      });
    });

    describe("VIEWER role", () => {
      const role: FamilyRole = "VIEWER";

      it("can only read properties, tasks, contacts, documents, events", () => {
        expect(hasPermission(role, "property:read")).toBe(true);
        expect(hasPermission(role, "task:read")).toBe(true);
        expect(hasPermission(role, "contact:read")).toBe(true);
        expect(hasPermission(role, "document:read")).toBe(true);
        expect(hasPermission(role, "event:read")).toBe(true);
      });

      it("can read notifications and activity", () => {
        expect(hasPermission(role, "notification:read")).toBe(true);
        expect(hasPermission(role, "activity:read")).toBe(true);
      });

      it("cannot create anything", () => {
        expect(hasPermission(role, "property:create")).toBe(false);
        expect(hasPermission(role, "task:create")).toBe(false);
        expect(hasPermission(role, "contact:create")).toBe(false);
        expect(hasPermission(role, "event:create")).toBe(false);
        expect(hasPermission(role, "spending:create")).toBe(false);
      });

      it("cannot update anything", () => {
        expect(hasPermission(role, "property:update")).toBe(false);
        expect(hasPermission(role, "task:update")).toBe(false);
        expect(hasPermission(role, "contact:update")).toBe(false);
        expect(hasPermission(role, "event:update")).toBe(false);
        expect(hasPermission(role, "spending:update")).toBe(false);
      });

      it("cannot delete anything", () => {
        expect(hasPermission(role, "property:delete")).toBe(false);
        expect(hasPermission(role, "task:delete")).toBe(false);
        expect(hasPermission(role, "contact:delete")).toBe(false);
        expect(hasPermission(role, "document:delete")).toBe(false);
        expect(hasPermission(role, "event:delete")).toBe(false);
        expect(hasPermission(role, "spending:delete")).toBe(false);
      });

      it("cannot manage spending at all", () => {
        expect(hasPermission(role, "spending:read")).toBe(false);
      });

      it("cannot manage members or family", () => {
        expect(hasPermission(role, "family:update")).toBe(false);
        expect(hasPermission(role, "member:invite")).toBe(false);
        expect(hasPermission(role, "member:remove")).toBe(false);
        expect(hasPermission(role, "member:changeRole")).toBe(false);
      });
    });
  });

  describe("checkPermission", () => {
    it("does not throw when role has permission", () => {
      expect(() => checkPermission("OWNER", "property:create")).not.toThrow();
    });

    it("throws PermissionDeniedError when role lacks permission", () => {
      expect(() => checkPermission("VIEWER", "property:create")).toThrow(
        PermissionDeniedError,
      );
    });

    it("throws with descriptive message including role and permission", () => {
      expect(() => checkPermission("MEMBER", "spending:create")).toThrow(
        'Role "MEMBER" does not have permission "spending:create"',
      );
    });

    it("thrown error has correct name", () => {
      try {
        checkPermission("VIEWER", "task:create");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(PermissionDeniedError);
        expect((error as PermissionDeniedError).name).toBe(
          "PermissionDeniedError",
        );
      }
    });
  });

  describe("isRoleAtLeast", () => {
    it("OWNER is at least every role", () => {
      expect(isRoleAtLeast("OWNER", "OWNER")).toBe(true);
      expect(isRoleAtLeast("OWNER", "ADMIN")).toBe(true);
      expect(isRoleAtLeast("OWNER", "MEMBER")).toBe(true);
      expect(isRoleAtLeast("OWNER", "VIEWER")).toBe(true);
    });

    it("ADMIN is at least ADMIN, MEMBER, and VIEWER", () => {
      expect(isRoleAtLeast("ADMIN", "OWNER")).toBe(false);
      expect(isRoleAtLeast("ADMIN", "ADMIN")).toBe(true);
      expect(isRoleAtLeast("ADMIN", "MEMBER")).toBe(true);
      expect(isRoleAtLeast("ADMIN", "VIEWER")).toBe(true);
    });

    it("MEMBER is at least MEMBER and VIEWER", () => {
      expect(isRoleAtLeast("MEMBER", "OWNER")).toBe(false);
      expect(isRoleAtLeast("MEMBER", "ADMIN")).toBe(false);
      expect(isRoleAtLeast("MEMBER", "MEMBER")).toBe(true);
      expect(isRoleAtLeast("MEMBER", "VIEWER")).toBe(true);
    });

    it("VIEWER is only at least VIEWER", () => {
      expect(isRoleAtLeast("VIEWER", "OWNER")).toBe(false);
      expect(isRoleAtLeast("VIEWER", "ADMIN")).toBe(false);
      expect(isRoleAtLeast("VIEWER", "MEMBER")).toBe(false);
      expect(isRoleAtLeast("VIEWER", "VIEWER")).toBe(true);
    });
  });
});
