import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plugin } from "@/types/plugin";
import { Calendar, Tag, BarChart2, Database, CheckCircle2 } from "lucide-react";

interface PluginDetailsTabProps {
  plugin: Plugin;
}

export const PluginDetailsTab: React.FC<PluginDetailsTabProps> = ({
  plugin,
}) => {
  return (
    <Card className="overflow-hidden border transition-all hover:shadow-md animate-fade-in">
      <CardHeader className="bg-muted/50">
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5 text-primary" />
          Plugin Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="group">
              <h3 className="font-medium mb-1 flex items-center text-sm text-muted-foreground">
                <Tag className="mr-2 h-4 w-4" />
                CATEGORY
              </h3>
              <p className="text-lg font-medium">
                {plugin.category || "Uncategorized"}
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1 flex items-center text-sm text-muted-foreground">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                STATUS
              </h3>
              <Badge
                variant={plugin.status === "active" ? "default" : "secondary"}
                className="transition-all hover:scale-105"
              >
                {plugin.status}
              </Badge>
            </div>

            <div>
              <h3 className="font-medium mb-1 flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                CREATED
              </h3>
              <p>
                {plugin.created_at
                  ? format(new Date(plugin.created_at), "PPpp")
                  : "Unknown"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 flex items-center text-sm text-muted-foreground">
              <BarChart2 className="mr-2 h-4 w-4" />
              PERFORMANCE
            </h3>
            <div className="bg-muted/30 p-4 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex gap-6">
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary">
                    {plugin.xp || 0}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    XP Earned
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary">
                    {plugin.roi || 0}%
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">ROI</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {plugin.metadata && (
          <div>
            <h3 className="font-medium mb-1 flex items-center text-sm text-muted-foreground">
              <Database className="mr-2 h-4 w-4" />
              METADATA
            </h3>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs border mt-2 max-h-60 overflow-y-auto">
              {JSON.stringify(plugin.metadata, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PluginDetailsTab;
