
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Tenant {
  id: string;
  name: string;
  is_onboarded?: boolean;
}

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  setTenant: () => {},
  currentTenant: null,
  setCurrentTenant: () => {},
  isLoading: true
});

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tenant data on initial load
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch user's tenant
          const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          if (!error && data) {
            setTenant(data);
            setCurrentTenant(data);
          }
        }
      } catch (error) {
        console.error('Error fetching tenant:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTenantData();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, setTenant, currentTenant, setCurrentTenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenantContext = () => useContext(TenantContext);
export const useTenant = () => useContext(TenantContext);

export default TenantContext;
