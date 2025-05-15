
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StrategyVersion } from '@/types/strategy';

interface EvolutionHistoryProps {
  history: StrategyVersion[];
  renderUser: (userId: string | undefined) => React.ReactNode;
  formatDate: (date: string) => string;
}

const EvolutionHistory: React.FC<EvolutionHistoryProps> = ({ history, renderUser, formatDate }) => {
  // Helper to render the status badge
  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "destructive" | "outline" | "secondary" | "success", label: string }> = {
      approved: { variant: "success", label: "Approved" },
      pending: { variant: "secondary", label: "Pending" },
      rejected: { variant: "destructive", label: "Rejected" },
      draft: { variant: "outline", label: "Draft" }
    };
    
    const statusInfo = statusMap[status] || { variant: "outline", label: status };
    
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolution History</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No version history available for this strategy.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell>v{version.version}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(version.created_at)}</TableCell>
                    <TableCell>{renderStatusBadge(version.status)}</TableCell>
                    <TableCell>{renderUser(version.created_by)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EvolutionHistory;
