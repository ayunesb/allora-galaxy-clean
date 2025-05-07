
import { useWorkspace } from "@/context/WorkspaceContext";
import { useAuth } from "@/context/AuthContext";

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer' | 'pending';

const roleHierarchy: Record<UserRole, number> = {
  'owner': 4,
  'admin': 3,
  'member': 2,
  'viewer': 1,
  'pending': 0
};

/**
 * Utility function to check if a user has a required role or higher
 * @param requiredRole - The minimum role required
 * @returns boolean indicating if the user meets or exceeds the required role
 */
export function requireRole(requiredRole: UserRole): boolean {
  const { session } = useAuth();
  const { userRole } = useWorkspace();
  
  // If no session or no role, the user doesn't have sufficient permissions
  if (!session || !userRole) {
    return false;
  }
  
  const userRoleLevel = roleHierarchy[userRole];
  const requiredRoleLevel = roleHierarchy[requiredRole];
  
  // User role meets or exceeds the required role
  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Get the display name of a role
 * @param role - The role to get the display name for
 * @returns - The display name of the role
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
    case 'pending':
      return 'Pending';
    default:
      return 'Unknown';
  }
}
