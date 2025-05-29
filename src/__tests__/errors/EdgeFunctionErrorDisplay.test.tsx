import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EdgeFunctionErrorDisplay from "@/components/errors/EdgeFunctionErrorDisplay";

describe("EdgeFunctionErrorDisplay", () => {
  it("renders basic error message", () => {
    const error = new Error("Test error message");

    render(<EdgeFunctionErrorDisplay error={error} />);

    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("renders error with status code", () => {
    const error = {
      message: "Not Found",
      status: 404,
    };

    render(<EdgeFunctionErrorDisplay error={error} />);

    expect(screen.getByText("Not Found")).toBeInTheDocument();
    expect(screen.getByText(/404/)).toBeInTheDocument();
  });

  it("renders error details when available", () => {
    const error = {
      message: "Validation Error",
      status: 400,
      details: {
        field: "email",
        message: "Invalid email format",
      },
    };

    render(<EdgeFunctionErrorDisplay error={error} />);

    expect(screen.getByText("Validation Error")).toBeInTheDocument();
    expect(screen.getByText(/field/)).toBeInTheDocument();
    expect(screen.getByText(/email/)).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const error = new Error("Test error");
    const onRetryMock = vi.fn();

    render(<EdgeFunctionErrorDisplay error={error} onRetry={onRetryMock} />);

    const retryButton = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryButton);

    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when no onRetry prop is provided", () => {
    const error = new Error("Test error");

    render(<EdgeFunctionErrorDisplay error={error} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders nothing when error is null", () => {
    const { container } = render(<EdgeFunctionErrorDisplay error={null} />);

    expect(container.firstChild).toBeNull();
  });
});
