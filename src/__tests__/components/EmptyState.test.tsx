
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { FileIcon } from 'lucide-react';

describe('EmptyState', () => {
  it('renders with required props', () => {
    render(
      <EmptyState 
        title="No data available" 
        description="There's nothing to display at the moment." 
      />
    );
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText("There's nothing to display at the moment.")).toBeInTheDocument();
  });
  
  it('renders with custom icon', () => {
    render(
      <EmptyState 
        title="No files" 
        description="Upload some files to get started." 
        icon={<FileIcon data-testid="file-icon" />}
      />
    );
    
    expect(screen.getByTestId('file-icon')).toBeInTheDocument();
  });
  
  it('renders with action button', () => {
    render(
      <EmptyState 
        title="No items" 
        description="Add some items to get started." 
        action={<Button>Add Item</Button>}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });
  
  it('applies correct size classes', () => {
    const { rerender } = render(
      <EmptyState 
        title="Small Empty State" 
        description="Small description" 
        size="sm"
      />
    );
    
    const container = screen.getByText('Small Empty State').parentElement;
    expect(container).toHaveClass('py-4');
    
    rerender(
      <EmptyState 
        title="Large Empty State" 
        description="Large description" 
        size="lg"
      />
    );
    
    expect(container).toHaveClass('py-12');
  });
  
  it('applies custom className', () => {
    render(
      <EmptyState 
        title="Custom Class" 
        description="With custom class" 
        className="test-custom-class"
      />
    );
    
    const container = screen.getByText('Custom Class').parentElement;
    expect(container).toHaveClass('test-custom-class');
  });
});
