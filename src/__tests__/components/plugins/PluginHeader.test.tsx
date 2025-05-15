
import { render, screen, fireEvent } from '@testing-library/react';
import { PluginHeader } from '@/components/plugins/detail/PluginHeader';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Plugin } from '@/types/plugin';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockNavigate = vi.fn();

describe('PluginHeader Component', () => {
  const mockPlugin: Plugin = {
    id: 'test-plugin-id',
    name: 'Test Plugin',
    description: 'This is a test plugin description',
    status: 'active',
    icon: 'test-icon',
    category: 'analytics',
    xp: 100,
    roi: 25,
    tenant_id: 'test-tenant-id',
    created_at: '2023-05-15T10:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the plugin name and description', () => {
    render(<PluginHeader plugin={mockPlugin} id="test-plugin-id" />);
    
    expect(screen.getByText('Test Plugin')).toBeInTheDocument();
    expect(screen.getByText('This is a test plugin description')).toBeInTheDocument();
  });

  test('displays the correct status badge', () => {
    render(<PluginHeader plugin={mockPlugin} id="test-plugin-id" />);
    
    const statusBadge = screen.getByText('active');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge.closest('span')).toHaveClass('bg-primary');
    
    // Test with inactive status
    const inactivePlugin = { ...mockPlugin, status: 'inactive' };
    render(<PluginHeader plugin={inactivePlugin} id="test-plugin-id" />);
    
    const inactiveBadge = screen.getByText('inactive');
    expect(inactiveBadge).toBeInTheDocument();
    expect(inactiveBadge.closest('span')).toHaveClass('bg-secondary');
  });

  test('navigates back when back button is clicked', () => {
    render(<PluginHeader plugin={mockPlugin} id="test-plugin-id" />);
    
    const backButton = screen.getByLabelText('Go back');
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('navigates to evolution chain when evolution button is clicked', () => {
    render(<PluginHeader plugin={mockPlugin} id="test-plugin-id" />);
    
    const evolutionButton = screen.getByText('Evolution Chain', { exact: false });
    fireEvent.click(evolutionButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/plugins/test-plugin-id/evolution');
  });

  test('navigates to edit page when edit button is clicked', () => {
    render(<PluginHeader plugin={mockPlugin} id="test-plugin-id" />);
    
    const editButton = screen.getByText('Edit Plugin');
    fireEvent.click(editButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/plugins/test-plugin-id/edit');
  });

  test('renders responsive layout on different screen sizes', () => {
    // Mock window.matchMedia for testing responsiveness
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { container } = render(<PluginHeader plugin={mockPlugin} id="test-plugin-id" />);
    
    // Check for the flex container with responsive classes
    const headerContainer = container.firstChild;
    expect(headerContainer).toHaveClass('flex-col');
    expect(headerContainer).toHaveClass('md:flex-row');
  });

  test('handles plugins with minimal data', () => {
    const minimalPlugin: Plugin = {
      id: 'minimal-plugin',
      name: 'Minimal Plugin',
      status: 'deprecated',
    };
    
    render(<PluginHeader plugin={minimalPlugin} id="minimal-plugin" />);
    
    expect(screen.getByText('Minimal Plugin')).toBeInTheDocument();
    expect(screen.getByText('deprecated')).toBeInTheDocument();
  });
});
