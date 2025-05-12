
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { AgentVersion } from '@/types/plugin';

interface AgentEvolutionTabProps {
  pluginId: string;
}

const AgentEvolutionTab: React.FC<AgentEvolutionTabProps> = ({ pluginId }) => {
  const [versions, setVersions] = useState<AgentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const { data, error } = await supabase
          .from('agent_versions')
          .select('*')
          .eq('plugin_id', pluginId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setVersions(data || []);
      } catch (err: any) {
        console.error('Error fetching agent versions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVersions();
  }, [pluginId]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Versions</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No agent versions have been created yet.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {versions.map((version, index) => (
        <VersionCard 
          key={version.id} 
          version={version} 
          isLatest={index === 0}
        />
      ))}
    </div>
  );
};

interface VersionCardProps {
  version: AgentVersion;
  isLatest: boolean;
}

const VersionCard: React.FC<VersionCardProps> = ({ version, isLatest }) => {
  return (
    <Card className={isLatest ? "border-primary" : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle>Version {version.version}</CardTitle>
              {isLatest && <Badge>Latest</Badge>}
              <Badge variant={version.status === 'active' ? 'default' : 'secondary'}>
                {version.status}
              </Badge>
            </div>
            <CardDescription>
              Created {version.created_at ? format(new Date(version.created_at), 'PPp') : 'Unknown'}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-500">
              {version.upvotes || 0} Upvotes
            </Badge>
            <Badge variant="outline" className="text-destructive">
              {version.downvotes || 0} Downvotes
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-md p-4 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
          {version.prompt}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentEvolutionTab;
