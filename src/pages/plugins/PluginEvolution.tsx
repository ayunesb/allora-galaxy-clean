
import React from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const PluginEvolution = () => {
  const { id } = useParams<{ id: string }>();
  const { userRole } = useWorkspace();
  const isAdmin = userRole === 'admin' || userRole === 'owner';
  
  // Placeholder data for demonstration
  const evolutionHistory = [
    {
      id: '1',
      version: 'v1.0.0',
      changedAt: '2025-01-15',
      changedBy: 'AI Optimizer',
      reason: 'Initial version',
      xpImprovement: null,
      performanceChange: null
    },
    {
      id: '2',
      version: 'v1.1.0',
      changedAt: '2025-02-01',
      changedBy: 'AI Optimizer',
      reason: 'Performance optimization based on execution metrics',
      xpImprovement: '+15%',
      performanceChange: '+23%'
    },
    {
      id: '3',
      version: 'v1.2.0',
      changedAt: '2025-03-10',
      changedBy: 'John Smith',
      reason: 'Manual adjustment to improve email open rates',
      xpImprovement: '+8%',
      performanceChange: '+12%'
    },
    {
      id: '4',
      version: 'v2.0.0',
      changedAt: '2025-04-05',
      changedBy: 'AI Optimizer',
      reason: 'Major optimization based on user feedback',
      xpImprovement: '+30%',
      performanceChange: '+45%'
    },
  ];
  
  // Placeholder function for demo
  const handleCompareVersions = (id1: string, id2: string) => {
    console.log(`Comparing versions: ${id1} and ${id2}`);
    // Implementation would go here
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Plugin Evolution History</h1>
          <p className="text-muted-foreground">See how this plugin has evolved over time</p>
        </div>
        
        {isAdmin && (
          <Button>Trigger Evolution</Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Evolution Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {evolutionHistory.map((version, index) => (
              <div key={version.id} className="relative">
                {/* Timeline connector */}
                {index < evolutionHistory.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-muted-foreground/20"></div>
                )}
                
                <div className="flex items-start gap-4">
                  {/* Version badge */}
                  <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 z-10">
                    {index + 1}
                  </div>
                  
                  {/* Version details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{version.version}</h3>
                        <p className="text-sm text-muted-foreground">
                          {version.changedAt} by {version.changedBy}
                        </p>
                      </div>
                      
                      <Badge variant={version.changedBy === 'AI Optimizer' ? 'secondary' : 'outline'}>
                        {version.changedBy === 'AI Optimizer' ? 'Auto' : 'Manual'}
                      </Badge>
                    </div>
                    
                    <p>{version.reason}</p>
                    
                    {(version.xpImprovement || version.performanceChange) && (
                      <div className="flex gap-4 pt-2">
                        {version.xpImprovement && (
                          <div>
                            <p className="text-sm font-medium">XP Improvement</p>
                            <p className="text-green-600 font-medium">{version.xpImprovement}</p>
                          </div>
                        )}
                        
                        {version.performanceChange && (
                          <div>
                            <p className="text-sm font-medium">Performance Change</p>
                            <p className="text-green-600 font-medium">{version.performanceChange}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {index > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCompareVersions(version.id, evolutionHistory[index - 1].id)}
                      >
                        Compare to Previous
                      </Button>
                    )}
                  </div>
                </div>
                
                {index < evolutionHistory.length - 1 && (
                  <Separator className="my-6" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginEvolution;
