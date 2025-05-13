
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAiDecisionsData } from '@/hooks/admin/useAiDecisions';
import { AiDecisionsList, AiDecisionDetail } from '@/components/admin/ai-decisions';
import { AiDecision } from '@/components/admin/ai-decisions/types';
import { Button } from '@/components/ui/button';
import { Sliders, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AiDecisionsPage: React.FC = () => {
  const { decisions, isLoading, refetch } = useAiDecisionsData();
  const [selectedDecision, setSelectedDecision] = useState<AiDecision | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter decisions based on search query and filters
  const filteredDecisions = decisions.filter(decision => {
    // Search query filter
    const matchesSearch = searchQuery === '' || 
      decision.decision_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = typeFilter === 'all' || decision.decision_type === typeFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'reviewed' && decision.reviewed) ||
      (statusFilter === 'not_reviewed' && !decision.reviewed) ||
      (statusFilter === 'approved' && decision.review_outcome === 'approved') ||
      (statusFilter === 'rejected' && decision.review_outcome === 'rejected') ||
      (statusFilter === 'modified' && decision.review_outcome === 'modified');
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewDecision = (decision: AiDecision) => {
    setSelectedDecision(decision);
    setDetailOpen(true);
  };

  const handleReviewDecision = (decision: AiDecision) => {
    setSelectedDecision(decision);
    // In a real implementation, this would open a review dialog
    console.log("Review decision:", decision);
  };

  // Get unique decision types for filter dropdown
  const decisionTypes = ['all', ...new Set(decisions.map(d => d.decision_type))];

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center">
          <PageHeader
            title="AI Decisions"
            description="Track and audit automated decisions made by the AI"
          />
          <Button onClick={refetch} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Search decisions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Decision Type" />
                </SelectTrigger>
                <SelectContent>
                  {decisionTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="not_reviewed">Not Reviewed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="modified">Modified</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Sliders className="h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
              <p className="text-center py-8">Loading AI decisions...</p>
            ) : filteredDecisions.length > 0 ? (
              <AiDecisionsList
                decisions={filteredDecisions}
                isLoading={isLoading}
                onViewDecision={handleViewDecision}
                onReviewDecision={handleReviewDecision}
              />
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                {decisions.length > 0 
                  ? "No decisions match your search criteria."
                  : "No AI decisions logged yet."}
              </p>
            )}
          </CardContent>
        </Card>

        <AiDecisionDetail
          decision={selectedDecision}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </div>
    </AdminLayout>
  );
};

export default AiDecisionsPage;
