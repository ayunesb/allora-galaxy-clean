
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import type { LogFilters } from '@/types/logs';

// Mock date-fns to avoid timezone issues in tests
vi.mock('date-fns', () => ({
  format: vi.fn(() => 'Jan 1, 2025'),
}));

// Reset mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
});

describe('SystemLogFilters', () => {
  it('renders all filter controls when all flags are enabled', () => {
    const filters: LogFilters = {};
    const onFiltersChange = vi.fn();
    
    render(
      <SystemLogFilters 
        filters={filters}
        onFiltersChange={onFiltersChange}
        showModuleFilter={true}
        showLevelFilter={true}
        showSeverityFilter={true}
        showDateFilter={true}
        showSearchFilter={true}
      />
    );
    
    expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Module')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Date range')).toBeInTheDocument();
  });

  it('calls onFiltersChange when search input changes', async () => {
    const filters: LogFilters = {};
    const onFiltersChange = vi.fn();
    
    render(
      <SystemLogFilters 
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search logs...');
    fireEvent.change(searchInput, { target: { value: 'error' } });
    
    // Wait for debounce
    await waitFor(() => {
      expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({
        search: 'error',
        searchTerm: 'error'
      }));
    }, { timeout: 350 });
  });

  it('calls onFiltersChange when level changes', () => {
    const filters: LogFilters = {};
    const onFiltersChange = vi.fn();
    
    render(
      <SystemLogFilters 
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    );
    
    // Open the level dropdown
    fireEvent.click(screen.getByText('Level'));
    
    // Select 'Error'
    fireEvent.click(screen.getByText('Error'));
    
    expect(onFiltersChange).toHaveBeenCalledWith({ level: 'error' });
  });

  it('handles reset filters correctly', () => {
    const filters: LogFilters = { 
      level: 'error',
      search: 'test'
    };
    const onFiltersChange = vi.fn();
    
    render(
      <SystemLogFilters 
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    );
    
    // Find and click the reset button
    fireEvent.click(screen.getByText('Reset filters'));
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      level: undefined,
      module: undefined,
      severity: undefined,
      fromDate: undefined,
      toDate: undefined,
      date_range: undefined,
      dateRange: undefined,
      search: '',
      searchTerm: ''
    });
  });

  it('displays active filter count correctly', () => {
    const filters: LogFilters = { 
      level: 'error',
      module: 'system',
      search: 'test'
    };
    const onFiltersChange = vi.fn();
    
    render(
      <SystemLogFilters 
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    );
    
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('applies custom modules when provided', () => {
    const filters: LogFilters = {};
    const onFiltersChange = vi.fn();
    const customModules = ['custom1', 'custom2'];
    
    render(
      <SystemLogFilters 
        filters={filters}
        onFiltersChange={onFiltersChange}
        modules={customModules}
      />
    );
    
    // Open the module dropdown
    fireEvent.click(screen.getByText('Module'));
    
    // Check if custom modules are displayed
    expect(screen.getByText('Custom1')).toBeInTheDocument();
    expect(screen.getByText('Custom2')).toBeInTheDocument();
  });
});
