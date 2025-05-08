
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Brain, LineChart, Calendar } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTenantId } from '@/hooks/useTenantId';

interface AgentVersion {
  id: string;
  version: string;
  created_at: string;
  status: string;
  upvotes: number;
  downvotes: number;
  xp: number;
}

const PluginEvolution = () => {
  const { id } = useParams();
  const { tenant } = useWorkspace();
  const { tenantId } = useTenantId();
  const [loading, setLoading] = useState(true);
  const [plugin, setPlugin] = useState<any>(null);
  const [versions, setVersions] = useState<AgentVersion[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Here we would fetch the plugin and its versions from the API
        // For now, let's mock the data
        setPlugin({
          id,
          name: 'SEO Analyzer',
          description: 'Analyzes and optimizes content for search engines',
          category: 'marketing',
          xp: 1250
        });
        
        setVersions([
          {
            id: 'agent-1',
            version: '2.0',
            created_at: new Date().toISOString(),
            status: 'active',
            upvotes: 24,
            downvotes: 2,
            xp: 850
          },
          {
            id: 'agent-2',
            version: '1.5',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'inactive',
            upvotes: 18,
            downvotes: 7,
            xp: 300
          },
          {
            id: 'agent-3',
            version: '1.0',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'inactive',
            upvotes: 10,
            downvotes: 8,
            xp: 100
          }
        ]);
      } catch (error) {
        console.error('Error fetching plugin evolution data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-48 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!plugin) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Plugin not found</h2>
          <p className="text-muted-foreground mb-4">
            The plugin you are looking for does not exist or has been deleted.
          </p>
          <Button onClick={() => window.history.back()}>Back to Plugins</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Button variant="link" className="p-0 h-auto" onClick={() => window.history.back()}>
            Plugins
          </Button>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>{plugin.name}</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Evolution</span>
        </div>
        <h1 className="text-3xl font-bold">{plugin.name} Evolution</h1>
        <p className="text-muted-foreground">{plugin.description}</p>
      </div>
      
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Evolution Timeline
            </h2>
            
            <div className="relative pl-8 border-l">
              {versions.map((version, index) => (
                <div key={version.id} className="mb-8 relative">
                  <div className="absolute -left-10 w-5 h-5 rounded-full bg-primary"></div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg font-semibold mr-2">Version {version.version}</span>
                        {version.status === 'active' && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(version.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <Card className="bg-muted/30 p-4">
                    <div className="flex justify-between mb-2">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Agent XP</div>
                        <div className="font-semibold">{version.xp} XP</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Rating</div>
                        <div className="font-semibold">
                          👍 {version.upvotes} &nbsp; 👎 {version.downvotes}
                        </div>
                      </div>
                    </div>
                    
                    {index < versions.length - 1 && (
                      <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                        Changes from v{versions[index + 1].version}:
                        <ul className="list-disc list-inside mt-2">
                          <li>Improved response quality</li>
                          <li>Reduced errors by 30%</li>
                          <li>Added new capabilities</li>
                        </ul>
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              Performance Metrics
            </h2>
            <p className="text-muted-foreground mb-6">
              Performance comparison across agent versions
            </p>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Performance chart will be displayed here</p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Evolution Feedback
            </h2>
            
            <div className="space-y-6">
              {versions.map((version) => (
                <div key={`feedback-${version.id}`}>
                  <h3 className="font-semibold mb-2">Version {version.version}</h3>
                  <Separator className="mb-4" />
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">User feedback</span>
                        <span className="text-green-600">👍 Positive</span>
                      </div>
                      <p className="text-sm">
                        "The results are much more accurate now. Great improvement!"
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">System analysis</span>
                        <span>🧠 AI Analysis</span>
                      </div>
                      <p className="text-sm">
                        "This version shows 35% improvement in accuracy and 28% reduction in processing time compared to the previous version."
                      </p>
                    </div>
                    
                    {version.status === 'active' && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Add your feedback</span>
                        </div>
                        <Button className="mt-2" size="sm">
                          Rate this version
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginEvolution;
