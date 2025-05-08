
import { ForceGraphInstance } from 'react-force-graph';

export interface NodeData {
  id: string;
  name?: string;
  type: 'strategy' | 'plugin' | 'agent';
  status?: string;
  metadata?: Record<string, any>;
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
  graph: ForceGraphInstance;
  centerGraph: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}
