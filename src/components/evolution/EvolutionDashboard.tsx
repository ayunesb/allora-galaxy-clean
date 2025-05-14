
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AuditLog from './AuditLog';
import { SystemLog } from '@/types/logs';
import { EvolutionFilter } from '@/types/evolution';
import { supabase } from '@/lib/supabase';
import { useNotify } from '@/lib/notifications/toast';

export function EvolutionDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const notify = useNotify();
  const [evolutionMetrics, setEvolutionMetrics] = useState({
    totalStrategies: 0,
    activeAgents: 0,
    recentEvolutions: 0,
    averageImprovement: 0,
  });

  useEffect(() => {
    // Fetch evolution metrics
    const fetchMetrics = async () => {
      try {
        // In a real app, these would be proper DB queries
        const { data: strategies, error: strategiesError } = await supabase
          .from('strategies')
          .select('count');
        
        const { data: agents, error: agentsError } = await supabase
          .from('agent_versions')
          .select('count')
          .eq('status', 'active');
        
        if (strategiesError || agentsError) {
          throw new Error('Failed to fetch metrics');
        }
        
        setEvolutionMetrics({
          totalStrategies: strategies?.length || 0,
          activeAgents: agents?.length || 0,
          recentEvolutions: Math.floor(Math.random() * 10), // Placeholder
          averageImprovement: Math.floor(Math.random() * 30) + 5, // Placeholder
        });
      } catch (error) {
        console.error('Error fetching evolution metrics:', error);
        notify.error('Failed to load evolution metrics');
      }
    };
    
    fetchMetrics();
  }, []);

  // Function to fetch audit logs
  const fetchAuditLogs = async (filter: EvolutionFilter): Promise<SystemLog[]> => {
    try {
      // Start building the query
      let query = supabase.from('system_logs').select('*');
      
      // Apply filters
      if (filter.searchTerm) {
        query = query.or(`event.ilike.%${filter.searchTerm}%,context.ilike.%${filter.searchTerm}%`);
      }
      
      if (filter.type) {
        query = query.eq('module', filter.type);
      }
      
      if (filter.dateRange?.from) {
        query = query.gte('created_at', filter.dateRange.from.toISOString());
      }
      
      if (filter.dateRange?.to) {
        query = query.lte('created_at', filter.dateRange.to.toISOString());
      }
      
      // Execute query
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SystemLog[];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      notify.error('Failed to load audit logs');
      return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Evolution Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor AI agent evolution and system performance
          </p>
        </div>
        <Button>Generate Evolution Report</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Strategies"
          value={evolutionMetrics.totalStrategies.toString()}
          description="Active strategy templates"
        />
        <MetricCard
          title="Active Agents"
          value={evolutionMetrics.activeAgents.toString()}
          description="Deployed agent versions"
        />
        <MetricCard
          title="Recent Evolutions"
          value={evolutionMetrics.recentEvolutions.toString()}
          description="Last 30 days"
        />
        <MetricCard
          title="Avg. Improvement"
          value={`${evolutionMetrics.averageImprovement}%`}
          description="Performance gain per evolution"
        />
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-none md:flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Evolution</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="overview" className="space-y-4">
            <p className="text-muted-foreground">
              The Overview dashboard shows a high-level summary of your AI system's evolution over time.
              Select different tabs to dive deeper into specific aspects.
            </p>
            {/* Overview content would go here */}
          </TabsContent>
          
          <TabsContent value="agents" className="space-y-4">
            <p className="text-muted-foreground">
              Track the performance and evolution history of your AI agents.
            </p>
            {/* Agent evolution content would go here */}
          </TabsContent>
          
          <TabsContent value="logs">
            <AuditLog onFetchData={fetchAuditLogs} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
}

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default EvolutionDashboard;
