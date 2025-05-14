
import { GraphNode } from '@/types/galaxy';

export const getNodeTitle = (node: GraphNode): string => {
  if (!node) return 'Unknown Node';
  return node.label || node.id || 'Unnamed Node';
};

export const getNodeType = (node: GraphNode): string => {
  if (!node) return 'unknown';
  return node.type || 'unknown';
};

export const getNodeStatus = (node: GraphNode): string => {
  if (!node) return '';
  return node.status || '';
};

export const getNodeColor = (node: GraphNode): string => {
  if (!node) return '#888888';
  
  switch (node.type?.toLowerCase()) {
    case 'strategy':
      return '#3b82f6'; // blue
    case 'agent':
      return '#10b981'; // green
    case 'plugin':
      return '#f59e0b'; // amber
    case 'execution':
      return '#8b5cf6'; // purple
    default:
      return '#64748b'; // slate
  }
};

export const getNodeSize = (node: GraphNode): number => {
  if (!node) return 5;
  
  switch (node.type?.toLowerCase()) {
    case 'strategy':
      return 12;
    case 'agent':
      return 10;
    case 'plugin':
      return 8;
    case 'execution':
      return 6;
    default:
      return 5;
  }
};

export const getStatusVariant = (status?: string): string => {
  if (!status) return 'secondary';
  
  switch (status.toLowerCase()) {
    case 'active':
    case 'online':
    case 'success':
    case 'completed':
      return 'success';
    case 'pending':
    case 'in_progress':
    case 'running':
      return 'secondary';
    case 'warning':
    case 'attention':
      return 'warning';
    case 'error':
    case 'failed':
    case 'offline':
      return 'destructive';
    case 'draft':
    case 'idle':
      return 'outline';
    default:
      return 'default';
  }
};
