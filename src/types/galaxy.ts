
export interface GalaxyNode {
  id: string;
  name: string;
  type: 'strategy' | 'plugin' | 'agent' | 'log';
  value: number; // Used for sizing nodes
  color?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
}

export interface GalaxyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
  type?: string;
}

export interface GalaxyData {
  nodes: GalaxyNode[];
  links: GalaxyLink[];
}

export interface UseGalaxyDataResult {
  data: GalaxyData;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  selectedNode: GalaxyNode | null;
  setSelectedNode: (node: GalaxyNode | null) => void;
}

export interface ViewMode {
  label: string;
  value: string;
  description: string;
}
