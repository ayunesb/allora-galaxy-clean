
/**
 * Types for the Galaxy Explorer
 */

export interface NodeData {
  id: string;
  name: string;
  type: 'strategy' | 'plugin' | 'agent';
  status?: string;
  metadata?: Record<string, any>;
  color?: string;
  borderColor?: string;
  description?: string;
  version?: string;
  plugin_id?: string;
}

export interface LinkData {
  source: string;
  target: string;
  type?: string;
  value?: number;
}

export interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}

export interface GraphOptions {
  viewMode?: string;
  filterStatus?: string[];
  layout?: string;
  highlightedNodeId?: string | null;
}

export interface ForceGraphRef {
  graph: any;
  centerGraph: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export type GraphNode = NodeData;

export interface ForceGraphProps {
  graphData: GraphData;
  onNodeClick: (node: GraphNode) => void;
  onBackgroundClick?: () => void;
  highlightedNodeId?: string | null;
  selectedNodeId?: string | null;
  className?: string;
}
