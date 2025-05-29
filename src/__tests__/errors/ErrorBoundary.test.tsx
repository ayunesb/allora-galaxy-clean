import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, afterEach, expect } from "vitest";
import { ErrorBoundary } from "@/components/errors";

// Mock error handlers
vi.mock("@/lib/errors/ErrorHandler", () => ({
  ErrorHandler: {
    handleError: vi.fn().mockResolvedValue({ message: "Test error" }),
  },
}));

// Mock toast
vi.mock("@/lib/notifications/toast", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock system event logger
vi.mock("@/lib/system/logSystemEvent", () => ({
  logSystemEvent: vi.fn().mockResolvedValue({ success: true }),
}));

// Create a component that throws an error
const ThrowsError = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

// Custom fallback for testing
const CustomFallback = () => <div>Custom fallback</div>;

describe("ErrorBoundary", () => {
  // Reset mocks after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders without errors when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders fallback UI when an error occurs", () => {
    // We need to mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary>
        <ThrowsError />
      </ErrorBoundary>,
    );

    // Check that fallback UI is rendered
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

    // Restore console.error
    console.error = originalConsoleError;
  });

  it("allows reset of error boundary", () => {
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowsError shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Verify error state
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

    // Find and click the "Try Again" button
    fireEvent.click(screen.getByRole("button", { name: /Try again/i }));

    // Re-render with shouldThrow=false to simulate fixing the issue
    rerender(
      <ErrorBoundary>
        <ThrowsError shouldThrow={false} />
      </ErrorBoundary>,
    );

    // Verify the error boundary has reset and the component renders correctly
    expect(screen.getByText("No error")).toBeInTheDocument();

    // Restore console.error
    console.error = originalConsoleError;
  });

  it("renders custom fallback if provided", () => {
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowsError />
      </ErrorBoundary>,
    );

    // Check that custom fallback is rendered
    expect(screen.getByText("Custom fallback")).toBeInTheDocument();

    // Restore console.error
    console.error = originalConsoleError;
  });
});
