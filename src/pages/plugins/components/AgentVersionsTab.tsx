import React from "react";
import { format } from "date-fns";
import { Flag, Table2, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/EmptyState";
import PromptDiffAnalysis from "@/components/admin/PromptDiffAnalysis";

interface AgentVersion {
  id: string;
  version: string;
  status: string;
  xp: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
  prompt: string;
}

interface AgentVersionsTabProps {
  agentVersions: AgentVersion[];
  pluginId: string;
  flagForReview: (agentVersionId: string) => void;
}

const AgentVersionsTab: React.FC<AgentVersionsTabProps> = ({
  agentVersions,
  pluginId,
  flagForReview,
}) => {
  if (!agentVersions || agentVersions.length === 0) {
    return (
      <EmptyState
        title="No agent versions"
        description="This plugin has no agent versions yet"
        icon={<Table2 className="h-12 w-12" />}
      />
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "training":
        return "outline";
      case "deprecated":
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6 mt-4">
      {agentVersions.length > 1 && (
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="p-4">
            <PromptDiffAnalysis
              currentPrompt={agentVersions[0].prompt}
              previousPrompt={agentVersions[1].prompt}
              agentVersionId={agentVersions[0].id}
              pluginId={pluginId}
            />
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>XP</TableHead>
              <TableHead>Votes</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agentVersions.map((version) => {
              // Check if agent is underperforming compared to previous version
              const isUnderperforming =
                agentVersions.length > 1 &&
                version.status === "active" &&
                version.xp < agentVersions[1].xp;

              return (
                <TableRow key={version.id}>
                  <TableCell>v{version.version}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(version.status)}>
                      {version.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{version.xp} XP</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">
                        {version.upvotes || 0}👍
                      </span>
                      <span className="text-red-500">
                        {version.downvotes || 0}👎
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(version.created_at), "PP")}
                  </TableCell>
                  <TableCell>
                    {isUnderperforming && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-amber-600 border-amber-200"
                        onClick={() => flagForReview(version.id)}
                      >
                        <Flag className="h-3 w-3" />
                        <span>Flag for Review</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {agentVersions.length > 0 &&
        agentVersions[0].status === "active" &&
        agentVersions[0].xp < 10 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Low Performance Alert</AlertTitle>
            <AlertDescription>
              The current active version is showing low XP performance. Consider
              reviewing the prompt.
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
};

export default AgentVersionsTab;
