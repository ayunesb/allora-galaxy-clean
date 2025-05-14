
import React, { useCallback, useState, useRef } from 'react';
import GalaxyExplorer from './GalaxyExplorer';
import PageHelmet from '@/components/PageHelmet';
import { useGalaxyData } from '@/hooks/useGalaxyData';
import { GraphNode } from '@/types/galaxy';
import { Button } from '@/components/ui/button';
import { DownloadIcon, RefreshIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const GalaxyPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useGalaxyData();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const handleRefresh = useCallback(async () => {
    toast({
      title: "Refreshing Galaxy Data",
      description: "Fetching the latest connections and relationships...",
    });
    await refetch();
  }, [refetch]);

  const handleExport = useCallback(() => {
    if (!canvasRef.current || !data) return;
    
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        throw new Error('Canvas element not found');
      }
      
      const link = document.createElement('a');
      link.download = 'galaxy-snapshot.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Galaxy Snapshot Saved",
        description: "The image has been exported successfully.",
      });
    } catch (err) {
      console.error('Error exporting galaxy snapshot:', err);
      toast({
        title: "Export Failed",
        description: "Could not export the galaxy snapshot. Try again later.",
        variant: "destructive",
      });
    }
  }, [data]);

  return (
    <div className="container mx-auto px-4">
      <PageHelmet
        title="Galaxy Explorer"
        description="Visualize the connections between strategies, plugins, and agents"
      />
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Galaxy Explorer</h1>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isLoading || !data}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-6">
        Visualize the connections between strategies, plugins, and agents in your ecosystem
      </p>
      
      <div className="h-[800px]">
        <GalaxyExplorer />
      </div>
    </div>
  );
};

export default GalaxyPage;
