import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ErrorState } from "@/components/ui/error-state";

describe("ErrorState", () => {
  it("renders with default props", () => {
    render(<ErrorState />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("An error occurred while loading data"),
    ).toBeInTheDocument();
  });

  it("renders custom title and message", () => {
    render(
      <ErrorState title="Custom Error Title" message="Custom error message" />,
    );

    expect(screen.getByText("Custom Error Title")).toBeInTheDocument();
    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("renders retry button when retry function is provided", () => {
    const mockRetry = vi.fn();

    render(<ErrorState retry={mockRetry} />);

    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when retry function is not provided", () => {
    render(<ErrorState />);

    const retryButton = screen.queryByRole("button", { name: /try again/i });
    expect(retryButton).not.toBeInTheDocument();
  });

  it("shows error details when showDetails is true and error is provided", () => {
    const testError = new Error("Test error details");

    render(<ErrorState error={testError} showDetails={true} />);

    expect(screen.getByText("Error Details:")).toBeInTheDocument();
    expect(screen.getByText("Test error details")).toBeInTheDocument();
  });

  it("applies size classes correctly", () => {
    const { rerender } = render(<ErrorState size="sm" />);
    const container = screen.getByText("Something went wrong").parentElement;
    expect(container).toHaveClass("py-4");

    rerender(<ErrorState size="lg" />);
    expect(container).toHaveClass("py-12");
  });
});
