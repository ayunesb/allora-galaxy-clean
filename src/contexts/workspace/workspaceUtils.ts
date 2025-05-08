
import { TenantWithRole } from '@/types/tenant';
import { Tenant } from '@/types/tenant';

/**
 * Sorts tenants by role precedence (owner > admin > member > guest)
 */
export function sortTenantsByRole(tenants: TenantWithRole[]): TenantWithRole[] {
  const rolePrecedence: Record<string, number> = {
    'owner': 0,
    'admin': 1,
    'member': 2,
    'guest': 3
  };
  
  return [...tenants].sort((a, b) => {
    const roleDiff = (rolePrecedence[a.role] || 99) - (rolePrecedence[b.role] || 99);
    
    // If roles are equal, sort alphabetically
    if (roleDiff === 0) {
      return (a.name || '').localeCompare(b.name || '');
    }
    
    return roleDiff;
  });
}

/**
 * Format tenant display name with role
 */
export function formatTenantWithRole(tenant: TenantWithRole): string {
  if (!tenant) return '';
  return `${tenant.name} (${tenant.role})`;
}

/**
 * Gets user's available tenants
 */
export async function getUserTenants(userId: string): Promise<TenantWithRole[]> {
  // Implementation would depend on your data fetching logic
  // This is a placeholder implementation
  return [];
}
