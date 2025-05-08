
import { NavigationItem } from '@/types/navigation';

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  role?: string;
  metadata?: Record<string, any>;
}

export interface WorkspaceContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  navigationItems: NavigationItem[];
  refreshTenant: () => Promise<void>;
  currentRole?: string; // Add this property
  loading?: boolean;    // Add this for backward compatibility
  userRole?: string;    // Add this for backward compatibility
}
