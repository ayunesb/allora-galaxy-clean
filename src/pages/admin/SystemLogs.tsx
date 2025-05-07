
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const SystemLogs: React.FC = () => {
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['system_logs', moduleFilter],
    queryFn: async () => {
      let query = supabase
        .from('system_logs')
        .select(`*`)
        .order('created_at', { ascending: false });
        
      if (moduleFilter !== 'all') {
        query = query.eq('module', moduleFilter);
      }
      
      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Module badge renderer
  const renderModuleBadge = (module: string) => {
    switch (module) {
      case 'strategy':
        return <Badge className="bg-blue-500">Strategy</Badge>;
      case 'plugin':
        return <Badge className="bg-purple-500">Plugin</Badge>;
      case 'agent':
        return <Badge className="bg-green-500">Agent</Badge>;
      case 'auth':
        return <Badge className="bg-yellow-500">Auth</Badge>;
      case 'billing':
        return <Badge className="bg-orange-500">Billing</Badge>;
      default:
        return <Badge variant="outline">{module}</Badge>;
    }
  };

  // Toggle expanded log
  const toggleExpand = (id: string) => {
    if (expandedLogId === id) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">System Logs</h1>
      <p className="text-muted-foreground mt-2">View system activity logs</p>
      
      <div className="flex justify-between items-center my-6">
        <div className="flex items-center gap-3">
          <span className="text-sm">Filter by module:</span>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="strategy">Strategy</SelectItem>
              <SelectItem value="plugin">Plugin</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="auth">Auth</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : logs && logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="py-3 px-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {renderModuleBadge(log.module)}
                    <CardTitle className="text-base">
                      {log.event}
                    </CardTitle>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </div>
                </div>
              </CardHeader>
              {log.context && (
                <CardContent className="pt-0 px-4 pb-3">
                  <Collapsible open={expandedLogId === log.id}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-sm justify-between" 
                        onClick={() => toggleExpand(log.id)}
                      >
                        <span>Context</span>
                        {expandedLogId === log.id ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-3 bg-muted rounded-md mt-2 overflow-x-auto">
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No logs found</p>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;
