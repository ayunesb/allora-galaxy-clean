
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface HistoryItem {
  id: string;
  action: string;
  status: string;
  timestamp: string;
  user_id?: string;
  details?: string;
}

interface EvolutionHistoryProps {
  history: HistoryItem[];
  formatDate: (date: string) => string;
  renderStatusBadge: (status: string) => React.ReactNode;
}

const EvolutionHistory: React.FC<EvolutionHistoryProps> = ({
  history,
  formatDate,
  renderStatusBadge,
}) => {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolution History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No history available for this strategy.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolution History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatDate(item.timestamp)}</TableCell>
                <TableCell>{item.action}</TableCell>
                <TableCell>{renderStatusBadge(item.status)}</TableCell>
                <TableCell>{item.details || 'No details available'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EvolutionHistory;
