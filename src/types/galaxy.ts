
export interface GraphNode {
  id: string;
  name: string;
  type: 'strategy' | 'plugin' | 'agent';
  realId?: string;
  [key: string]: any;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
