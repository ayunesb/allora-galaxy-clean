
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

interface InspectorSidebarProps {
  node: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface InspectorContentProps {
  node: any;
}

// Separate component for the sidebar content to be reusable in mobile view
export const InspectorContent: React.FC<InspectorContentProps> = ({ node }) => {
  if (!node) return null;

  // Helper function to determine badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'completed':
        return 'default';
      case 'draft':
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'rejected':
      case 'deprecated':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  switch (node.type) {
    case "strategy":
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Status</h3>
            <Badge variant={getStatusVariant(node.status)}>{node.status}</Badge>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-1">Completion</h3>
            <div className="flex items-center gap-2">
              <Progress value={node.completion_percentage} className="flex-1" />
              <span className="text-xs">{node.completion_percentage}%</span>
            </div>
          </div>
          
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
          
          <div>
            <h3 className="text-sm font-medium mb-1">Created</h3>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(node.created_at), { addSuffix: true })}
            </p>
          </div>
          
          {node.due_date && (
            <div>
              <h3 className="text-sm font-medium mb-1">Due Date</h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(node.due_date), { addSuffix: true })}
              </p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium mb-1">Description</h3>
            <p className="text-sm">{node.description}</p>
          </div>
        </div>
      );

    case "plugin":
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

    case "agent":
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

    default:
      return <p>No details available</p>;
  }
};

const InspectorSidebar: React.FC<InspectorSidebarProps> = ({
  node,
  open,
  onOpenChange,
}) => {
  if (!node) return null;

  const getNodeTitle = () => {
    if (!node) return 'Details';
    
    switch (node.type) {
      case 'strategy':
        return node.title || 'Strategy Details';
      case 'plugin':
        return node.name || 'Plugin Details';
      case 'agent': 
        return `Agent Version ${node.version}` || 'Agent Details';
      default:
        return 'Node Details';
    }
  };

  const getNodeType = () => {
    if (!node?.type) return '';
    return node.type.charAt(0).toUpperCase() + node.type.slice(1);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:max-w-lg overflow-auto">
        <SheetHeader>
          <SheetTitle>{getNodeTitle()}</SheetTitle>
          <SheetDescription>
            {getNodeType()} {node.id && `ID: ${node.id.substring(0, 8)}...`}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <InspectorContent node={node} />
        </div>
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default InspectorSidebar;
