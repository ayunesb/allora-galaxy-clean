
import { LucideIcon } from 'lucide-react';

// Base node data interface
export interface GraphNode {
  id: string;
  name: string;
  type: 'strategy' | 'plugin' | 'agent' | string;
  status?: 'active' | 'pending' | 'approved' | 'inactive' | string;
  description?: string;
  color?: string;
  borderColor?: string;
  icon?: LucideIcon;
  tags?: string[];
  xp?: number;
  roi?: number;
  performance?: number;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow for additional custom properties
}

// Link between nodes
export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  value?: number;
  label?: string;
  color?: string;
  type?: string;
  [key: string]: any; // Allow for additional custom properties
}

// Graph data structure
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Props for the ForceGraph component
export interface ForceGraphProps {
  graphData: GraphData;
  onNodeClick: (node: GraphNode) => void;
  onBackgroundClick?: () => void;
  highlightedNodeId?: string;
  selectedNodeId?: string;
  className?: string;
  ref?: React.RefObject<any>;
}
