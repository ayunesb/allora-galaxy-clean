import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SystemLogFilters from "@/components/admin/logs/SystemLogFilters";
import { LogFilters } from "@/types/logs";

describe("SystemLogFilters", () => {
  // Mock data for filters
  const mockModules = ["auth", "api", "system"];
  const mockLevels = ["info", "warning", "error"];
  const mockSeverities = ["low", "medium", "high", "critical"];

  // Mock function for filter change
  const mockOnFiltersChange = vi.fn();

  // Initial filters
  const initialFilters: LogFilters = {
    search: "",
    level: [],
    module: [],
    severity: [],
  };

  beforeEach(() => {
    // Reset mock function before each test
    mockOnFiltersChange.mockReset();
  });

  it("renders all filter sections", () => {
    render(
      <SystemLogFilters
        filters={initialFilters}
        onFiltersChange={mockOnFiltersChange}
        modules={mockModules}
        levels={mockLevels}
        severities={mockSeverities}
      />,
    );

    // Check for search input
    expect(screen.getByPlaceholderText("Search logs...")).toBeInTheDocument();

    // Check for filter sections
    expect(screen.getByText("All Levels")).toBeInTheDocument();
    expect(screen.getByText("All Modules")).toBeInTheDocument();
    expect(screen.getByText("All Severities")).toBeInTheDocument();
    expect(screen.getByText("Date Range")).toBeInTheDocument();
  });

  it("calls onFiltersChange when search input changes", () => {
    render(
      <SystemLogFilters
        filters={initialFilters}
        onFiltersChange={mockOnFiltersChange}
        modules={mockModules}
        levels={mockLevels}
        severities={mockSeverities}
      />,
    );

    const searchInput = screen.getByPlaceholderText("Search logs...");
    fireEvent.change(searchInput, { target: { value: "test search" } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...initialFilters,
      search: "test search",
    });
  });

  it("displays filter badges when filters are active", () => {
    const activeFilters: LogFilters = {
      search: "error",
      level: ["error"],
      module: ["api"],
      severity: ["high"],
    };

    render(
      <SystemLogFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        modules={mockModules}
        levels={mockLevels}
        severities={mockSeverities}
      />,
    );

    // Check for active filter badges
    expect(screen.getByText("Search: error")).toBeInTheDocument();
    expect(screen.getByText("Level: error")).toBeInTheDocument();
    expect(screen.getByText("Module: api")).toBeInTheDocument();
    expect(screen.getByText("Severity: high")).toBeInTheDocument();
  });

  it("allows clearing all filters", () => {
    const activeFilters: LogFilters = {
      search: "error",
      level: ["error"],
      module: ["api"],
      severity: ["high"],
    };

    render(
      <SystemLogFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        modules={mockModules}
        levels={mockLevels}
        severities={mockSeverities}
      />,
    );

    const clearButton = screen.getByText("Clear all");
    fireEvent.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      search: "",
      level: [],
      module: [],
      severity: [],
      dateRange: undefined,
    });
  });
});
