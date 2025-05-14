
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState Component', () => {
  it('renders with title', () => {
    render(<EmptyState title="No Data Found" />);
    
    expect(screen.getByText('No Data Found')).toBeInTheDocument();
  });

  it('renders with description when provided', () => {
    render(
      <EmptyState 
        title="No Results" 
        description="Try adjusting your search terms" 
      />
    );
    
    expect(screen.getByText('No Results')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument();
  });

  it('renders with icon when provided', () => {
    const icon = <div data-testid="test-icon">🔍</div>;
    render(<EmptyState title="No Results" icon={icon} />);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders with action button and calls onClick when clicked', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState 
        title="No Items" 
        action={{ 
          label: "Add Item", 
          onClick: handleAction 
        }} 
      />
    );
    
    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders children content when provided', () => {
    render(
      <EmptyState title="No Data">
        <div data-testid="child-content">Additional content</div>
      </EmptyState>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Additional content')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(
      <EmptyState 
        title="No Data" 
        className="custom-empty-state" 
      />
    );
    
    const container = document.querySelector('.custom-empty-state');
    expect(container).toBeInTheDocument();
  });
});
