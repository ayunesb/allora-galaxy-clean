
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface EvolutionHistoryProps {
  history: any[];
  formatDate: (dateStr: string) => string;
  renderUser: (userId: string | undefined) => React.ReactNode;
  renderStatusBadge: (status: string) => React.ReactNode;
}

const EvolutionHistory: React.FC<EvolutionHistoryProps> = ({
  history,
  formatDate,
  renderUser,
  renderStatusBadge
}) => {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolution History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No history found for this strategy
          </p>
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
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.event}</TableCell>
                  <TableCell>{formatDate(event.created_at)}</TableCell>
                  <TableCell>{event.description || 'N/A'}</TableCell>
                  <TableCell>
                    {event.context?.status && renderStatusBadge(event.context.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvolutionHistory;
