
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StrategyStatusBadge, StrategyDescription, StrategyMetadata, StrategyTags } from './components';
import { useStrategyData } from './hooks/useStrategyData';
import { formatDate, formatUser } from './helpers/formatHelper';

interface StrategyDetailsProps {
  strategyId: string;
}

const StrategyDetails: React.FC<StrategyDetailsProps> = ({ strategyId }) => {
  const { strategy, loading, error, createdByUser, approvedByUser } = useStrategyData(strategyId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-64" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load strategy details: {error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!strategy) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Strategy Selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please select a strategy to view its details.</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare metadata items for the strategy
  const metadataItems = [
    { label: 'Status', value: strategy.status },
    ...(strategy.priority ? [{ label: 'Priority', value: <span className="capitalize">{strategy.priority}</span> }] : []),
    { label: 'Created By', value: formatUser(createdByUser || strategy.created_by) },
    { label: 'Created At', value: formatDate(strategy.created_at) },
    ...(strategy.approved_by ? [
      { label: 'Approved By', value: formatUser(approvedByUser || strategy.approved_by) },
      { label: 'Approved At', value: formatDate(strategy.approved_at) }
    ] : []),
    ...(strategy.completion_percentage !== undefined ? [
      { label: 'Completion', value: `${strategy.completion_percentage}%` }
    ] : []),
    ...(strategy.due_date ? [
      { label: 'Due Date', value: formatDate(strategy.due_date) }
    ] : [])
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{strategy.title}</CardTitle>
        <StrategyStatusBadge status={strategy.status} />
      </CardHeader>
      <CardContent className="space-y-6">
        <StrategyDescription description={strategy.description} />
        <StrategyMetadata metadataItems={metadataItems} />
        <StrategyTags tags={strategy.tags} />
      </CardContent>
    </Card>
  );
};

export default StrategyDetails;
