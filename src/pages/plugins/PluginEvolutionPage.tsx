
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, Clock, GitBranch, GitCompare, GitMerge } from 'lucide-react';
import { Plugin } from '@/types/plugin';

const PluginEvolutionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    fetchPluginDetails();
    fetchPluginVersions();
  }, [id]);

  const fetchPluginDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setPlugin(data);
    } catch (error: any) {
      toast({
        title: 'Error fetching plugin details',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPluginVersions = async () => {
    try {
      setVersionsLoading(true);
      
      // In a real implementation, you'd fetch this from the database
      // For now, let's create some mock version data
      const mockVersions = [
        {
          id: '1',
          version: '1.3.0',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          xp_earned: 65,
          roi_change: 18,
          changes: [
            'Added support for dynamic templates',
            'Improved error handling and retry logic',
            'Enhanced performance with batch processing'
          ],
          improvements: [
            { metric: 'Success Rate', previous: '82%', current: '94%' },
            { metric: 'Avg. Execution Time', previous: '450ms', current: '320ms' },
            { metric: 'ROI', previous: '52%', current: '70%' }
          ]
        },
        {
          id: '2',
          version: '1.2.0',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
          xp_earned: 50,
          roi_change: 15,
          changes: [
            'Added support for custom templates',
            'Improved error handling',
            'Expanded documentation'
          ],
          improvements: [
            { metric: 'Success Rate', previous: '75%', current: '82%' },
            { metric: 'Avg. Execution Time', previous: '520ms', current: '450ms' },
            { metric: 'ROI', previous: '37%', current: '52%' }
          ]
        },
        {
          id: '3',
          version: '1.1.0',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
          xp_earned: 35,
          roi_change: 8,
          changes: [
            'Enhanced performance with batch processing',
            'Added new analytics',
            'Fixed bugs in error reporting'
          ],
          improvements: [
            { metric: 'Success Rate', previous: '68%', current: '75%' },
            { metric: 'Avg. Execution Time', previous: '680ms', current: '520ms' },
            { metric: 'ROI', previous: '29%', current: '37%' }
          ]
        },
        {
          id: '4',
          version: '1.0.0',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42).toISOString(),
          xp_earned: 25,
          roi_change: 29,
          changes: [
            'Initial release'
          ],
          improvements: [
            { metric: 'Success Rate', previous: 'N/A', current: '68%' },
            { metric: 'Avg. Execution Time', previous: 'N/A', current: '680ms' },
            { metric: 'ROI', previous: 'N/A', current: '29%' }
          ]
        }
      ];
      
      setVersions(mockVersions);
    } catch (error: any) {
      console.error('Error fetching plugin versions:', error);
    } finally {
      setVersionsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/plugins/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to plugin
          </Button>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/plugins')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to plugins
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Plugin not found</h2>
          <p className="text-muted-foreground mb-6">The plugin you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/plugins')}>
            Back to All Plugins
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/plugins/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to plugin
        </Button>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold">{plugin.name}: Evolution History</h1>
        <p className="text-muted-foreground mt-1">
          Track the progress and improvements of this plugin over time
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plugin Evolution Timeline</CardTitle>
          <CardDescription>
            Version history and performance improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {versionsLoading ? (
            <div className="space-y-8">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No version history available for this plugin</p>
            </div>
          ) : (
            <div className="relative border-l pl-8 py-4">
              {versions.map((version, index) => (
                <div 
                  key={version.id}
                  className={`relative mb-12 ${index === versions.length - 1 ? '' : ''}`}
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-[41px] rounded-full border-4 border-background ${index === 0 ? 'bg-primary' : 'bg-muted-foreground'} w-6 h-6`} />
                  
                  {/* Version header */}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">Version {version.version}</h3>
                      <div className="text-sm text-muted-foreground">
                        Released on {formatDate(version.created_at)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2 md:mt-0">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        +{version.xp_earned} XP
                      </Badge>
                      <Badge variant="outline" className={version.roi_change > 0 ? "bg-green-100 text-green-800" : ""}>
                        ROI +{version.roi_change}%
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Changes list */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2">Changes in this version:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {version.changes.map((change: string, i: number) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Metrics comparison */}
                  <div className="bg-muted/40 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3">Performance Metrics:</h4>
                    <div className="space-y-4">
                      {version.improvements.map((improvement: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>{improvement.metric}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{improvement.previous}</span>
                              <ArrowRight className="h-3 w-3" />
                              <span className="font-medium">{improvement.current}</span>
                            </div>
                          </div>
                          <Progress 
                            value={
                              improvement.current === 'N/A' 
                                ? 0 
                                : parseInt(improvement.current.replace(/[^0-9]/g, ''))
                            } 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="versions">
        <TabsList>
          <TabsTrigger value="versions">
            <GitBranch className="h-4 w-4 mr-2" />
            Version Details
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <GitCompare className="h-4 w-4 mr-2" />
            Version Comparison
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <GitMerge className="h-4 w-4 mr-2" />
            Evolution Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Version Details</CardTitle>
              <CardDescription>Detailed information about each version</CardDescription>
            </CardHeader>
            <CardContent>
              {versionsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : (
                <div className="divide-y">
                  {versions.map((version) => (
                    <div key={version.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium">Version {version.version}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Released {new Date(version.created_at).toLocaleDateString()}
                          </Badge>
                          <Button size="sm" variant="outline">View Details</Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                          <h4 className="text-sm font-medium mb-1">XP Earned</h4>
                          <div className="text-xl font-bold">{version.xp_earned}</div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">ROI Improvement</h4>
                          <div className="text-xl font-bold">+{version.roi_change}%</div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Changes</h4>
                          <div className="text-xl font-bold">{version.changes.length}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Version Comparison</CardTitle>
              <CardDescription>Compare metrics between versions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="text-sm font-medium">From Version</label>
                    <select className="w-full p-2 border rounded mt-1">
                      {versions.map(v => (
                        <option key={v.id} value={v.version}>Version {v.version}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="text-sm font-medium">To Version</label>
                    <select className="w-full p-2 border rounded mt-1">
                      {versions.map(v => (
                        <option key={v.id} value={v.version} selected={v.id === versions[0]?.id}>Version {v.version}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button className="w-full">Compare</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Performance Comparison</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Success Rate</h4>
                      <div className="flex items-center gap-4">
                        <div className="w-1/2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Version 1.2.0</span>
                            <span>82%</span>
                          </div>
                          <Progress value={82} className="h-3" />
                        </div>
                        <ArrowRight className="h-4 w-4 flex-shrink-0" />
                        <div className="w-1/2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Version 1.3.0</span>
                            <span>94%</span>
                          </div>
                          <Progress value={94} className="h-3" />
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-green-600">+12%</span> improvement in success rate
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Average Execution Time</h4>
                      <div className="flex items-center gap-4">
                        <div className="w-1/2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Version 1.2.0</span>
                            <span>450ms</span>
                          </div>
                          <Progress value={45} className="h-3" />
                        </div>
                        <ArrowRight className="h-4 w-4 flex-shrink-0" />
                        <div className="w-1/2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Version 1.3.0</span>
                            <span>320ms</span>
                          </div>
                          <Progress value={32} className="h-3" />
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-green-600">-130ms</span> improvement in execution time
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">ROI</h4>
                      <div className="flex items-center gap-4">
                        <div className="w-1/2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Version 1.2.0</span>
                            <span>52%</span>
                          </div>
                          <Progress value={52} className="h-3" />
                        </div>
                        <ArrowRight className="h-4 w-4 flex-shrink-0" />
                        <div className="w-1/2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Version 1.3.0</span>
                            <span>70%</span>
                          </div>
                          <Progress value={70} className="h-3" />
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-green-600">+18%</span> improvement in ROI
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Code Changes</h3>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm">
{`+ // Added dynamic template support
+ const loadDynamicTemplate = async (templateName) => {
+   try {
+     const { data, error } = await supabase
+       .from('templates')
+       .select('content')
+       .eq('name', templateName)
+       .single();
+     
+     if (error) throw error;
+     return data.content;
+   } catch (err) {
+     console.error("Error loading template:", err);
+     return DEFAULT_TEMPLATE;
+   }
+ };
+ 
- // Old static template logic
- const template = DEFAULT_TEMPLATE;
+ // New dynamic template logic
+ const template = await loadDynamicTemplate(input.templateName);`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Evolution Analytics</CardTitle>
              <CardDescription>Trends and patterns in plugin evolution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Total XP Gained</h4>
                    <div className="text-3xl font-bold mt-2">
                      {versions.reduce((sum, v) => sum + v.xp_earned, 0)} XP
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Across {versions.length} versions
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">ROI Growth</h4>
                    <div className="text-3xl font-bold mt-2">
                      +{versions[0]?.improvements[2].current.replace(/[^0-9]/g, '')}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      From initial version
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Performance Improvement</h4>
                    <div className="text-3xl font-bold mt-2">
                      {Math.round((1 - (parseInt(versions[0]?.improvements[1].current) / parseInt(versions[versions.length-1]?.improvements[1].current))) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Execution time reduction
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Evolution Summary</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Success Rate Growth</span>
                      <span>+26%</span>
                    </div>
                    <Progress value={26} max={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Execution Time Improvement</span>
                      <span>53%</span>
                    </div>
                    <Progress value={53} max={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>ROI Enhancement</span>
                      <span>+41%</span>
                    </div>
                    <Progress value={41} max={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Feature Additions</span>
                      <span>12</span>
                    </div>
                    <Progress value={75} max={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Bug Fixes</span>
                      <span>8</span>
                    </div>
                    <Progress value={40} max={100} className="h-2" />
                  </div>
                </div>
              </div>
              
              <div className="bg-card border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Evolution Insights</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Badge className="bg-blue-100 text-blue-800 mt-0.5">Insight</Badge>
                    <span className="text-sm">The most significant performance improvements came after version 1.2.0</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge className="bg-green-100 text-green-800 mt-0.5">Insight</Badge>
                    <span className="text-sm">ROI has steadily increased with each version, showing consistent value growth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge className="bg-purple-100 text-purple-800 mt-0.5">Insight</Badge>
                    <span className="text-sm">The introduction of dynamic templates in v1.3.0 led to the biggest XP gain</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">XP and ROI Correlation</h3>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <div className="text-muted-foreground text-sm">
                    [Graph visualization would be here]
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Strong correlation (0.87) between XP earned and ROI improvements across versions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginEvolutionPage;
