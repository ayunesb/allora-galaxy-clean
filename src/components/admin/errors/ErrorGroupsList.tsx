
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Info } from 'lucide-react';
import type { LogGroup } from '@/types/logs';

interface ErrorGroupsListProps {
  errorGroups: LogGroup[];
  isLoading: boolean;
  onViewDetails: (errorGroup: LogGroup) => void;
  title?: string;
}

export const ErrorGroupsList: React.FC<ErrorGroupsListProps> = ({
  errorGroups,
  isLoading,
  onViewDetails,
  title = 'Error Groups'
}) => {
  if (isLoading) {
    return <ErrorGroupsListSkeleton />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Error Message</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>First Seen</TableHead>
                <TableHead className="text-right">Occurrences</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No errors found - everything is running smoothly!
                  </TableCell>
                </TableRow>
              ) : (
                errorGroups.map((errorGroup) => (
                  <TableRow key={errorGroup.id}>
                    <TableCell className="max-w-md truncate">
                      {errorGroup.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{errorGroup.module}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(errorGroup.last_seen || Date.now()), 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(errorGroup.first_seen || Date.now()), 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {errorGroup.count}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails(errorGroup)}
                        title="View Details"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const ErrorGroupsListSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <Skeleton className="h-8 w-32" />
    </CardHeader>
    <CardContent className="p-0">
      <div className="space-y-2 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
  </Card>
);

export default ErrorGroupsList;
