
import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AiDecisions() {
  const { tenant } = useWorkspace();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [decisionType, setDecisionType] = useState<string | null>(null);

  useEffect(() => {
    if (tenant?.id) {
      fetchAiDecisions();
    }
  }, [tenant?.id, decisionType]);

  const fetchAiDecisions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('ai_decisions')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false });

      if (decisionType) {
        query = query.eq('decision_type', decisionType);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      
      setDecisions(data || []);
    } catch (error) {
      console.error('Error fetching AI decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDecisionTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'agent_evolution':
        return 'bg-blue-100 text-blue-800';
      case 'content_moderation':
        return 'bg-amber-100 text-amber-800';
      case 'strategy_approval':
        return 'bg-green-100 text-green-800';
      case 'risk_assessment':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDecisions = decisions.filter(decision => {
    if (!filter) return true;
    const searchLower = filter.toLowerCase();
    return (
      decision.decision_type?.toLowerCase().includes(searchLower) ||
      decision.context?.toLowerCase().includes(searchLower) ||
      decision.rationale?.toLowerCase().includes(searchLower) ||
      decision.outcome?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto py-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Decisions</h1>
        <Button onClick={fetchAiDecisions}>Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Filter Decisions</CardTitle>
            <Badge variant="outline">{filteredDecisions.length} decisions found</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="Search decisions..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Select value={decisionType || ''} onValueChange={(value) => setDecisionType(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="agent_evolution">Agent Evolution</SelectItem>
                <SelectItem value="content_moderation">Content Moderation</SelectItem>
                <SelectItem value="strategy_approval">Strategy Approval</SelectItem>
                <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDecisions.length > 0 ? (
        <div className="grid gap-4">
          {filteredDecisions.map((decision) => (
            <Card key={decision.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <span>{decision.description || 'AI Decision'}</span>
                      <Badge className={`ml-2 ${getDecisionTypeColor(decision.decision_type)}`}>
                        {decision.decision_type}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {new Date(decision.created_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge variant={decision.outcome === 'approved' ? 'success' : decision.outcome === 'rejected' ? 'destructive' : 'outline'}>
                    {decision.outcome}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Context</h4>
                  <p className="text-sm text-muted-foreground">{decision.context}</p>
                </div>
                <div>
                  <h4 className="font-medium">Rationale</h4>
                  <p className="text-sm text-muted-foreground">{decision.rationale}</p>
                </div>
                {decision.metadata && (
                  <div>
                    <h4 className="font-medium">Additional Details</h4>
                    <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                      {JSON.stringify(decision.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No AI decisions found matching your criteria.</p>
            <Button variant="outline" onClick={fetchAiDecisions}>Refresh</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
