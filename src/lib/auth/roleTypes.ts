/**
 * Defines the user role types for the application
 */
export type UserRole = "admin" | "owner" | "member" | "viewer" | "guest";

export const USER_ROLES: UserRole[] = [
  "admin",
  "owner",
  "member",
  "viewer",
  "guest",
];

/**
 * Gets a display name for a user role
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    admin: "Administrator",
    owner: "Owner",
    member: "Member",
    viewer: "Viewer",
    guest: "Guest",
  };

  return displayNames[role] || role;
}
