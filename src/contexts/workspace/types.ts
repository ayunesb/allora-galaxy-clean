
import { Tenant } from '@/types/tenant';

export interface TenantWithRole extends Tenant {
  role: string;
}
