
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useTenantId } from './useTenantId';
import { UserRole } from '@/types/user'; // Import from user.ts instead of shared.ts

export function useTenantRole(requiredRole?: UserRole): {
  role: UserRole | null;
  isLoading: boolean;
  hasRequiredRole: boolean;
  isOwner: boolean;
  isAdmin: boolean;
} {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { tenantId } = useTenantId();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTenantRole() {
      if (!user?.id || !tenantId) {
        setIsLoading(false);
        setRole(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tenant_user_roles')
          .select('role')
          .eq('tenant_id', tenantId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching tenant role:', error);
          setRole(null);
        } else {
          setRole(data?.role as UserRole || null);
        }
      } catch (error) {
        console.error('Error in tenant role fetch:', error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTenantRole();
  }, [user?.id, tenantId]);

  useEffect(() => {
    // Redirect if required role isn't met and we've finished loading
    if (!isLoading && requiredRole && role !== requiredRole && !(requiredRole === 'admin' && role === 'owner')) {
      navigate('/dashboard');
    }
  }, [role, requiredRole, isLoading, navigate]);

  return {
    role,
    isLoading,
    hasRequiredRole: !requiredRole || role === requiredRole || (requiredRole === 'admin' && role === 'owner'),
    isOwner: role === 'owner',
    isAdmin: role === 'admin' || role === 'owner'
  };
}
