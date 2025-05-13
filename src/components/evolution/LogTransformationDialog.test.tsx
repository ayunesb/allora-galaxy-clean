
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@/tests/test-utils';
import LogTransformationDialog from './LogTransformationDialog';
import { createMockSystemLog, createMockAuditLog } from '@/tests/test-utils';

describe('LogTransformationDialog Component', () => {
  const mockSystemLog = createMockSystemLog();
  const mockAuditLog = createMockAuditLog();

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    log: mockSystemLog,
    type: 'system' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when log is null', () => {
    const { container } = render(
      <LogTransformationDialog {...defaultProps} log={null} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders system log transformation correctly', () => {
    render(<LogTransformationDialog {...defaultProps} />);
    
    expect(screen.getByText('Log Transformation')).toBeInTheDocument();
    expect(screen.getByText('Original Log (System)')).toBeInTheDocument();
    expect(screen.getByText('Transformed Log (Audit)')).toBeInTheDocument();
  });

  it('renders audit log transformation correctly', () => {
    render(
      <LogTransformationDialog
        {...defaultProps}
        log={mockAuditLog}
        type="audit"
      />
    );
    
    expect(screen.getByText('Original Log (Audit)')).toBeInTheDocument();
    expect(screen.getByText('Transformed Log (System)')).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    render(<LogTransformationDialog {...defaultProps} />);
    
    // Initially on the "original" tab
    const transformedTab = screen.getByRole('tab', { name: /transformed log/i });
    fireEvent.click(transformedTab);
  });

  it('calls onOpenChange when close button is clicked', () => {
    render(<LogTransformationDialog {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
