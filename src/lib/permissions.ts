import type { FamilyRole } from "@prisma/client";

const ROLE_HIERARCHY: Record<FamilyRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export const PERMISSIONS = {
  "property:create": ["OWNER", "ADMIN"],
  "property:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "property:update": ["OWNER", "ADMIN", "MEMBER"],
  "property:delete": ["OWNER", "ADMIN"],

  "task:create": ["OWNER", "ADMIN", "MEMBER"],
  "task:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "task:update": ["OWNER", "ADMIN", "MEMBER"],
  "task:delete": ["OWNER", "ADMIN"],

  "contact:create": ["OWNER", "ADMIN", "MEMBER"],
  "contact:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "contact:update": ["OWNER", "ADMIN", "MEMBER"],
  "contact:delete": ["OWNER", "ADMIN"],

  "document:upload": ["OWNER", "ADMIN", "MEMBER"],
  "document:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "document:delete": ["OWNER", "ADMIN"],

  "spending:create": ["OWNER", "ADMIN"],
  "spending:read": ["OWNER", "ADMIN"],
  "spending:update": ["OWNER", "ADMIN"],
  "spending:delete": ["OWNER", "ADMIN"],

  "event:create": ["OWNER", "ADMIN", "MEMBER"],
  "event:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "event:update": ["OWNER", "ADMIN", "MEMBER"],
  "event:delete": ["OWNER", "ADMIN"],

  "family:update": ["OWNER", "ADMIN"],
  "member:invite": ["OWNER", "ADMIN"],
  "member:remove": ["OWNER"],
  "member:changeRole": ["OWNER"],

  "notification:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "activity:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],

  "message:create": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "message:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "dashboard:edit": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(
  role: FamilyRole,
  permission: Permission
): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return (allowedRoles as readonly string[]).includes(role);
}

export function checkPermission(
  role: FamilyRole,
  permission: Permission
): void {
  if (!hasPermission(role, permission)) {
    throw new PermissionDeniedError(permission, role);
  }
}

export function isRoleAtLeast(
  role: FamilyRole,
  minimumRole: FamilyRole
): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole];
}

export class PermissionDeniedError extends Error {
  constructor(permission: Permission, role: FamilyRole) {
    super(`Role "${role}" does not have permission "${permission}"`);
    this.name = "PermissionDeniedError";
  }
}
