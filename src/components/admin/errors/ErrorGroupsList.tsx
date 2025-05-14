
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogGroup } from '@/types/logs';

interface ErrorGroupsListProps {
  errorGroups: LogGroup[];
  onViewDetails: (logGroupId: string) => void;
  isLoading?: boolean;
}

const ErrorGroupsList: React.FC<ErrorGroupsListProps> = ({
  errorGroups,
  onViewDetails,
  isLoading = false
}) => {
  const groupByErrorType = (logs: LogGroup[]) => {
    return logs.reduce((groups: Record<string, LogGroup[]>, log) => {
      const message = log.message || 'Unknown Error';
      if (!groups[message]) {
        groups[message] = [];
      }
      groups[message].push(log);
      return groups;
    }, {});
  };

  const groupedErrors = groupByErrorType(errorGroups);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Groups</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedErrors).length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No error groups found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Error Message</TableHead>
                <TableHead className="w-[100px] text-right">Count</TableHead>
                <TableHead className="w-[150px]">Last Occurrence</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedErrors).map(([errorType, logs]) => (
                <TableRow key={errorType}>
                  <TableCell className="font-medium">{errorType}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      {logs.reduce((sum, log) => sum + log.count, 0)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(logs[0].lastOccurred).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDetails(logs[0].id)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorGroupsList;
