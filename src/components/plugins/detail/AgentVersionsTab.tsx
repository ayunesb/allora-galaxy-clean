
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Code2, Terminal } from 'lucide-react';
import { AgentVersion } from '@/types/plugin';
import { format } from 'date-fns';

interface AgentVersionsTabProps {
  versions: AgentVersion[];
}

export const AgentVersionsTab: React.FC<AgentVersionsTabProps> = ({ versions }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Versions</CardTitle>
        <CardDescription>
          Version history of the agent implementation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No agent versions found
          </p>
        ) : (
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div key={version.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Badge variant={version.status === 'active' ? 'default' : 'secondary'}>
                      {version.status}
                    </Badge>
                    <span className="ml-2 font-medium">Version {version.version}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {version.created_at ? format(new Date(version.created_at), 'PP') : 'Unknown date'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-green-500">
                        {version.upvotes || 0} Upvotes
                      </Badge>
                      <Badge variant="outline" className="text-destructive">
                        {version.downvotes || 0} Downvotes
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="relative">
                  <div className="bg-muted rounded-md p-3 text-xs font-mono overflow-x-auto">
                    <Code2 className="absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
                    <p className="whitespace-pre-wrap">{version.prompt}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <Terminal className="mr-1 h-3 w-3" /> Test
                  </Button>
                </div>
                
                {index < versions.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div className="border-l-2 h-8"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentVersionsTab;
