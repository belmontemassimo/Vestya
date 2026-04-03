import type { FamilyRole } from "@prisma/client";

const ROLE_HIERARCHY: Record<FamilyRole, number> = {
  OWNER: 4, // Legacy — treated same as ADMIN
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1, // Legacy — treated same as MEMBER
};

export const PERMISSIONS = {
  // Properties — Admin only
  "property:create": ["OWNER", "ADMIN"],
  "property:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "property:update": ["OWNER", "ADMIN"],
  "property:delete": ["OWNER", "ADMIN"],

  // Tasks — Member can create and complete, Admin can do everything
  "task:create": ["OWNER", "ADMIN", "MEMBER"],
  "task:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "task:update": ["OWNER", "ADMIN"],
  "task:delete": ["OWNER", "ADMIN"],
  "task:complete": ["OWNER", "ADMIN", "MEMBER"],

  // Contacts — Member can create, Admin can do everything
  "contact:create": ["OWNER", "ADMIN", "MEMBER"],
  "contact:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "contact:update": ["OWNER", "ADMIN"],
  "contact:delete": ["OWNER", "ADMIN"],

  // Documents — Member can upload, Admin can do everything
  "document:upload": ["OWNER", "ADMIN", "MEMBER"],
  "document:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "document:update": ["OWNER", "ADMIN"],
  "document:delete": ["OWNER", "ADMIN"],

  // Spending — Member can view and create, Admin can do everything
  "spending:create": ["OWNER", "ADMIN", "MEMBER"],
  "spending:read": ["OWNER", "ADMIN", "MEMBER"],
  "spending:update": ["OWNER", "ADMIN"],
  "spending:delete": ["OWNER", "ADMIN"],

  // Events — Member can create, Admin can do everything
  "event:create": ["OWNER", "ADMIN", "MEMBER"],
  "event:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "event:update": ["OWNER", "ADMIN"],
  "event:delete": ["OWNER", "ADMIN"],

  // Family management — Admin only
  "family:update": ["OWNER", "ADMIN"],
  "member:invite": ["OWNER", "ADMIN"],
  "member:remove": ["OWNER", "ADMIN"],
  "member:changeRole": ["OWNER", "ADMIN"],

  // General — everyone
  "notification:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "activity:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "message:create": ["OWNER", "ADMIN", "MEMBER"],
  "message:read": ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  "dashboard:edit": ["OWNER", "ADMIN", "MEMBER"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(
  role: FamilyRole,
  permission: Permission,
): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return (allowedRoles as readonly string[]).includes(role);
}

export function checkPermission(
  role: FamilyRole,
  permission: Permission,
): void {
  if (!hasPermission(role, permission)) {
    throw new PermissionDeniedError(permission, role);
  }
}

export function isRoleAtLeast(
  role: FamilyRole,
  minimumRole: FamilyRole,
): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole];
}

export class PermissionDeniedError extends Error {
  constructor(permission: Permission, role: FamilyRole) {
    super(`Role "${role}" does not have permission "${permission}"`);
    this.name = "PermissionDeniedError";
  }
}
