
export interface GraphNode {
  id: string;
  name: string;
  label?: string;
  type: 'strategy' | 'agent' | 'plugin' | 'tenant';
  status?: string;
  color?: string;
  size?: number;
  value?: number;
  borderColor?: string;
  borderWidth?: number;
  metadata?: Record<string, any>;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  value?: number;
  color?: string;
  width?: number;
  type?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ForceGraphProps {
  graphData: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  height?: number | string;
  width?: number | string;
  backgroundColor?: string;
}

export interface GalaxyFilterOptions {
  viewMode: string;
  sortBy?: string;
  filterBy?: string;
}
