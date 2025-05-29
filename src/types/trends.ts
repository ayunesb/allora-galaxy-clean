// Define trend direction types
export type TrendDirection = "up" | "down" | "neutral";

// For backward compatibility with the existing code
export type LegacyTrendDirection = "increasing" | "decreasing" | "stable";

// A mapping function to convert between the two
export function mapTrendDirection(trend: TrendDirection): LegacyTrendDirection {
  switch (trend) {
    case "up":
      return "increasing";
    case "down":
      return "decreasing";
    case "neutral":
      return "stable";
  }
}
