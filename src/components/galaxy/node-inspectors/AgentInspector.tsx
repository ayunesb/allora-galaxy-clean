
import React from "react";
import { Badge } from "@/components/ui/badge";

interface AgentInspectorProps {
  node: any;
}

export function AgentInspector({ node }: AgentInspectorProps) {
  if (!node) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-1">Status</h3>
        <Badge variant={node.status === 'active' ? 'default' : 'secondary'}>
          {node.status}
        </Badge>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">Version</h3>
        <Badge variant="outline">v{node.version}</Badge>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">XP</h3>
        <Badge variant="outline" className="font-mono">{node.xp} XP</Badge>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">Votes</h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50">👍 {node.upvotes}</Badge>
          <Badge variant="outline" className="bg-red-50">👎 {node.downvotes}</Badge>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">Prompt</h3>
        <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-40 whitespace-pre-wrap">
          {node.prompt}
        </pre>
      </div>
    </div>
  );
}
