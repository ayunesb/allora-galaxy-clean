
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface HistoryItem {
  id: string;
  version: string;
  timestamp: string;
  author: string;
  changes: string;
  status: 'success' | 'failed' | 'pending';
}

interface EvolutionHistoryProps {
  items?: HistoryItem[];
  isLoading?: boolean;
  title?: string;
}

const EvolutionHistory: React.FC<EvolutionHistoryProps> = ({
  items = [],
  isLoading = false,
  title = "Evolution History"
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[200px]">
          <p className="text-muted-foreground">No history available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Changes</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.version}</TableCell>
                <TableCell>{item.timestamp}</TableCell>
                <TableCell>{item.author}</TableCell>
                <TableCell>{item.changes}</TableCell>
                <TableCell>
                  <Badge variant={
                    item.status === 'success' ? 'success' : 
                    item.status === 'failed' ? 'destructive' : 
                    'outline'
                  }>
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EvolutionHistory;
