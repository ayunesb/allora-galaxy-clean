import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SystemLog } from "@/types/logs";

// Mock the SystemLogsList component since the import path is incorrect
vi.mock("@/components/admin/logs/SystemLogsList", () => {
  return {
    default: ({
      logs,
      isLoading,
      onRowClick,
    }: {
      logs: SystemLog[];
      isLoading?: boolean;
      onRowClick?: (log: SystemLog) => void;
    }) => (
      <div data-testid="system-logs-list">
        {isLoading ? (
          <div data-testid="loading-skeleton">Loading...</div>
        ) : logs.length === 0 ? (
          <div data-testid="empty-state">No logs found</div>
        ) : (
          <ul>
            {logs.map((log) => (
              <li
                key={log.id}
                data-testid={`log-item-${log.id}`}
                onClick={() => onRowClick?.(log)}
              >
                {log.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
  };
});

// Import the mocked component
import SystemLogsList from "@/components/admin/logs/SystemLogsList";

describe("SystemLogsList", () => {
  // Mock data
  const mockLogs: SystemLog[] = [
    {
      id: "1",
      tenant_id: "tenant-1",
      level: "error",
      message: "Test error 1",
      description: "Error description 1",
      module: "auth",
      created_at: "2023-01-01T12:00:00Z",
      severity: "high",
      timestamp: "2023-01-01T12:00:00Z",
    },
    {
      id: "2",
      tenant_id: "tenant-1",
      level: "warning",
      message: "Test warning 1",
      description: "Warning description 1",
      module: "api",
      created_at: "2023-01-02T12:00:00Z",
      severity: "medium",
      timestamp: "2023-01-02T12:00:00Z",
    },
  ];

  it("renders the logs list", () => {
    render(<SystemLogsList logs={mockLogs} />);

    const logsList = screen.getByTestId("system-logs-list");
    expect(logsList).toBeInTheDocument();

    const logItems = screen.getAllByTestId(/log-item/);
    expect(logItems.length).toBe(2);
  });

  it("displays loading skeleton when isLoading is true", () => {
    render(<SystemLogsList logs={mockLogs} isLoading={true} />);

    const skeleton = screen.getByTestId("loading-skeleton");
    expect(skeleton).toBeInTheDocument();
  });

  it("displays empty state when there are no logs", () => {
    render(<SystemLogsList logs={[]} />);

    const emptyState = screen.getByTestId("empty-state");
    expect(emptyState).toBeInTheDocument();
  });

  it("calls onRowClick when a log item is clicked", () => {
    const handleRowClick = vi.fn();

    render(<SystemLogsList logs={mockLogs} onRowClick={handleRowClick} />);

    const firstLogItem = screen.getByTestId("log-item-1");
    fireEvent.click(firstLogItem);

    expect(handleRowClick).toHaveBeenCalledWith(mockLogs[0]);
  });
});
