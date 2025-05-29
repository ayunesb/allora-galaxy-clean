import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useOptimizedDebounce } from "@/hooks/useOptimizedDebounce";

// Mock timer
vi.useFakeTimers();

describe("useOptimizedDebounce", () => {
  it("returns the initial value", () => {
    const { result } = renderHook(() => useOptimizedDebounce("initial", 500));

    expect(result.current.value).toBe("initial");
    expect(result.current.debouncedValue).toBe("initial");
  });

  it("updates value immediately but debounces debouncedValue", () => {
    const { result } = renderHook(() => useOptimizedDebounce("initial", 500));

    act(() => {
      result.current.setSearchValue("updated");
    });

    expect(result.current.value).toBe("updated");
    expect(result.current.debouncedValue).toBe("initial");

    // Fast forward timer
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.value).toBe("updated");
    expect(result.current.debouncedValue).toBe("updated");
  });

  it("resets the timer when value changes multiple times", () => {
    const { result } = renderHook(() => useOptimizedDebounce("initial", 500));

    act(() => {
      result.current.setSearchValue("first");
    });

    // Partially advance timer
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedValue).toBe("initial");

    act(() => {
      result.current.setSearchValue("second");
    });

    // Partially advance timer again
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedValue).toBe("initial");

    // Complete the timer
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.debouncedValue).toBe("second");
  });

  it("clears timeout when component unmounts", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    const { unmount } = renderHook(() => useOptimizedDebounce("initial", 500));

    act(() => {
      unmount();
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
