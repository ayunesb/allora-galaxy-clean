import React, { useMemo } from "react";
import { format } from "date-fns";
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineHeader,
  TimelineSeparator,
} from "@/components/ui/timeline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StrategyVersion } from "@/types/strategy";

type StrategyChangeType = "major" | "minor" | "patch";

interface EvolutionHistoryProps {
  versions: StrategyVersion[];
  isLoading?: boolean;
  maxHeight?: string | number;
  className?: string;
}

const EvolutionHistory: React.FC<EvolutionHistoryProps> = ({
  versions,
  isLoading = false,
  maxHeight = "500px",
  className = "",
}) => {
  // Get color for the change type badge
  const getChangeTypeColor = (changeType: StrategyChangeType | undefined) => {
    switch (changeType) {
      case "major":
        return "bg-red-500";
      case "minor":
        return "bg-amber-500";
      case "patch":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  // Format the date
  const formatVersionDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy h:mm a");
    } catch (err) {
      return "Invalid date";
    }
  };

  // Memoize versions to prevent unnecessary re-rendering
  const sortedVersions = useMemo(() => {
    return [...versions].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [versions]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-5 bg-muted rounded w-1/3 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2 mb-4" />
              <div className="h-20 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className={`text-center p-8 text-muted-foreground ${className}`}>
        No version history available.
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className={className}>
      <Timeline>
        {sortedVersions.map((version, index) => (
          <TimelineItem key={version.id}>
            <TimelineSeparator>
              <TimelineDot />
              {index < versions.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <TimelineHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Version {version.version}</div>
                  {version.change_type && (
                    <Badge
                      className={getChangeTypeColor(
                        version.change_type as StrategyChangeType,
                      )}
                    >
                      {version.change_type.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {formatVersionDate(version.created_at)}
                </div>
                {(version.change_summary || version.description) && (
                  <Card>
                    <CardContent className="p-3 text-sm">
                      <p>
                        {version.change_summary ||
                          version.description ||
                          "No description provided"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TimelineHeader>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </ScrollArea>
  );
};

export default React.memo(EvolutionHistory);
