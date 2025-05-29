import { describe, it, expect } from "vitest";
import { SystemLog } from "@/types/logs";
import {
  prepareErrorTrendsData,
  formatErrorTrendData,
  filterErrorTrendDataByDateRange,
} from "@/components/admin/errors/utils/chartDataUtils";

describe("chartDataUtils", () => {
  describe("formatErrorTrendData", () => {
    it("should group error logs by date and count severity levels", () => {
      const logs: SystemLog[] = [
        {
          id: "1",
          tenant_id: "tenant-1",
          level: "error",
          message: "Error 1",
          created_at: "2023-01-01T10:00:00Z",
          severity: "critical",
          timestamp: "2023-01-01T10:00:00Z",
        },
        {
          id: "2",
          tenant_id: "tenant-1",
          level: "error",
          message: "Error 2",
          created_at: "2023-01-01T11:00:00Z",
          severity: "high",
          timestamp: "2023-01-01T11:00:00Z",
        },
        {
          id: "3",
          tenant_id: "tenant-1",
          level: "error",
          message: "Error 3",
          created_at: "2023-01-02T10:00:00Z",
          severity: "medium",
          timestamp: "2023-01-02T10:00:00Z",
        },
        {
          id: "4",
          tenant_id: "tenant-1",
          level: "error",
          message: "Error 4",
          created_at: "2023-01-02T11:00:00Z",
          severity: "low",
          timestamp: "2023-01-02T11:00:00Z",
        },
      ];

      const result = formatErrorTrendData(logs);

      expect(result).toHaveLength(2);

      // Check first date group
      expect(result[0].date).toBe("2023-01-01");
      expect(result[0].count).toBe(2);
      expect(result[0].critical).toBe(1);
      expect(result[0].high).toBe(1);
      expect(result[0].medium).toBe(0);
      expect(result[0].low).toBe(0);

      // Check second date group
      expect(result[1].date).toBe("2023-01-02");
      expect(result[1].count).toBe(2);
      expect(result[1].critical).toBe(0);
      expect(result[1].high).toBe(0);
      expect(result[1].medium).toBe(1);
      expect(result[1].low).toBe(1);
    });

    it("should handle empty input", () => {
      const result = formatErrorTrendData([]);
      expect(result).toEqual([]);
    });

    it("should handle logs with missing severity", () => {
      const logs: SystemLog[] = [
        {
          id: "1",
          tenant_id: "tenant-1",
          level: "error",
          message: "Error 1",
          created_at: "2023-01-01T10:00:00Z",
          timestamp: "2023-01-01T10:00:00Z",
        },
      ];

      const result = formatErrorTrendData(logs);

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe("2023-01-01");
      expect(result[0].count).toBe(1);
      expect(result[0].low).toBe(1); // Default to low severity
    });

    it("should handle invalid input", () => {
      const result = formatErrorTrendData(null as any);
      expect(result).toEqual([]);
    });
  });

  describe("filterErrorTrendDataByDateRange", () => {
    const trendData = [
      {
        date: "2023-01-01",
        count: 2,
        total: 10,
        critical: 1,
        high: 1,
        medium: 0,
        low: 0,
      },
      {
        date: "2023-01-02",
        count: 3,
        total: 12,
        critical: 0,
        high: 2,
        medium: 1,
        low: 0,
      },
      {
        date: "2023-01-03",
        count: 1,
        total: 8,
        critical: 0,
        high: 0,
        medium: 0,
        low: 1,
      },
      {
        date: "2023-01-04",
        count: 4,
        total: 15,
        critical: 2,
        high: 1,
        medium: 1,
        low: 0,
      },
    ];

    it("should filter by start date only", () => {
      const startDate = new Date("2023-01-03");
      const result = filterErrorTrendDataByDateRange(trendData, startDate);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe("2023-01-03");
      expect(result[1].date).toBe("2023-01-04");
    });

    it("should filter by date range (start and end)", () => {
      const startDate = new Date("2023-01-02");
      const endDate = new Date("2023-01-03");
      const result = filterErrorTrendDataByDateRange(
        trendData,
        startDate,
        endDate,
      );

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe("2023-01-02");
      expect(result[1].date).toBe("2023-01-03");
    });

    it("should return all data if no date range provided", () => {
      const result = filterErrorTrendDataByDateRange(trendData);
      expect(result).toEqual(trendData);
    });
  });

  describe("prepareErrorTrendsData", () => {
    it("should filter error logs and prepare trend data with date filtering", () => {
      const logs: SystemLog[] = [
        {
          id: "1",
          tenant_id: "tenant-1",
          level: "error",
          message: "Error 1",
          created_at: "2023-01-01T10:00:00Z",
          severity: "high",
          timestamp: "2023-01-01T10:00:00Z",
        },
        {
          id: "2",
          tenant_id: "tenant-1",
          level: "warning", // Not an error
          message: "Warning 1",
          created_at: "2023-01-01T11:00:00Z",
          severity: "medium",
          timestamp: "2023-01-01T11:00:00Z",
        },
        {
          id: "3",
          tenant_id: "tenant-1",
          level: "error",
          message: "Error 2",
          created_at: "2023-01-02T10:00:00Z",
          severity: "critical",
          timestamp: "2023-01-02T10:00:00Z",
        },
      ];

      const dateRange = {
        from: new Date("2023-01-02"),
        to: new Date("2023-01-03"),
      };

      const result = prepareErrorTrendsData(logs, dateRange);

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe("2023-01-02");
      expect(result[0].count).toBe(1);
      expect(result[0].critical).toBe(1);
    });
  });
});
