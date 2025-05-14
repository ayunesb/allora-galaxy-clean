
/**
 * Type definitions for Galaxy graph visualization components
 */

export interface GraphNode {
  id: string;
  name?: string;
  type?: string;
  description?: string;
  status?: string;
  version?: string;
  model?: string;
  last_executed?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface GraphLink {
  source: string;
  target: string;
  type?: string;
  strength?: number;
  label?: string;
  [key: string]: any;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
