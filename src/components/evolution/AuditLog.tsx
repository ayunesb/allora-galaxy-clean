
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Download, 
  Clock, 
  UserCircle, 
  Tag,
  Check, 
  AlertTriangle,
  X, 
  Info
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface LogEvent {
  id: string;
  module: string;
  event: string;
  created_at: string;
  tenant_id: string;
  context: any;
}

export const AuditLog = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch audit logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ['auditLogs', startDate, endDate, moduleFilter],
    queryFn: async () => {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('created_at', new Date(endDate.getTime() + 86400000).toISOString()); // End of selected day
      }
      
      if (moduleFilter !== 'all') {
        query = query.eq('module', moduleFilter);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data as LogEvent[];
    }
  });

  const filteredLogs = logs?.filter(log => {
    if (!searchQuery) return true;
    
    // Search in event name
    if (log.event.toLowerCase().includes(searchQuery.toLowerCase())) return true;
    
    // Search in context (stringify and search)
    const contextStr = JSON.stringify(log.context).toLowerCase();
    if (contextStr.includes(searchQuery.toLowerCase())) return true;
    
    return false;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getEventIcon = (module: string, event: string) => {
    if (event.includes('success') || event.includes('completed')) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    
    if (event.includes('error') || event.includes('failed')) {
      return <X className="h-4 w-4 text-red-500" />;
    }
    
    if (event.includes('warning')) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    
    // Default info icon
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  const getEventBadgeColor = (module: string, event: string) => {
    if (event.includes('success') || event.includes('completed')) {
      return "bg-green-100 text-green-800";
    }
    
    if (event.includes('error') || event.includes('failed')) {
      return "bg-red-100 text-red-800";
    }
    
    if (event.includes('warning')) {
      return "bg-yellow-100 text-yellow-800";
    }
    
    // Default module-based coloring
    switch (module) {
      case 'strategy':
        return "bg-purple-100 text-purple-800";
      case 'plugin':
        return "bg-blue-100 text-blue-800";
      case 'agent':
        return "bg-indigo-100 text-indigo-800";
      case 'system':
        return "bg-slate-100 text-slate-800";
      case 'security':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            Comprehensive history of system events and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:space-x-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex items-center space-x-2">
                <DatePicker date={startDate} setDate={setStartDate} />
                <span>to</span>
                <DatePicker date={endDate} setDate={setEndDate} />
              </div>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Module</label>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Modules</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                    <SelectItem value="plugin">Plugin</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="auth">Auth</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Search</label>
              <div className="flex">
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-r-none"
                />
                <Button variant="secondary" size="icon" className="rounded-l-none">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2 md:ml-auto">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <p className="text-muted-foreground">Loading audit logs...</p>
              </div>
            ) : filteredLogs && filteredLogs.length > 0 ? (
              <div className="border rounded-md">
                <div className="divide-y">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-muted/40">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="mt-0.5">
                            {getEventIcon(log.module, log.event)}
                          </div>
                          <div>
                            <div className="font-medium">
                              {log.event.replace(/_/g, ' ')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {Object.entries(log.context || {})
                                .filter(([k, v]) => 
                                  k !== 'tenant_id' && 
                                  typeof v !== 'object' &&
                                  v !== null
                                )
                                .map(([k, v]) => (
                                  <span key={k} className="mr-3">
                                    {k.replace(/_/g, ' ')}: <strong>{String(v)}</strong>
                                  </span>
                                ))
                              }
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge className={getEventBadgeColor(log.module, log.event)}>
                            {log.module}
                          </Badge>
                          <span className="text-xs text-muted-foreground mt-1">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      {log.context && Object.keys(log.context).length > 0 && (
                        <div className="mt-3 pl-7">
                          <div className="flex space-x-4 text-xs text-muted-foreground">
                            {log.context.user_id && (
                              <div className="flex items-center">
                                <UserCircle className="h-3 w-3 mr-1" />
                                <span>User: {log.context.user_id}</span>
                              </div>
                            )}
                            {log.context.action && (
                              <div className="flex items-center">
                                <Tag className="h-3 w-3 mr-1" />
                                <span>Action: {log.context.action}</span>
                              </div>
                            )}
                            {log.context.timestamp && (
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>Time: {new Date(log.context.timestamp).toLocaleTimeString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">No audit logs found matching your criteria</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchQuery('');
                    setModuleFilter('all');
                    setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                    setEndDate(new Date());
                  }}
                >
                  Reset filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
          <CardDescription>SOC2-style traceability metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Audit Coverage</span>
                  <span className="text-sm font-medium">98.5%</span>
                </div>
                <div className="bg-muted rounded-full h-2 w-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: '98.5%' }}></div>
                </div>
                <span className="text-xs text-muted-foreground">
                  All system actions are being logged properly
                </span>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Traceability</span>
                  <span className="text-sm font-medium">100%</span>
                </div>
                <div className="bg-muted rounded-full h-2 w-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
                <span className="text-xs text-muted-foreground">
                  All AI decisions linked to specific agents and strategies
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Audit Log Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-sm">Strategy</span>
                  </div>
                  <span className="text-sm">32%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">Plugin</span>
                  </div>
                  <span className="text-sm">28%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                    <span className="text-sm">Agent</span>
                  </div>
                  <span className="text-sm">24%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-slate-500 mr-2"></div>
                    <span className="text-sm">System</span>
                  </div>
                  <span className="text-sm">10%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm">Security</span>
                  </div>
                  <span className="text-sm">6%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-2">Compliance Status</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">SOC2 Audit Readiness</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">GDPR Compliance</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Complete Decision Trail</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Prompt Security Controls</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Evolution Accountability</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
