
import React, { useState } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ErrorGroup, SystemLog } from '@/types/logs';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';

interface ErrorGroupsListProps {
  errorGroups: ErrorGroup[];
  isLoading: boolean;
}

const ErrorGroupsList: React.FC<ErrorGroupsListProps> = ({
  errorGroups,
  isLoading
}) => {
  const [selectedError, setSelectedError] = useState<ErrorGroup | SystemLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const handleViewDetails = (error: ErrorGroup | SystemLog) => {
    setSelectedError(error);
    setDetailsOpen(true);
  };
  
  // Get appropriate icon for severity level
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return <AlertCircle className="text-destructive h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="text-amber-500 h-4 w-4" />;
      case 'low':
      default:
        return <Info className="text-blue-500 h-4 w-4" />;
    }
  };
  
  // Get appropriate badge for severity level
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-2">
          <p className="text-center py-8 text-muted-foreground">Loading error groups...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (errorGroups.length === 0) {
    return (
      <Card>
        <CardContent className="p-2">
          <p className="text-center py-8 text-muted-foreground">No errors found.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Format time distance in a user-friendly way
  const formatTimeDistance = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              {errorGroups.map((group) => (
                <TableRow key={group.id} className="group hover:bg-muted/50">
                  <TableCell className="w-8 p-0 pl-4">
                    {getSeverityIcon(group.severity)}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-medium truncate max-w-xs">{group.message}</div>
                    <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                      <span>Module: {group.module}</span>
                      <span>•</span>
                      <span>Type: {group.errorType}</span>
                      <span>•</span>
                      <span>Count: {group.count}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    First seen: {formatTimeDistance(group.firstSeen)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    Last seen: {formatTimeDistance(group.lastSeen)}
                  </TableCell>
                  <TableCell className="w-28">
                    {getSeverityBadge(group.severity)}
                  </TableCell>
                  <TableCell className="w-12">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleViewDetails(group)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Only render the dialog if the selected error is a SystemLog */}
      {selectedError && 'created_at' in selectedError && (
        <LogDetailDialog
          log={selectedError}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </>
  );
};

export default ErrorGroupsList;
