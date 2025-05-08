
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DecisionRecord {
  id: string;
  type: string;
  entity_id: string;
  entity_name?: string;
  decision: string;
  confidence: number;
  reasoning: string;
  created_at: string;
}

const AiDecisions = () => {
  const { tenant } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    if (tenant?.id) {
      fetchDecisions();
    }
  }, [tenant?.id, activeTab]);
  
  const fetchDecisions = async () => {
    setLoading(true);
    
    try {
      // This would be replaced with an actual API call in a real app
      // Simulating a DB query with timeout
      setTimeout(() => {
        const mockDecisions: DecisionRecord[] = [
          {
            id: '1',
            type: 'strategy',
            entity_id: 'strat-1',
            entity_name: 'Q2 Marketing Campaign',
            decision: 'approved',
            confidence: 0.92,
            reasoning: 'High alignment with business goals and good ROI potential',
            created_at: '2025-05-01T14:30:00Z'
          },
          {
            id: '2',
            type: 'plugin',
            entity_id: 'plugin-1',
            entity_name: 'Social Media Scheduler',
            decision: 'optimized',
            confidence: 0.85,
            reasoning: 'Performance improvement based on previous executions',
            created_at: '2025-04-28T09:15:00Z'
          },
          {
            id: '3',
            type: 'agent',
            entity_id: 'agent-1',
            entity_name: 'Content Optimizer Agent',
            decision: 'evolved',
            confidence: 0.78,
            reasoning: 'New version created to fix failure patterns in production',
            created_at: '2025-04-25T16:45:00Z'
          },
        ];
        
        // Filter decisions based on the active tab
        let filtered = mockDecisions;
        if (activeTab !== 'all') {
          filtered = mockDecisions.filter(d => d.type === activeTab);
        }
        
        setDecisions(filtered);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching AI decisions:', err);
      setLoading(false);
    }
  };
  
  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'optimized':
        return <Badge variant="outline">Optimized</Badge>;
      case 'evolved':
        return <Badge variant="secondary">Evolved</Badge>;
      default:
        return <Badge>{decision}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(0)}%`;
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">AI Decisions</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">AI Decisions</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Decisions</TabsTrigger>
          <TabsTrigger value="strategy">Strategies</TabsTrigger>
          <TabsTrigger value="plugin">Plugins</TabsTrigger>
          <TabsTrigger value="agent">Agent Evolution</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Decision Records</CardTitle>
              <CardDescription>
                View AI decisions and the reasoning behind them
              </CardDescription>
            </CardHeader>
            <CardContent>
              {decisions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No AI decisions found for this category</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {decisions.map(decision => (
                      <TableRow key={decision.id}>
                        <TableCell>{decision.entity_name || decision.entity_id}</TableCell>
                        <TableCell className="capitalize">{decision.type}</TableCell>
                        <TableCell>{getDecisionBadge(decision.decision)}</TableCell>
                        <TableCell>{formatConfidence(decision.confidence)}</TableCell>
                        <TableCell>{formatDate(decision.created_at)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiDecisions;
