import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Code2, Terminal, ArrowUp, ArrowDown, Clock } from "lucide-react";
import { AgentVersion } from "@/types/plugin";
import { format } from "date-fns";

interface AgentVersionsTabProps {
  versions: AgentVersion[];
}

export const AgentVersionsTab: React.FC<AgentVersionsTabProps> = ({
  versions,
}) => {
  return (
    <Card className="overflow-hidden border transition-all hover:shadow-md animate-fade-in">
      <CardHeader className="bg-muted/50">
        <CardTitle>Agent Versions</CardTitle>
        <CardDescription>
          Version history of the agent implementation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 border border-dashed rounded-md">
            <p className="mb-2">No agent versions found</p>
            <p className="text-sm">
              Agent versions will appear here once created
            </p>
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="border rounded-lg p-4 hover:border-primary/50 hover:bg-muted/20 transition-colors duration-300"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        version.status === "active"
                          ? "default"
                          : version.status === "training"
                            ? "outline"
                            : "secondary"
                      }
                      className="transition-transform hover:scale-105"
                    >
                      {version.status}
                    </Badge>
                    <span className="font-medium">
                      Version {version.version}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground flex items-center justify-end">
                      <Clock className="h-3 w-3 mr-1 inline" />
                      {version.created_at
                        ? format(new Date(version.created_at), "PP")
                        : "Unknown date"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-green-500 hover:bg-green-50 transition-colors duration-300"
                      >
                        <ArrowUp className="h-3 w-3 mr-1" />{" "}
                        {version.upvotes || 0}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-destructive hover:bg-red-50 transition-colors duration-300"
                      >
                        <ArrowDown className="h-3 w-3 mr-1" />{" "}
                        {version.downvotes || 0}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="relative">
                  <div className="bg-muted rounded-md p-3 text-xs font-mono overflow-x-auto group hover:bg-muted/70 transition-colors">
                    <Code2 className="absolute right-2 top-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <p className="whitespace-pre-wrap">{version.prompt}</p>
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="group hover:border-primary transition-colors"
                  >
                    <Terminal className="mr-1 h-3 w-3 group-hover:text-primary transition-colors" />{" "}
                    Test
                  </Button>
                </div>

                {index < versions.length - 1 && (
                  <div className="flex justify-center my-4">
                    <div className="border-l-2 border-dashed h-8"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentVersionsTab;
