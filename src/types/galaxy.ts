
import { ForceGraphProps } from 'react-force-graph';

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  val?: number;
  color?: string;
  level?: number;
  internalId?: string;
  status?: string;
  metadata?: Record<string, any>;
  title?: string; // Added to fix the error
  realId?: string; // Added to fix the error
  description?: string;
  plugin_id?: string;
  version?: string;
  borderColor?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  value?: number;
  type?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GalaxyLoaderProps {
  viewMode: string;
  fgRef: React.MutableRefObject<any>;
  onNodeClick: (node: GraphNode) => void;
}

export interface ViewModeSelectorProps {
  viewMode: string;
  onChange: (mode: string) => void;
}

export interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRefresh: () => void;
}

export interface GalaxyControlsProps {
  viewMode: string;
  setViewMode: (mode: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRefresh: () => void;
  onToggleLayout?: () => void;
  onCenter?: () => void;
}

export interface InspectorSidebarProps {
  node: GraphNode | null;
  onClose: () => void;
}

export interface MobileInspectorProps {
  node: GraphNode | null;
  onClose: () => void;
}

// Extend the ForceGraphProps with our own properties
export interface ForceGraphExtendedProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  selectedNode: GraphNode | null;
  is3d?: boolean;
}

export interface GraphLegendProps {
  nodeTypes: {
    type: string;
    color: string;
    label: string;
  }[];
}

export interface NodeUtilitiesProps {
  nodeId: string;
  nodeType: string;
}
