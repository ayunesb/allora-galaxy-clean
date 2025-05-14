
import { UserRole } from '@/types/shared';

/**
 * Re-exports the standard UserRole type from shared.ts
 */
export { UserRole };

export const USER_ROLES: UserRole[] = ['admin', 'owner', 'member', 'viewer', 'guest'];

/**
 * Gets a display name for a user role
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    admin: 'Administrator',
    owner: 'Owner',
    member: 'Member',
    viewer: 'Viewer',
    guest: 'Guest',
    user: 'User'
  };
  
  return displayNames[role] || role;
}
