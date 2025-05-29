import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useEdgeFunction } from "@/hooks/useEdgeFunction";
import { toast } from "sonner";

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn().mockReturnValue("toast-1"),
    dismiss: vi.fn(),
  },
}));

describe("useEdgeFunction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle successful edge function calls", async () => {
    // Mock a successful API call
    const mockData = { result: "success" };
    const mockFetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    const { result } = renderHook(() =>
      useEdgeFunction(mockFetcher, {
        showToast: true,
        toastSuccessMessage: "Success!",
      }),
    );

    // Initial state check
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Execute the function
    let returnedData;
    await act(async () => {
      returnedData = await result.current.execute({ param: "test" });
    });

    // Verify states and responses
    expect(mockFetcher).toHaveBeenCalledWith({ param: "test" });
    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(returnedData).toEqual(mockData);
    expect(toast.success).toHaveBeenCalledWith("Success!");
  });

  it("should handle edge function errors", async () => {
    // Mock an error response
    const mockError = { message: "Test error", requestId: "req_123" };
    const mockFetcher = vi.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          success: false,
          error: mockError.message,
          requestId: mockError.requestId,
        }),
    });

    const onErrorMock = vi.fn();

    const { result } = renderHook(() =>
      useEdgeFunction(mockFetcher, {
        errorMessage: "Function failed",
        onError: onErrorMock,
      }),
    );

    // Execute the function
    await act(async () => {
      await result.current.execute();
    });

    // Verify error handling
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeNull();
    expect(onErrorMock).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it("should show loading toast when showLoadingToast is true", async () => {
    // Mock successful response
    const mockFetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    });

    const { result } = renderHook(() =>
      useEdgeFunction(mockFetcher, {
        showLoadingToast: true,
        loadingMessage: "Loading...",
      }),
    );

    // Start the operation
    await act(async () => {
      await result.current.execute();
    });

    // Verify loading toast was shown and dismissed
    expect(toast.loading).toHaveBeenCalledWith("Loading...");
    expect(toast.dismiss).toHaveBeenCalled();
  });

  it("should reset the state", async () => {
    // Mock successful response
    const mockFetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { result: "test" } }),
    });

    const { result } = renderHook(() => useEdgeFunction(mockFetcher));

    // Execute to set some data
    await act(async () => {
      await result.current.execute();
    });

    // Verify we have data
    expect(result.current.data).toEqual({ result: "test" });

    // Reset the state
    act(() => {
      result.current.reset();
    });

    // Verify state was reset
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetched).toBe(false);
  });

  it("should support retry functionality", async () => {
    // Mock a function that fails on first call and succeeds on retry
    const mockFetcher = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({ success: false, error: "Failed first attempt" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: { result: "retry worked" } }),
      });

    const { result } = renderHook(() => useEdgeFunction(mockFetcher));

    // First attempt - will fail
    await act(async () => {
      await result.current.execute({ test: true });
    });

    // Verify error state
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeNull();

    // Retry the operation
    await act(async () => {
      await result.current.retry();
    });

    // Verify retry worked
    expect(mockFetcher).toHaveBeenCalledTimes(2);
    expect(mockFetcher).toHaveBeenLastCalledWith({ test: true });
    expect(result.current.data).toEqual({ result: "retry worked" });
    expect(result.current.error).toBeNull();
  });
});
