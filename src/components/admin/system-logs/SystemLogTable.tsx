import React, { useState, useCallback } from 'react';
import { SystemLog } from '@/types/logs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatRelativeDate } from '@/lib/utils/date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { VirtualizedTable } from '@/components/ui/virtualized-list';

interface SystemLogTableProps {
  logs: SystemLog[];
  onSelectLog: (log: SystemLog) => void;
  isLoading?: boolean;
}

const SystemLogTable: React.FC<SystemLogTableProps> = ({ logs, onSelectLog, isLoading }) => {
  const [rowHeight, setRowHeight] = useState(50);

  const renderRow = useCallback(
    (log: SystemLog) => (
      <TableRow key={log.id}>
        <TableCell className="font-medium">{log.module}</TableCell>
        <TableCell>{log.event}</TableCell>
        <TableCell>
          <Badge variant="secondary">{log.level}</Badge>
        </TableCell>
        <TableCell>{formatRelativeDate(log.created_at)}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm" onClick={() => onSelectLog(log)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
        </TableCell>
      </TableRow>
    ),
    [onSelectLog]
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Module</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Timestamp</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              Loading logs...
            </TableCell>
          </TableRow>
        ) : logs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              No logs found.
            </TableCell>
          </TableRow>
        ) : (
          <VirtualizedTable
            data={logs}
            renderRow={renderRow}
            rowHeight={rowHeight}
          />
        )}
      </TableBody>
    </Table>
  );
};

export default SystemLogTable;
