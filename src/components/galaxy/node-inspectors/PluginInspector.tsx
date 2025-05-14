
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Star, TrendingUp, Clock } from "lucide-react";
import { PluginNode } from "@/types/galaxy";
import { getStatusVariant } from "./NodeUtilities";

interface PluginInspectorProps {
  node: PluginNode;
}

export function PluginInspector({ node }: PluginInspectorProps) {
  if (!node) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-1">Status</h3>
        <Badge variant={getStatusVariant(node.status)}>
          {node.status || 'Unknown'}
        </Badge>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">XP</h3>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <Badge variant="outline" className="font-mono">{node.xp || 0} XP</Badge>
        </div>
        <Progress 
          value={Math.min(((node.xp || 0) / 1000) * 100, 100)} 
          className="h-2 mt-2" 
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">ROI</h3>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <Badge variant="outline" className="font-mono">{node.roi || 0}%</Badge>
        </div>
        <Progress 
          value={Math.min((node.roi || 0), 100)} 
          className="h-2 mt-2" 
        />
      </div>
      
      <Separator />
      
      {node.category && (
        <div>
          <h3 className="text-sm font-medium mb-1">Category</h3>
          <Badge variant="outline">{node.category}</Badge>
        </div>
      )}
      
      <div>
        <h3 className="text-sm font-medium mb-1">Description</h3>
        <p className="text-sm">{node.description || 'No description'}</p>
      </div>
      
      {node.metadata && (
        <div>
          <h3 className="text-sm font-medium mb-1">Performance</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">
                {node.metadata.avg_execution_time ? `${node.metadata.avg_execution_time}ms` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">
                Success: {node.metadata.success_rate ? `${node.metadata.success_rate}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
