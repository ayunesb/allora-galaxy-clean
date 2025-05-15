
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorFallback from '@/components/errors/ErrorFallback';

// Mock dependencies
vi.mock('@/lib/notifications/toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue({ success: true })
}));

describe('ErrorFallback', () => {
  it('renders error information', () => {
    const testError = new Error('Test error message');
    const resetMock = vi.fn();

    render(
      <ErrorFallback 
        error={testError} 
        resetErrorBoundary={resetMock}
      />
    );

    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    expect(screen.getByText(/Test error message/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });

  it('calls reset function when try again button is clicked', () => {
    const testError = new Error('Test error');
    const resetMock = vi.fn();

    render(
      <ErrorFallback 
        error={testError} 
        resetErrorBoundary={resetMock}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));
    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it('renders custom title and description', () => {
    const testError = new Error('Test error');
    const resetMock = vi.fn();
    const customTitle = 'Custom Error Title';
    const customDesc = 'This is a custom error description';

    render(
      <ErrorFallback 
        error={testError} 
        resetErrorBoundary={resetMock}
        title={customTitle}
        description={customDesc}
      />
    );

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customDesc)).toBeInTheDocument();
  });

  it('hides reset button when hideResetButton is true', () => {
    const testError = new Error('Test error');
    const resetMock = vi.fn();

    render(
      <ErrorFallback 
        error={testError} 
        resetErrorBoundary={resetMock}
        hideResetButton={true}
      />
    );

    expect(screen.queryByRole('button', { name: /Try again/i })).not.toBeInTheDocument();
  });
});
