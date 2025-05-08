
import { Badge } from "@/components/ui/badge";

interface PluginInspectorProps {
  node: any;
}

export function PluginInspector({ node }: PluginInspectorProps) {
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
        <h3 className="text-sm font-medium mb-1">XP</h3>
        <Badge variant="outline" className="font-mono">{node.xp} XP</Badge>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">ROI</h3>
        <Badge variant="outline" className="font-mono">{node.roi}%</Badge>
      </div>
      
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
    </div>
  );
}
