
import { GraphNode } from "@/types/galaxy";

/**
 * Get a display title for a node
 */
export function getNodeTitle(node: GraphNode): string {
  if (!node) return 'Unknown Node';
  
  return node.name || node.id || 'Untitled Node';
}

/**
 * Get the type of the node as a string
 */
export function getNodeType(node: GraphNode): string {
  if (!node) return 'unknown';
  
  return node.type || 'generic';
}

/**
 * Get a variant for the badge based on node type and status
 */
export function getNodeStatusVariant(node: GraphNode): "default" | "destructive" | "outline" | "secondary" | "success" | "warning" | undefined {
  if (!node || !node.status) return undefined;
  
  const status = node.status.toLowerCase();
  
  switch (status) {
    case 'active':
    case 'approved':
    case 'success':
      return 'success';
    case 'error':
    case 'failed':
      return 'destructive';
    case 'warning':
    case 'pending':
      return 'warning';
    case 'draft':
      return 'outline';
    case 'inactive':
      return 'secondary';
    default:
      return 'default';
  }
}

/**
 * Format the metadata for display
 */
export function formatNodeMetadata(metadata: any): Record<string, string> {
  if (!metadata) return {};
  
  const formatted: Record<string, string> = {};
  
  Object.entries(metadata).forEach(([key, value]) => {
    if (typeof value === 'object') {
      formatted[key] = JSON.stringify(value);
    } else {
      formatted[key] = String(value);
    }
  });
  
  return formatted;
}
