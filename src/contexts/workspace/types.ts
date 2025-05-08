
import { NavigationItem } from '@/types/navigation';

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  role?: string;
}

export interface WorkspaceContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  navigationItems: NavigationItem[];
  refreshTenant: () => Promise<void>;
}
