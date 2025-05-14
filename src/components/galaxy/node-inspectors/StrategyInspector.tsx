
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { StrategyNode } from "@/types/galaxy";
import { getStatusVariant } from "./NodeUtilities";

interface StrategyInspectorProps {
  node: StrategyNode;
}

export function StrategyInspector({ node }: StrategyInspectorProps) {
  if (!node) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-1">Status</h3>
        <Badge variant={getStatusVariant(node.status)}>{node.status}</Badge>
      </div>
      
      {node.completion_percentage !== undefined && (
        <div>
          <h3 className="text-sm font-medium mb-1">Completion</h3>
          <div className="flex items-center gap-2">
            <Progress value={node.completion_percentage} className="flex-1" />
            <span className="text-xs">{node.completion_percentage}%</span>
          </div>
        </div>
      )}
      
      {node.tags && node.tags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1">
            {node.tags.map((tag: string, i: number) => (
              <Badge key={i} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {node.created_at && (
        <div>
          <h3 className="text-sm font-medium mb-1">Created</h3>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(node.created_at), { addSuffix: true })}
          </p>
        </div>
      )}
      
      {node.due_date && (
        <div>
          <h3 className="text-sm font-medium mb-1">Due Date</h3>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(node.due_date), { addSuffix: true })}
          </p>
        </div>
      )}
      
      {node.description && (
        <div>
          <h3 className="text-sm font-medium mb-1">Description</h3>
          <p className="text-sm">{node.description}</p>
        </div>
      )}
    </div>
  );
}
