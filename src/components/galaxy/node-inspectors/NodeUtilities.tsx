
import { GraphNode } from "@/types/galaxy";

export function getNodeTitle(node: GraphNode): string {
  if (!node) return 'Details';
  
  switch (node.type) {
    case 'strategy':
      return node.name || 'Strategy Details';
    case 'plugin':
      return node.name || 'Plugin Details';
    case 'agent': 
      return `Agent ${node.name || ''} v${node.version || '1'}` || 'Agent Details';
    default:
      return node.name || 'Node Details';
  }
}

export function getNodeType(node: GraphNode): string {
  if (!node?.type) return '';
  return node.type.charAt(0).toUpperCase() + node.type.slice(1);
}

export function getStatusVariant(status: string | undefined) {
  if (!status) return 'outline';
  
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
}
