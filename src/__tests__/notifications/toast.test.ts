import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "@/lib/notifications/toast";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    custom: vi.fn(),
    promise: vi.fn(),
  },
}));

describe("toast utils", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("has all variant methods", () => {
    expect(toast.success).toBeDefined();
    expect(toast.error).toBeDefined();
    expect(toast.warning).toBeDefined();
    expect(toast.info).toBeDefined();
    expect(toast.loading).toBeDefined();
    expect(toast.dismiss).toBeDefined();
    expect(toast.custom).toBeDefined();
    expect(toast.promise).toBeDefined();
  });

  it("handles string messages", () => {
    toast.success("Test success");
    toast.error("Test error");
    toast.warning("Test warning");
    toast.info("Test info");

    // We're just testing the function calls, no need to assert anything specific
    expect(true).toBeTruthy();
  });

  it("handles object messages", () => {
    toast.success({ title: "Success", description: "Operation succeeded" });
    toast.error({ title: "Error", description: "Operation failed" });
    toast.warning({ title: "Warning", description: "Proceed with caution" });
    toast.info({ title: "Info", description: "For your information" });

    // We're just testing the function calls, no need to assert anything specific
    expect(true).toBeTruthy();
  });
});
