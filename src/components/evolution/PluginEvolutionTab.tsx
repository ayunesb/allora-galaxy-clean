
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GitBranch, GitCommit, GitMerge, ArrowUpRight } from 'lucide-react';

export const PluginEvolutionTab = () => {
  // This is a simplified version, you would fetch actual plugin evolution data
  // from Supabase in a real implementation
  
  const pluginEvolutions = [
    {
      id: "1",
      plugin_name: "Email Marketing Automation",
      current_version: "2.3.0",
      last_evolved: "2023-04-12T15:30:00Z",
      agents: 3,
      xp_gained: 245,
      roi_impact: 18,
      evolution_path: [
        { version: "1.0.0", date: "2023-01-15T10:00:00Z", changes: 0 },
        { version: "1.1.0", date: "2023-02-01T14:20:00Z", changes: 4 },
        { version: "2.0.0", date: "2023-02-28T09:15:00Z", changes: 12 },
        { version: "2.1.0", date: "2023-03-15T11:30:00Z", changes: 6 },
        { version: "2.2.0", date: "2023-03-30T16:45:00Z", changes: 5 },
        { version: "2.3.0", date: "2023-04-12T15:30:00Z", changes: 8 },
      ]
    },
    {
      id: "2",
      plugin_name: "Lead Generation Assistant",
      current_version: "3.5.2",
      last_evolved: "2023-04-10T09:45:00Z",
      agents: 5,
      xp_gained: 310,
      roi_impact: 24,
      evolution_path: [
        { version: "1.0.0", date: "2023-01-10T10:00:00Z", changes: 0 },
        { version: "2.0.0", date: "2023-01-25T12:15:00Z", changes: 9 },
        { version: "3.0.0", date: "2023-02-15T14:20:00Z", changes: 14 },
        { version: "3.5.0", date: "2023-03-05T16:30:00Z", changes: 7 },
        { version: "3.5.1", date: "2023-03-20T10:45:00Z", changes: 2 },
        { version: "3.5.2", date: "2023-04-10T09:45:00Z", changes: 3 },
      ]
    },
    {
      id: "3",
      plugin_name: "Social Media Manager",
      current_version: "1.2.0",
      last_evolved: "2023-04-05T13:20:00Z",
      agents: 2,
      xp_gained: 125,
      roi_impact: 12,
      evolution_path: [
        { version: "1.0.0", date: "2023-03-01T10:00:00Z", changes: 0 },
        { version: "1.1.0", date: "2023-03-20T11:30:00Z", changes: 5 },
        { version: "1.2.0", date: "2023-04-05T13:20:00Z", changes: 7 },
      ]
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pluginEvolutions.map((plugin) => (
          <Card key={plugin.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium">{plugin.plugin_name}</CardTitle>
                <Badge>v{plugin.current_version}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Last evolved on {formatDate(plugin.last_evolved)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <div>
                  <div className="font-medium">Agent Versions</div>
                  <div className="text-2xl font-bold">{plugin.agents}</div>
                </div>
                <div>
                  <div className="font-medium">XP Gained</div>
                  <div className="text-2xl font-bold">{plugin.xp_gained}</div>
                </div>
                <div>
                  <div className="font-medium">ROI Impact</div>
                  <div className="text-2xl font-bold flex items-center">
                    +{plugin.roi_impact}%
                    <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Evolution Path</span>
                  <span className="text-xs text-muted-foreground">
                    {plugin.evolution_path.length} versions
                  </span>
                </div>
                <div className="relative h-16">
                  <div className="absolute inset-0 flex items-center">
                    <div className="h-0.5 w-full bg-muted"></div>
                  </div>
                  
                  {plugin.evolution_path.map((version, index) => {
                    // Calculate position based on time
                    const firstDate = new Date(plugin.evolution_path[0].date).getTime();
                    const lastDate = new Date(plugin.evolution_path[plugin.evolution_path.length - 1].date).getTime();
                    const currentDate = new Date(version.date).getTime();
                    
                    // Calculate position as percentage
                    const range = lastDate - firstDate;
                    const position = range !== 0 
                      ? ((currentDate - firstDate) / range) * 100 
                      : 0;
                    
                    // Determine icon based on version
                    let VersionIcon = GitCommit;
                    if (version.version.endsWith(".0.0")) {
                      VersionIcon = GitMerge;
                    } else if (version.version.split(".")[2] === "0") {
                      VersionIcon = GitBranch;
                    }
                    
                    return (
                      <div 
                        key={version.version}
                        className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                        style={{ left: `${position}%` }}
                      >
                        <div className="flex h-8 items-center justify-center">
                          <VersionIcon 
                            className={`h-5 w-5 ${
                              index === plugin.evolution_path.length - 1 
                                ? 'text-primary' 
                                : 'text-muted-foreground'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          v{version.version}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Performance</span>
                  <span className="text-xs text-muted-foreground">
                    Compared to initial version
                  </span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plugin Evolution Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-sm font-medium">Total Major Versions</span>
              <div className="text-2xl font-bold">12</div>
              <span className="text-xs text-muted-foreground">
                Across all plugins
              </span>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm font-medium">Average XP per Plugin</span>
              <div className="text-2xl font-bold">226.6</div>
              <span className="text-xs text-green-500 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +24% this month
              </span>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm font-medium">Evolution Frequency</span>
              <div className="text-2xl font-bold">8.3 days</div>
              <span className="text-xs text-muted-foreground">
                Average time between versions
              </span>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm font-medium">Avg. Performance Gain</span>
              <div className="text-2xl font-bold">18%</div>
              <span className="text-xs text-green-500 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Per evolution cycle
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
