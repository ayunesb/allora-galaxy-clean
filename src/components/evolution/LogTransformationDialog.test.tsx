
import React from 'react';
import { render, screen, fireEvent } from '@/tests/test-utils';
import LogTransformationDialog from './LogTransformationDialog';
import { createMockSystemLog, createMockAuditLog } from '@/tests/test-utils';

describe('LogTransformationDialog Component', () => {
  const mockSystemLog = createMockSystemLog();
  const mockAuditLog = createMockAuditLog();

  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    log: mockSystemLog,
    type: 'system' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
    
    // Check if the original log is displayed in the first tab
    expect(screen.getByText(/"module": "system"/)).toBeInTheDocument();
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
    
    // Check if the original log is displayed in the first tab
    expect(screen.getByText(/"entity_type": "user"/)).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    render(<LogTransformationDialog {...defaultProps} />);
    
    // Initially on the "original" tab
    expect(screen.getByText(/"module": "system"/)).toBeInTheDocument();
    
    // Switch to transformed tab
    fireEvent.click(screen.getByRole('tab', { name: /transformed log/i }));
    
    // Should now show the transformed log data
    expect(screen.getByText(/"entity_type": "system"/)).toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked', () => {
    render(<LogTransformationDialog {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
