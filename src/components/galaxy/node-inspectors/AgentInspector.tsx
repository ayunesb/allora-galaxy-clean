
import { Badge } from "@/components/ui/badge";
import { AgentNode } from "@/types/galaxy";
import { getStatusVariant } from "./NodeUtilities";

interface AgentInspectorProps {
  node: AgentNode;
}

export function AgentInspector({ node }: AgentInspectorProps) {
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
        <h3 className="text-sm font-medium mb-1">Version</h3>
        <Badge variant="outline">v{node.version || 1}</Badge>
      </div>
      
      {node.xp !== undefined && (
        <div>
          <h3 className="text-sm font-medium mb-1">XP</h3>
          <Badge variant="outline" className="font-mono">{node.xp} XP</Badge>
        </div>
      )}
      
      <div>
        <h3 className="text-sm font-medium mb-1">Votes</h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50">👍 {node.upvotes || 0}</Badge>
          <Badge variant="outline" className="bg-red-50">👎 {node.downvotes || 0}</Badge>
        </div>
      </div>
      
      {node.prompt && (
        <div>
          <h3 className="text-sm font-medium mb-1">Prompt</h3>
          <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-40 whitespace-pre-wrap">
            {node.prompt}
          </pre>
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
