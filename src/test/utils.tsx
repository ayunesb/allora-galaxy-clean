
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../providers/ThemeProvider';
import { AuthProvider } from '../context/AuthContext';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';
import { vi } from 'vitest';
import { mockSupabaseModule } from './mocks/supabase';

// Mock the supabase module
vi.mock('@/lib/supabase', () => mockSupabaseModule);
vi.mock('@/integrations/supabase/client', () => mockSupabaseModule);

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Set up the router with the specified route
  window.history.pushState({}, 'Test page', route);

  function AllTheProviders({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <WorkspaceProvider>
              <BrowserRouter>{children}</BrowserRouter>
            </WorkspaceProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
}

// Mock user data for tests
export const mockUser = {
  id: 'mock-user-id',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
};

// Mock tenant/workspace data for tests
export const mockWorkspace = {
  id: 'mock-tenant-id',
  name: 'Mock Workspace',
  slug: 'mock-workspace',
  owner_id: 'mock-user-id',
};

// Mock notification for tests
export const mockNotification = {
  id: 'mock-notification-id',
  title: 'Test Notification',
  message: 'This is a test notification',
  type: 'info',
  tenant_id: 'mock-tenant-id',
  user_id: 'mock-user-id',
  created_at: new Date().toISOString(),
  read_at: null,
  action_url: null,
  action_label: null,
  metadata: {},
};

// Helper to wait for promises to resolve
export const waitForPromises = () => new Promise(resolve => setTimeout(resolve, 0));
