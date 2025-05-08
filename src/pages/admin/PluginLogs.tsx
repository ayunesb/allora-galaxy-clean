
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PluginLogItem } from '@/components/plugins/PluginLogItem';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export default function PluginLogs() {
  const { tenant } = useWorkspace();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSuccessOnly, setShowSuccessOnly] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      fetchLogs();
    }
  }, [tenant?.id, statusFilter, showSuccessOnly, sortBy, sortOrder]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('plugin_logs')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      if (showSuccessOnly) {
        query = query.eq('status', 'success');
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching plugin logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!filter) return true;
    const filterLower = filter.toLowerCase();
    return (
      log.plugin_name?.toLowerCase().includes(filterLower) ||
      log.plugin_id?.toLowerCase().includes(filterLower) ||
      log.execution_id?.toLowerCase().includes(filterLower) ||
      log.status?.toLowerCase().includes(filterLower)
    );
  });

  return (
    <div className="container mx-auto py-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Plugin Logs</h1>
        <Button onClick={fetchLogs}>Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Filter Options</CardTitle>
            <Badge variant="outline">{filteredLogs.length} logs found</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Input
                placeholder="Filter by name or ID..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="success-only"
                checked={showSuccessOnly}
                onCheckedChange={(checked) => setShowSuccessOnly(checked === true)}
              />
              <label htmlFor="success-only" className="text-sm">
                Show Success Only
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <PluginLogItem key={log.id} log={log} />
          ))
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No logs found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
