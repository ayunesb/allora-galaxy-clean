
/**
 * Common role definitions and utilities for the authentication system
 */

/**
 * User role types in order of privilege (highest to lowest)
 */
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * Hierarchy of roles for permission checks
 * Higher number = more permissions
 */
export const roleHierarchy: Record<UserRole, number> = {
  'owner': 4,
  'admin': 3,
  'member': 2,
  'viewer': 1,
};

/**
 * Options for role check hooks and components
 */
export interface RoleCheckOptions {
  requiredRole: UserRole | UserRole[];
  redirectTo?: string;
  silent?: boolean;
}

/**
 * Get the display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'admin':
      return 'Administrator';
    case 'member':
      return 'Member';
    case 'viewer':
      return 'Viewer';
    default:
      return 'Unknown';
  }
}

/**
 * Check if a user role meets the required permission level
 */
export function checkRolePermission(
  userRole: UserRole | null | undefined,
  requiredRole: UserRole | UserRole[]
): boolean {
  if (!userRole) return false;
  
  const userRoleLevel = roleHierarchy[userRole] || 0;
  
  if (Array.isArray(requiredRole)) {
    // Find the minimum required level from the array of roles
    const minimumRequiredLevel = Math.min(
      ...requiredRole.map(role => roleHierarchy[role] || Number.MAX_SAFE_INTEGER)
    );
    return userRoleLevel >= minimumRequiredLevel;
  }
  
  // Check against a single role
  const requiredRoleLevel = roleHierarchy[requiredRole];
  return userRoleLevel >= requiredRoleLevel;
}
