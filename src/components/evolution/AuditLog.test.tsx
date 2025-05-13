
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/tests/test-utils';
import AuditLog from './AuditLog';
import { createMockAuditLog } from '@/tests/test-utils';
import { supabase } from '@/lib/supabase';

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  },
}));

describe('AuditLog Component', () => {
  const mockLogs = [
    createMockAuditLog({ id: 'audit-1', entity_type: 'user', action: 'create' }),
    createMockAuditLog({ id: 'audit-2', entity_type: 'post', action: 'update' }),
  ];
  
  const mockEntityTypes = ['user', 'post', 'comment'];
  const mockActions = ['create', 'update', 'delete'];

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.from as jest.Mock).mockReturnThis();
    (supabase.select as jest.Mock).mockReturnThis();
    (supabase.order as jest.Mock).mockReturnThis();
    (supabase.eq as jest.Mock).mockReturnThis();
    (supabase.or as jest.Mock).mockReturnThis();
    (supabase.limit as jest.Mock).mockReturnThis();
    (supabase.select as jest.Mock).mockImplementation(() => {
      return {
        order: () => ({
          eq: () => ({
            limit: () => Promise.resolve({ data: mockLogs, error: null })
          })
        })
      };
    });
  });

  it('renders with provided data without fetching', async () => {
    render(<AuditLog data={mockLogs} />);
    
    await waitFor(() => {
      expect(supabase.from).not.toHaveBeenCalled(); // Should not fetch if data is provided
      expect(screen.getByText('Audit Log')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
      expect(screen.getByText('post')).toBeInTheDocument();
    });
  });

  it('fetches data if not provided', async () => {
    // Mock the fetch responses
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'audit_logs') {
        return {
          select: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: mockLogs, error: null })
            })
          })
        };
      } else if (table === 'audit_logs' && 
                supabase.select === 'entity_type') {
        return {
          select: () => ({
            order: () => Promise.resolve({ data: mockEntityTypes.map(t => ({ entity_type: t })), error: null })
          })
        };
      } else {
        return {
          select: () => ({
            order: () => Promise.resolve({ data: mockActions.map(a => ({ action: a })), error: null })
          })
        };
      }
    });
    
    render(<AuditLog />);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });

  it('displays custom title when provided', () => {
    render(<AuditLog data={mockLogs} title="Custom Log Title" />);
    expect(screen.getByText('Custom Log Title')).toBeInTheDocument();
  });

  it('shows loading state when loading', () => {
    render(<AuditLog isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('opens log detail dialog when a log is selected', async () => {
    render(<AuditLog data={mockLogs} />);
    
    // Wait for logs to render
    await waitFor(() => {
      expect(screen.getAllByText('View').length).toBe(2);
    });
    
    // Click on the first log's view button
    fireEvent.click(screen.getAllByText('View')[0]);
    
    // Dialog should be open with log details
    await waitFor(() => {
      expect(screen.getByText('Log Details')).toBeInTheDocument();
    });
  });

  it('applies filters correctly', async () => {
    render(<AuditLog />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument();
    });
    
    // Change the search term
    const searchInput = screen.getByPlaceholderText('Search logs...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    await waitFor(() => {
      // The filter change should have triggered a new fetch
      expect(supabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });

  it('respects tenant and entity filters', async () => {
    render(<AuditLog tenantId="tenant-123" entityType="user" entityId="user-123" />);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('audit_logs');
      expect(supabase.eq).toHaveBeenCalledWith('tenant_id', 'tenant-123');
      expect(supabase.eq).toHaveBeenCalledWith('entity_type', 'user');
      expect(supabase.eq).toHaveBeenCalledWith('entity_id', 'user-123');
    });
  });

  it('calls external refresh function when provided', async () => {
    const mockRefresh = jest.fn();
    render(<AuditLog onRefresh={mockRefresh} />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText(/refresh/i)).toBeInTheDocument();
    });
    
    // Click refresh button
    fireEvent.click(screen.getByText(/refresh/i));
    
    expect(mockRefresh).toHaveBeenCalled();
  });
});
