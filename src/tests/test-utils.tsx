
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '@/hooks/use-toast';

// Create a custom render function that includes all providers
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>{children}</ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render method
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Mock data generators
export const createMockSystemLog = (overrides = {}) => ({
  id: 'log-123',
  module: 'system',
  event: 'info',
  level: 'info',
  description: 'Test log entry',
  context: { test: true },
  tenant_id: 'tenant-123',
  created_at: new Date().toISOString(),
  user_id: 'user-123',
  ...overrides,
});

export const createMockAuditLog = (overrides = {}) => ({
  id: 'audit-123',
  action: 'create',
  entity_type: 'user',
  entity_id: 'user-123',
  user_id: 'admin-123',
  tenant_id: 'tenant-123',
  details: { before: null, after: { name: 'Test User' } },
  created_at: new Date().toISOString(),
  module: 'user',
  event: 'create',
  description: 'User created',
  context: { userId: 'user-123' },
  ...overrides,
});

export const createMockLogFilters = (overrides = {}) => ({
  searchTerm: '',
  module: '',
  event: '',
  tenant_id: 'tenant-123',
  fromDate: null,
  toDate: null,
  limit: 20,
  ...overrides,
});
