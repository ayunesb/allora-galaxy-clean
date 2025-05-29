import { describe, it, expect } from "vitest";
import {
  getSeverityColor,
  getSeverityTextColor,
  calculateOverallSeverity,
  getSeverityBadgeVariant,
} from "@/components/admin/errors/utils/severityUtils";
import { SystemLog } from "@/types/logs";

describe("severityUtils", () => {
  describe("getSeverityColor", () => {
    it("should return correct color for each severity level", () => {
      expect(getSeverityColor("critical")).toBe("#ef4444"); // red
      expect(getSeverityColor("high")).toBe("#f97316"); // orange
      expect(getSeverityColor("medium")).toBe("#eab308"); // yellow
      expect(getSeverityColor("low")).toBe("#22c55e"); // green
      expect(getSeverityColor(undefined)).toBe("#6b7280"); // gray
    });
  });

  describe("getSeverityTextColor", () => {
    it("should return correct text color for each severity level", () => {
      expect(getSeverityTextColor("critical")).toBe("text-red-500");
      expect(getSeverityTextColor("high")).toBe("text-orange-500");
      expect(getSeverityTextColor("medium")).toBe("text-yellow-500");
      expect(getSeverityTextColor("low")).toBe("text-green-500");
      expect(getSeverityTextColor(undefined)).toBe("text-gray-500");
    });
  });

  describe("calculateOverallSeverity", () => {
    it("should return critical if any critical errors exist", () => {
      const logs: Partial<SystemLog>[] = [
        {
          id: "1",
          level: "error",
          severity: "low",
          message: "Test 1",
          created_at: "2023-01-01",
          timestamp: "2023-01-01",
          tenant_id: "test",
        },
        {
          id: "2",
          level: "error",
          severity: "critical",
          message: "Test 2",
          created_at: "2023-01-01",
          timestamp: "2023-01-01",
          tenant_id: "test",
        },
        {
          id: "3",
          level: "error",
          severity: "medium",
          message: "Test 3",
          created_at: "2023-01-01",
          timestamp: "2023-01-01",
          tenant_id: "test",
        },
      ];

      expect(calculateOverallSeverity(logs as SystemLog[])).toBe("critical");
    });

    it("should return high if no critical but some high errors exist", () => {
      const logs: Partial<SystemLog>[] = [
        {
          id: "1",
          level: "error",
          severity: "low",
          message: "Test 1",
          created_at: "2023-01-01",
          timestamp: "2023-01-01",
          tenant_id: "test",
        },
        {
          id: "2",
          level: "error",
          severity: "high",
          message: "Test 2",
          created_at: "2023-01-01",
          timestamp: "2023-01-01",
          tenant_id: "test",
        },
        {
          id: "3",
          level: "error",
          severity: "medium",
          message: "Test 3",
          created_at: "2023-01-01",
          timestamp: "2023-01-01",
          tenant_id: "test",
        },
      ];

      expect(calculateOverallSeverity(logs as SystemLog[])).toBe("high");
    });

    it("should return medium if no critical/high but some medium errors exist", () => {
      const logs: Partial<SystemLog>[] = [
        {
          id: "1",
          level: "error",
          severity: "low",
          message: "Test 1",
          created_at: "2023-01-01",
          timestamp: "2023-01-01",
          tenant_id: "test",
        },
        {
          id: "2",
          level: "error",
          severity: "medium",
          message: "Test 2",
          created_at: "2023-01-01",
          timestamp: "2023-01-01",
          tenant_id: "test",
        },
      ];

      expect(calculateOverallSeverity(logs as SystemLog[])).toBe("medium");
    });

    it("should return low if only low severity errors exist", () => {
      const logs: Partial<SystemLog>[] = [
        {
          id: "1",
          level: "error",
          severity: "low",
          message: "Test 1",
          created_at: "2023-01-01",
          timestamp: "2023-01-01",
          tenant_id: "test",
        },
        {
          id: "2",
          level: "error",
          severity: "low",
          message: "Test 2",
          created_at: "2023-01-01",
          timestamp: "2023-01-01",
          tenant_id: "test",
        },
      ];

      expect(calculateOverallSeverity(logs as SystemLog[])).toBe("low");
    });

    it("should return low if no severity is specified", () => {
      const logs: Partial<SystemLog>[] = [
        {
          id: "1",
          level: "error",
          message: "Test 1",
          created_at: "2023-01-01",
          timestamp: "2023-01-01",
          tenant_id: "test",
        },
        {
          id: "2",
          level: "error",
          message: "Test 2",
          created_at: "2023-01-01",
          timestamp: "2023-01-01",
          tenant_id: "test",
        },
      ];

      expect(calculateOverallSeverity(logs as SystemLog[])).toBe("low");
    });

    it("should handle empty array", () => {
      expect(calculateOverallSeverity([])).toBe("low");
    });
  });

  describe("getSeverityBadgeVariant", () => {
    it("should return correct badge variant for each severity level", () => {
      expect(getSeverityBadgeVariant("critical")).toBe("destructive");
      expect(getSeverityBadgeVariant("high")).toBe("orange");
      expect(getSeverityBadgeVariant("medium")).toBe("yellow");
      expect(getSeverityBadgeVariant("low")).toBe("blue");
      expect(getSeverityBadgeVariant(undefined)).toBe("secondary");
    });
  });
});
