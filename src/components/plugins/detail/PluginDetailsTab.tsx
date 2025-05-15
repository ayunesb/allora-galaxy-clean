
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plugin } from '@/types/plugin';

interface PluginDetailsTabProps {
  plugin: Plugin;
}

export const PluginDetailsTab: React.FC<PluginDetailsTabProps> = ({ plugin }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plugin Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Category</h3>
          <p>{plugin.category || 'Uncategorized'}</p>
        </div>
        
        <div>
          <h3 className="font-medium mb-1">Status</h3>
          <Badge variant={plugin.status === 'active' ? 'default' : 'secondary'}>
            {plugin.status}
          </Badge>
        </div>
        
        <div>
          <h3 className="font-medium mb-1">Performance</h3>
          <div className="flex gap-4">
            <div>
              <span className="text-2xl font-bold">{plugin.xp || 0}</span>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </div>
            <div>
              <span className="text-2xl font-bold">{plugin.roi || 0}%</span>
              <p className="text-xs text-muted-foreground">ROI</p>
            </div>
          </div>
        </div>
        
        {plugin.metadata && (
          <div>
            <h3 className="font-medium mb-1">Metadata</h3>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
              {JSON.stringify(plugin.metadata, null, 2)}
            </pre>
          </div>
        )}
        
        <div>
          <h3 className="font-medium mb-1">Created</h3>
          <p>{plugin.created_at ? format(new Date(plugin.created_at), 'PPpp') : 'Unknown'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PluginDetailsTab;
